import type { Connection, Connector } from '@microsoft/utils-logic-apps';

export interface EnvironmentConfig {
  apiOperationsPath: string;
  connectionProvidersPath: string;
  connectionsPath: string;
  flowsConnectorPath?: string;
  gatewaysPath?: string;
  flowsPath?: string;
}

export interface UrlService {
  deserializeConnectionId(connectionId: string): string;
  getAntaresResourceBaseUri(): string;
  getApiOperationsUrl(apiType: string): string;
  getConfirmConsentCodeUri(connectionId: string): string;
  getConnectionId(connectionName: string, connectorId: string): string;
  getConnectionProvider(): string;
  getConnectionUri(): string;
  getConsentLinkUri(connectionId: string): string;
  getCustomConnectorsUri(): string;

  /**
   * Get the URI to use when making calls for dynamic values.
   * @arg {string} connectorId - The connector ID.
   * @arg {string} operationId - The operation ID.
   * @arg {string} connectionId - The connection ID.
   * @arg {string} runtimeUrl - The runtime URL.
   * @arg {Connection} connection - The connection.
   * @arg {Connector} connector - The connector.
   * @return {string}
   */
  getDynamicCallsUri?(
    connectorId: string,
    operationId: string,
    connectionId: string,
    runtimeUrl: string,
    connection: Connection,
    connector: Connector
  ): string;

  getFlowsConnectorPath(): string;
  getFlowsPath(): string;
  getGatewaysPath(): string;
  getInstallGatewayLink(): string;
  getListConnectionsUri(connectorId: string): string;
  getLocation(): string;
  getQueryForApiOperations(filter: string, apiType: string, apiVersion: string): Record<string, string>;
  getQueryForListConnections(apiVersion: string, apiName?: string): Record<string, string>;
  getResourceGroup(): string;
  getSubscriptionId(): string;
  isDynamicInvokeApiEnabled?(): boolean;
  serializeConnectionId(connectionId: string): string;
}
