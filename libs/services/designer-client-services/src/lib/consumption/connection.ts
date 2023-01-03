// import type {
//   ConnectionCreationInfo,
//   ConnectionParametersMetadata,
//   ConnectorWithSwagger,
//   CreateConnectionResult,
//   IConnectionService,
// } from '../connection';
// import { UrlService } from '../urlservice';
// import type { Connection, Connector } from '@microsoft/utils-logic-apps';
// import { ArgumentException } from '@microsoft/utils-logic-apps';

// export interface ConsumptionConnectionServiceArgs {
//   apiVersion: string;
//   baseUrl?: string;
//   locale?: string;
//   apiVersionForSharedManagedConnector: string;
//   apiVersionForIseManagedConnector: string;
//   apiVersionForCustomConnector: string;
//   apiVersionForConnection: string;
//   apiVersionForGateways: string;
//   batchApiVersion?: string;
//   integrationServiceEnvironmentId?: string;
//   isDynamicInvokeApiEnabled?: boolean;
//   isIntegrationServiceEnvironmentSupported: boolean;
//   workflowReferenceId?: string;
//   location: string;
//   connectionFailureCallback?(error: any): void;
//   showViewPermissionsDialog?(connector: Connector): void;
// }

// export class ConsumptionConnectionService implements IConnectionService {
//   private _connections: Record<string, Connection> = {};
//   private _subscriptionResourceGroupWebUrl = '';
//   private _allConnectionsInitialized = false;
//   constructor(public readonly options: ConsumptionConnectionServiceArgs) {
//     const {
//       baseUrl,
//       apiVersionForConnection,
//       apiVersionForIseManagedConnector,
//       apiVersionForSharedManagedConnector,
//       apiVersionForCustomConnector,
//       apiVersionForGateways,
//     } = options;
//     if (!baseUrl) {
//       throw new ArgumentException('baseUrl required');
//     } else if (!apiVersionForConnection) {
//       throw new ArgumentException('apiVersionForConnection required');
//     } else if (!apiVersionForIseManagedConnector) {
//       throw new ArgumentException('apiVersionForIseManagedConnector required');
//     } else if (!apiVersionForSharedManagedConnector) {
//       throw new ArgumentException('apiVersionForSharedManagedConnector required');
//     } else if (!apiVersionForCustomConnector) {
//       throw new ArgumentException('apiVersionForCustomConnector required');
//     } else if (!apiVersionForGateways) {
//       throw new ArgumentException('apiVersionForGateways required');
//     }
//   }

//   dispose(): void {
//     return;
//   }

//   getConnector(connectorId: string): Promise<Connector> {
//     throw new Error('Method not implemented.');
//   }
//   getConnectorAndSwagger(connectorId: string): Promise<ConnectorWithSwagger> {
//     throw new Error('Method not implemented.');
//   }
//   getSwaggerFromUri(uri: string): Promise<OpenAPIV2.Document> {
//     throw new Error('Method not implemented.');
//   }
//   getConnection(connectionId: string): Promise<Connection> {
//     throw new Error('Method not implemented.');
//   }
//   getConnections(connectorId?: string | undefined): Promise<Connection[]> {
//     throw new Error('Method not implemented.');
//   }
//   createConnection(
//     connectionId: string,
//     connector: Connector,
//     connectionInfo: ConnectionCreationInfo,
//     parametersMetadata?: ConnectionParametersMetadata | undefined
//   ): Promise<Connection> {
//     throw new Error('Method not implemented.');
//   }
//   createAndAuthorizeOAuthConnection(
//     connectionId: string,
//     connectorId: string,
//     connectionInfo: ConnectionCreationInfo,
//     parametersMetadata: ConnectionParametersMetadata
//   ): Promise<CreateConnectionResult> {
//     throw new Error('Method not implemented.');
//   }
//   getUniqueConnectionName(connectorId: string, connectionNames: string[], connectorName: string): Promise<string> {
//     throw new Error('Method not implemented.');
//   }
//   fetchFunctionApps(): Promise<any> {
//     throw new Error('Method not implemented.');
//   }
//   fetchFunctionAppsFunctions(functionAppId: string): Promise<any> {
//     throw new Error('Method not implemented.');
//   }
//   fetchFunctionKey(functionId: string): Promise<any> {
//     throw new Error('Method not implemented.');
//   }

//   init(connections: Connection[]): Connection[] {
//     if (connections) {
//       this._initConnections = connections.map((connection) => {
//         const newConnection = this._copyConnection(connection);
//         return newConnection;
//       });

//       this._initialized = true;
//       return this._initConnections;
//     }

//     return connections;
//   }
// }
