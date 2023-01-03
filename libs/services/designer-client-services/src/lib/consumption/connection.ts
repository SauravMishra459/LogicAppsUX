import type { IHttpClient } from '../httpClient';
import type { IOAuthService } from '../oAuth';
import type { UrlService } from '../urlservice';
import type { Connection, Connector } from '@microsoft/utils-logic-apps';
import { addPrefix, clone, extend, getPropertyValue, ArgumentException } from '@microsoft/utils-logic-apps';

export interface ConsumptionConnectionServiceArgs {
  apiVersion: string;
  baseUrl?: string;
  locale?: string;
  apiVersionForSharedManagedConnector: string;
  apiVersionForIseManagedConnector: string;
  apiVersionForCustomConnector: string;
  apiVersionForConnection: string;
  apiVersionForGateways: string;
  batchApiVersion?: string;
  integrationServiceEnvironmentId?: string;
  isDynamicInvokeApiEnabled?: boolean;
  isIntegrationServiceEnvironmentSupported: boolean;
  workflowReferenceId?: string;
  location: string;
  connectionFailureCallback?(error: any): void;
  showViewPermissionsDialog?(connector: Connector): void;
  httpClient: IHttpClient;
  urlService: UrlService;
  oauthService: IOAuthService;
}

export class ConsumptionConnectionService {
  private _options: ConsumptionConnectionServiceArgs;
  private _client: IHttpClient;
  private _connections: Record<string, Connection> = {};
  private _initialized = false;
  private _oauthService: IOAuthService;

  constructor(public readonly options: ConsumptionConnectionServiceArgs) {
    const {
      baseUrl,
      urlService,
      oauthService,
      apiVersionForConnection,
      apiVersionForIseManagedConnector,
      apiVersionForSharedManagedConnector,
      apiVersionForCustomConnector,
      apiVersionForGateways,
    } = options;
    if (!baseUrl) {
      throw new ArgumentException('baseUrl required');
    } else if (!apiVersionForConnection) {
      throw new ArgumentException('apiVersionForConnection required');
    } else if (!urlService) {
      throw new ArgumentException('url service required');
    } else if (!oauthService) {
      throw new ArgumentException('oauth service required');
    } else if (!apiVersionForIseManagedConnector) {
      throw new ArgumentException('apiVersionForIseManagedConnector required');
    } else if (!apiVersionForSharedManagedConnector) {
      throw new ArgumentException('apiVersionForSharedManagedConnector required');
    } else if (!apiVersionForCustomConnector) {
      throw new ArgumentException('apiVersionForCustomConnector required');
    } else if (!apiVersionForGateways) {
      throw new ArgumentException('apiVersionForGateways required');
    }
    this._options = options;
    this._oauthService = options.oauthService;
    this._client = options.httpClient;
  }

  init(connections: Connection[]): Record<string, Connection> {
    if (connections) {
      connections.forEach((connection) => {
        const newConnection = this._copyConnection(connection);
        this._connections[newConnection.id] = newConnection;
      });

      this._initialized = true;
      return this._connections;
    }

    return connections;
  }

  updateConnectionProviders(connectors: Connector[]): Connector[] {
    let updatedConnectionProviders: Connector[] = [];

    if (connectors) {
      updatedConnectionProviders = connectors.map((connector) => {
        return this._getUpdatedConnectionProvider(connector);
      });
    }

    return updatedConnectionProviders;
  }

  showViewPermissionsDialog(connector: Connector): void {
    if (this._options.showViewPermissionsDialog) {
      this._options.showViewPermissionsDialog(connector);
    } else {
      throw new Error('options.showViewPermissionsDialog required');
    }
  }

  private _getUpdatedConnectionProvider(connector: Connector): Connector {
    let properties = getPropertyValue(connector.properties, 'generalinformation');

    if (properties) {
      const newConnectionProvider = clone(connector);

      properties = getPropertyValue(newConnectionProvider.properties, 'generalinformation');

      // Pushing the general information as first level properties in api provider properties
      if (properties.id) {
        properties.id = addPrefix(properties.id, '/');
      }
      newConnectionProvider.properties = extend(newConnectionProvider.properties, properties);

      return newConnectionProvider;
    }

    return connector;
  }

  private _copyConnection(connection: Connection): Connection {
    const properties = connection.properties,
      parameters = clone(properties.connectionParameters),
      newConnection: Connection = {
        name: connection.name,
        id: connection.id,
        type: connection.type,
        properties: {
          api: properties.api,
          displayName: properties.displayName,
          createdTime: properties.createdTime,
          statuses: properties.statuses,
          createdBy: properties.createdBy,
          overallStatus: properties.overallStatus,
          //   connectionAlternativeParameters: properties.connectionAlternativeParameters,
          connectionParameters: parameters,
          connectionParametersSet: properties.connectionParametersSet,
          testLinks: properties.testLinks,
        },
      };

    return newConnection;
  }

  dispose(): void {
    return;
  }
}
