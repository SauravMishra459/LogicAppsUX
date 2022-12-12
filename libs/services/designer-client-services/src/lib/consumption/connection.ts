// import type { ConsentLink, IConnectionService } from '../connection';
// import type { IOAuthService } from '../oAuth';
// import type { UrlService } from '../urlservice';
// import type { Connection, Connector, ConnectionProperties, HttpRequest } from '@microsoft/utils-logic-apps';
// import { IHttpClient } from '../httpClient';

// export interface ConsentLinkRequest {
//   parameters: ConsentLink[];
// }

// export interface ConfirmConsentCodeRequest {
//   code: string;
//   objectId: string;
//   tenantId: string;
// }

// export interface LogicAppConsentResponse {
//   value: ConsentLink[];
// }

// export interface LogicAppConnection extends Connection {
//   properties: LogicAppConnectionProperties;
// }

// export type LogicAppConnectionProperties =
//   | ConnectionProperties
//   | LogicAppConnectionPropertiesWithParameterValueSet
//   | LogicAppConnectionPropertiesWithParameterValues;

// export interface LogicAppConnectionPropertiesWithParameterValues extends ConnectionProperties {
//   parameterValues: {
//     gateway?: {
//       id: string;
//       name: string;
//       type: string;
//     };
//   };
// }

// export interface LogicAppConnectionPropertiesWithParameterValueSet extends ConnectionProperties {
//   parameterValueSet: {
//     values: {
//       gateway?: {
//         value?: {
//           id: string;
//           name: string;
//           type: string;
//         };
//       };
//     };
//   };
// }

// export interface ConsumptionConnectionServiceArgs {
//   apiVersionForSharedManagedConnector: string;
//   apiVersionForIseManagedConnector: string;
//   apiVersionForCustomConnector: string;
//   apiVersionForConnection: string;
//   apiVersionForGateways: string;
//   batchApiVersion?: string;
//   integrationServiceEnvironmentId?: string;
//   isDynamicInvokeApiEnabled?: boolean;
//   isIntegrationServiceEnvironmentSupported: boolean;
//   oauthService: IOAuthService;
//   urlService: UrlService;
//   workflowReferenceId?: string;
//   location: string;
//   connectionFailureCallback?(error: any): void;
//   showViewPermissionsDialog?(connector: Connector): void;
//   httpClient: IHttpClient;
//   apiVersion: string;
//   baseUrl?: string;
//   getAccessToken(): Promise<string>;
//   locale?: string;
// }

// export class ConsumptionConnectionService implements IConnectionService {
//     private _options: ConsumptionConnectionServiceArgs;

//     private _initConnections: Connection[] = [];
//     private _initialized = false;
//     private _oauthService: IOAuthService;

//     constructor(options: ConsumptionConnectionServiceArgs) {
//         if (!options.baseUrl) {
//             throw new Error('options.baseUrl required');
//         }

//         if (!options.urlService) {
//             throw new Error('url service required');
//         }

//         if (!options.apiVersionForConnection) {
//             throw new Error('options.apiVersionForConnection required');
//         }

//         if (!options.apiVersionForIseManagedConnector) {
//             throw new Error('options.apiVersionForIseManagedConnector required');
//         }

//         if (!options.apiVersionForSharedManagedConnector) {
//             throw new Error('options.apiVersionForSharedManagedConnector required');
//         }

//         if (!options.apiVersionForCustomConnector) {
//             throw new Error('options.apiVersionForCustomConnector required');
//         }

//         if (!options.apiVersionForGateways) {
//             throw new Error('options.apiVersionForGateways required');
//         }

//         if (!options.getAccessToken) {
//             throw new Error('options.getAccessToken required');
//         }

//         if (!options.oauthService) {
//             throw new Error('options.oauthService required');
//         }

//         this._options = options;
//         this._oauthService = options.oauthService;
//     }

//     get oauthService(): IOAuthService {
//         return this._oauthService;
//     }

//     get urlService(): UrlService {
//         return this._options.urlService;
//     }

//     init(connections: Connection[]): Connection[] {
//         if (connections) {
//             this._initConnections = connections.map(connection => {
//                 const newConnection = this._copyConnection(connection);
//                 return newConnection;
//             });

//             this._initialized = true;
//             return this._initConnections;
//         }

//         return connections;
//     }

//     updateConnectionProviders(connectors: Connector[]): Connector[] {
//         let updatedConnectionProviders: Connector[] = [];

//         if (connectors) {
//             updatedConnectionProviders = connectors.map(connector => {
//                 return this._getUpdatedConnectionProvider(connector);
//             });
//         }

//         return updatedConnectionProviders;
//     }

//     showViewPermissionsDialog(connector: Connector): void {
//         if (this._options.showViewPermissionsDialog) {
//             this._options.showViewPermissionsDialog(connector);
//         } else {
//             throw new Error('options.showViewPermissionsDialog required');
//         }
//     }

//     getConnection(id: string, batchable?: boolean): Promise<Connection> {
//         const request:  HttpRequest<any> ={
//             path: id,
//             query: {
//                 'api-version': this._options.apiVersionForConnection,
//             },
//             batch: batchable,
//         };

//         return this._client
//             .get<Connection>(request)
//             .then(response => {
//                 if (response.ok) {
//                     return response.body;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.GET_CONNECTION_FAILED, Resources.CONNECTION_GET_FAILED, {
//                         uri: id,
//                         status: response.status,
//                     });
//                 }
//             })
//             .then(connection => {
//                 return this._convertToConnection(connection);
//             });
//     }

//     getConnections(connectorId?: string, batchable?: boolean): Promise<Connection[]> {
//         // if connections have been initialized, just return from cache
//         if (this._initialized) {
//             let result: Connection[];
//             if (!!connectorId) {
//                 result = this._initConnections.filter(item => equals(item.properties.apiId, connectorId));
//             } else {
//                 result = this._initConnections;
//             }

//             if (result && result.length) {
//                 return Promise.resolve(result);
//             }
//         }

//         const apiName = getApiProviderNameFromId(connectorId);
//         let filter: string;

//         if (this._options.isIntegrationServiceEnvironmentSupported) {
//             if (this._options.integrationServiceEnvironmentId) {
//                 filter = apiName
//                     ? `Location eq '${this._options.location}' and ManagedApiName eq '${apiName}'
//                      and Kind eq 'V1'` // TODO(lakshmia): Add support for this scenario when backend is ready.
//                     : `(${ISE_RESOURCE_ID} eq '${this._options.integrationServiceEnvironmentId}' or ${ISE_RESOURCE_ID} eq null) and Kind eq 'V1'`;
//             } else {
//                 filter = apiName ? `Location eq '${this._options.location}' and ManagedApiName eq '${apiName}' and Kind eq 'V1'` : `${ISE_RESOURCE_ID} eq null and Kind eq 'V1'`;
//             }
//         } else {
//             filter = apiName ? `Location eq '${this._options.location}' and ManagedApiName eq '${apiName}' and Kind eq 'V1'` : `Kind eq 'V1'`;
//         }

//         const query = {
//             $top: 400, // TODO(tonytang): This is to mitigate a CRI. Need to revisit the approach we retrieve connections.
//             'api-version': this._options.apiVersionForConnection,
//             $filter: filter,
//         };

//         let path: string;
//         if (!!connectorId) {
//             path = this.urlService.getListConnectionsUri(connectorId);
//         } else {
//             path = this.urlService.getConnectionUri();
//         }

//         return this._client
//             .get<ArmResources<Connection>>({
//                 cache: true,
//                 path,
//                 query,
//                 batch: batchable,
//             })
//             .then(response => {
//                 if (response.ok) {
//                     if (response.body.nextLink) {
//                         // TODO(tonytang): This is to mitigate a CRI. Need to revisit the approach we retrieve connections.
//                         this._analytics.logWarning('MSLA.LogicAppsConnectionService', 'list connections has next link.', {
//                             count: response.body.value.length,
//                         });
//                     }
//                     return response.body.value;
//                 } else {
//                     const connectionServiceErrorCode = connectorId
//                         ? ConnectionServiceErrorCode.GET_CONNECTIONS_FOR_CONNECTOR_FAILED
//                         : ConnectionServiceErrorCode.GET_CONNECTIONS_FAILED;

//                     this._throwError(response.body, connectionServiceErrorCode, Resources.CONNECTIONS_GET_FAILED, {
//                         uri: path,
//                         status: response.status,
//                     });
//                 }
//             })
//             .then(connections => {
//                 if (connections.length) {
//                     return connections.map(connection => this._convertToConnection(connection));
//                 } else {
//                     return connections;
//                 }
//             });
//     }

//     getConsentUri(connectionId: string, redirectUrl: string, parameterName?: string): Promise<string> {
//         const path: string = this.urlService.getConsentLinkUri(connectionId);

//         return this._options.getAccessToken().then(jwtToken => {
//             const helper = JwtTokenHelper.createInstance(),
//                 tokenObject = helper.extractJwtTokenPayload(jwtToken),
//                 requestBody: ConsentLinkRequest = {
//                     parameters: [
//                         {
//                             objectId: tokenObject[JwtTokenConstants.objectId],
//                             parameterName,
//                             redirectUrl,
//                             tenantId: tokenObject[JwtTokenConstants.tenantId],
//                         },
//                     ],
//                 };

//             return this._client
//                 .post<ConsentLinkRequest, LogicAppConsentResponse>({
//                     body: requestBody,
//                     path,
//                     query: {
//                         'api-version': this._options.apiVersionForConnection,
//                     },
//                 })
//                 .then(response => {
//                     if (response.ok && response.body.value && response.body.value.length > 0) {
//                         return response.body.value[0].link;
//                     } else {
//                         this._throwError(response.body, ConnectionServiceErrorCode.GET_CONSENT_URL_FAILED, Resources.CONNECTION_GET_CONSENT_URI_FAILED, {
//                             connectionId,
//                             uri: redirectUrl,
//                             status: response.status,
//                         });
//                     }
//                 });
//         });
//     }

//     getGatewayName(connection: LogicAppConnection): string | undefined {
//         const { parameterValues, parameterValueSet } = connection.properties;

//         if (parameterValues) {
//             const { gateway } = parameterValues;
//             if (gateway) {
//                 return gateway.name;
//             }
//         } else if (parameterValueSet) {
//             const { gateway } = parameterValueSet.values;
//             if (gateway && gateway.value) {
//                 return gateway.value.name;
//             }
//         }

//         return undefined;
//     }

//     getGateways(apiNameFilter: string): Promise<Gateway[]> {
//         const request: HttpRequest<any> = <HttpRequest<any>>{
//             /* tslint:disable-line: no-any */
//             // TODO(jaden): [#6727891] Change any to Gateways and test
//             path: this.urlService.getGatewaysPath(),
//             query: {
//                 'api-version': this._options.apiVersionForGateways,
//                 $filter: apiNameFilter,
//             },
//         };

//         return this._client
//             .get<ArmResources<Gateway>>(request)
//             .then(response => {
//                 if (response.ok) {
//                     return response.body;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.GET_GATEWAYS_FAILED, Resources.CONNECTION_GET_GATEWAYS_FAILED, {
//                         uri: request.path,
//                         filter: request.query['$filter'],
//                         status: response.status,
//                     });
//                 }
//             })
//             .then(gateways => {
//                 return gateways.value;
//             })
//             .catch(error => {
//                 throw new ConnectionServiceException(
//                     ConnectionServiceErrorCode.GET_GATEWAYS_FAILED,
//                     Resources.CONNECTION_GET_GATEWAYS_FAILED,
//                     {
//                         uri: request.path,
//                         filter: request.query['$filter'],
//                         'api-version': apiNameFilter,
//                     },
//                     error
//                 );
//             });
//     }

//     async getFirstPartyLoginUri(): Promise<string> {
//         throw new NotImplementedException(Resources.METHOD_NOT_IMPLEMENTED);
//     }

//     confirmConsentCode(connectionId: string, code: string): Promise<any> {
//         /* tslint:disable-line: no-any */
//         const path: string = this.urlService.getConfirmConsentCodeUri(connectionId);

//         return this._options.getAccessToken().then(jwtToken => {
//             const helper = JwtTokenHelper.createInstance(),
//                 tokenObject = helper.extractJwtTokenPayload(jwtToken),
//                 requestBody: ConfirmConsentCodeRequest = {
//                     code,
//                     objectId: tokenObject[JwtTokenConstants.objectId],
//                     tenantId: tokenObject[JwtTokenConstants.tenantId],
//                 };

//             return this._client.post<ConfirmConsentCodeRequest, any>({
//                 /* tslint:disable-line: no-any */ body: requestBody,
//                 path,
//                 query: {
//                     'api-version': this._options.apiVersionForConnection,
//                 },
//             });
//         });
//     }

//     async consentFirstPartyConnection(): Promise<HttpResponse<string>> {
//         throw new Error('Method not implemented');
//     }

//     createConnection(id: string, connectorId: string, connectionInfo?: ConnectionInfo, _?: ConnectionParametersMetadata): Promise<Connection> {
//         const request = connectionInfo?.externalAlternativeParameterValues
//             ? this._getRequestForCreateConnectionWithAlternativeParameters(id, connectorId, connectionInfo)
//             : this._getRequestForCreateConnection(id, connectorId, connectionInfo);

//         return this._client
//             .put<void, Connection>(request)
//             .then(response => {
//                 if (response.ok) {
//                     return response.body;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.PUT_CONNECTION_FAILED, Resources.CONNECTION_PUT_FAILED, {
//                         uri: id,
//                         connectorId,
//                         status: response.status,
//                     });
//                 }
//             })
//             .then(connection => {
//                 return this._convertToConnection(connection);
//             });
//     }

//     createDependentConnection(dependentConnectionId: string, dependentConnectorId: string, prerequisiteConnectionId: string, key: string, runtimeUrl: string): Promise<Connection> {
//         return this.createConnection(dependentConnectionId, dependentConnectorId, {
//             connectionParameters: {
//                 [key]: {
//                     connectionId: prerequisiteConnectionId,
//                     url: this._client.pathCombine(runtimeUrl, prerequisiteConnectionId.substr(prerequisiteConnectionId.lastIndexOf('/') + 1)),
//                 },
//             },
//         });
//     }

//     deleteConnection(connectionId: string): Promise<void> {
//         const request = <HttpRequest<any>>{
//             /* tslint:disable-line: no-any */ path: connectionId,
//             query: {
//                 'api-version': this._options.apiVersionForConnection,
//             },
//         };

//         return this._client.delete<Connection>(request).then(response => {
//             if (response.status !== 200) {
//                 this._throwError(response.body, ConnectionServiceErrorCode.DELETE_CONNECTION_FAILED, Resources.CONNECTION_DELETE_FAILED, {
//                     uri: connectionId,
//                     status: response.status,
//                 });
//             }
//         });
//     }

//     /**
//      * Test a connection which may or may contain test links or test requests for this purpose
//      * @arg {Connection} connection - An object with a connection which may or may not contain test links or test requests
//      * @return {Promise<void>}
//      */
//     async testConnection(connection: Connection): Promise<void> {
//         if (connection) {
//             // TODO(sopai): Need to integrate with a proper API that has backend/client side contract agreement. This section includes
//             // hard coding from client side in determining what the inputParameters are and where they need to be assigned to.
//             // For now, if inputParameters exists, we assume that the inputParameter will always be the workflowReference and that it will
//             // need to be placed in a property bag in the body.
//             if (this._options.isDynamicInvokeApiEnabled) {
//                 const testRequests = connection.properties.testRequests;
//                 if (testRequests) {
//                     const testRequest = connection.properties.testRequests[0];
//                     if (testRequest) {
//                         const { method, requestUri: url, body, inputParameters } = testRequest;

//                         if (inputParameters) {
//                             for (const inputParameter of inputParameters) {
//                                 if (equals(inputParameter.path, 'body.properties.workflowReference.id') && equals(inputParameter.type, 'string')) {
//                                     const properties = {
//                                         workflowReference: {
//                                             id: this._options.workflowReferenceId,
//                                         },
//                                     };
//                                     body.properties = properties;
//                                 }
//                             }
//                         }

//                         /* tslint:disable-next-line:no-any */
//                         const response = await (<Promise<HttpResponse<any>>>this._client.execute(method, { shouldIncludeClientRequestId: true, url, body }));

//                         if (response.ok) {
//                             const testConnectionResponse = response.body.response;
//                             const clientRequestId = getClientRequestIdFromHeaders(response.headers);
//                             this.handleTestConnectionInnerResponse(testConnectionResponse, connection, clientRequestId);
//                         } else {
//                             this.handleTestConnectionOuterResponse(response);
//                         }
//                     }
//                 }
//             } else {
//                 const testLinks = connection.properties.testLinks;
//                 if (testLinks) {
//                     const testLink = connection.properties.testLinks[0];
//                     if (testLink) {
//                         const { method, requestUri: url } = testLink;
//                         const response = await this._client.execute(method, { json: false, shouldIncludeClientRequestId: true, url });
//                         this.handleTestConnectionResponse(response, connection);
//                     }
//                 }
//             }
//         }
//     }

//     handleTestConnectionResponse(response: HttpResponse<any>, connection: Connection): void {
//         // tslint:disable-line: no-any
//         if (response.status >= 400 && response.status < 500 && response.status !== 429) {
//             let errorMessage = Resources.CONNECTION_CREATION_FAILED_DEFAULT_TEXT;
//             if (response.body && typeof response.body === 'string') {
//                 try {
//                     const message = this.getConnectionErrorMessage(JSON.parse(response.body), Resources.CONNECTION_CREATION_FAILED_DEFAULT_TEXT);
//                     errorMessage = format(Resources.CONNECTION_CREATION_FAILED_TEXT, message);
//                 } catch {
//                     // tslint:disable-line: no-empty
//                 }
//             }

//             const clientRequestId = getClientRequestIdFromHeaders(response.headers);
//             errorMessage = clientRequestId ? `${errorMessage} ${format(Resources.CONNECTOR_API_ERROR_CLIENT_REQUEST_ID, clientRequestId)}` : errorMessage;
//             const exception = new UserException(UserErrorCode.TEST_CONNECTION_FAILED, errorMessage);
//             this._analytics.logWarning(EventTypes.MSLA_TEST_CONNECTION_FAILED, errorMessage, { exception, connectorId: connection.properties.apiId });
//             throw exception;
//         }
//     }

//     handleTestConnectionOuterResponse(response: HttpResponse<any>): void {
//         // tslint:disable-line: no-any
//         if (response.status >= 400 && response.status < 500 && response.status !== 429) {
//             let errorMessage;
//             if (response.body && typeof response.body === 'object') {
//                 try {
//                     errorMessage = this.getConnectionErrorMessage(response.body);
//                 } catch {
//                     // tslint:disable-line: no-empty
//                 }
//             }
//             const clientRequestId = getClientRequestIdFromHeaders(response.headers);
//             errorMessage = clientRequestId ? `${errorMessage} ${format(Resources.CONNECTOR_API_ERROR_CLIENT_REQUEST_ID, clientRequestId)}` : errorMessage;
//             this._analytics.logError(EventTypes.ERROR, new AssertionException(AssertionErrorCode.DYNAMIC_INVOKE_CLIENT_SIDE_ERROR, errorMessage));
//         }
//     }

//     handleTestConnectionInnerResponse(response: any, connection: Connection, clientRequestId: string): void {
//         // tslint:disable-line: no-any
//         if (response.statusCode !== 'OK') {
//             let errorMessage = Resources.CONNECTION_CREATION_FAILED_DEFAULT_TEXT;
//             if (response.body && typeof response.body === 'object') {
//                 try {
//                     const message = this.getConnectionErrorMessage(response.body, Resources.CONNECTION_CREATION_FAILED_DEFAULT_TEXT);
//                     errorMessage = format(Resources.CONNECTION_CREATION_FAILED_TEXT, message);
//                 } catch {
//                     // tslint:disable-line: no-empty
//                 }
//             }

//             errorMessage = clientRequestId ? `${errorMessage} ${format(Resources.CONNECTOR_API_ERROR_CLIENT_REQUEST_ID, clientRequestId)}` : errorMessage;
//             const exception = new UserException(UserErrorCode.TEST_CONNECTION_FAILED, errorMessage);
//             this._analytics.logWarning(EventTypes.MSLA_TEST_CONNECTION_FAILED, errorMessage, { exception, connectorId: connection.properties.apiId });
//             throw exception;
//         }
//     }

//     getConnectionErrorMessage(error: any, defaultErrorMessage?: string): string {
//         // tslint:disable-line: no-any
//         let message: string;
//         if (error && error.message) {
//             message = error.message;
//         } else if (error && error.error && error.error.message) {
//             message = error.error.message;
//         } else {
//             message = defaultErrorMessage || Resources.ERROR_DEFAULT;
//         }

//         return message;
//     }

//     getConnectors(batchable?: boolean): Promise<Connector[]> {
//         const managed = this._getManagedConnectionProviders(batchable);
//         const custom = this._getCustomConnectionProviders(batchable);
//         return Promise.all([managed, custom]).then(result => {
//             const managedConnectors = result[0];
//             const customConnectors = result[1];
//             return managedConnectors.concat(customConnectors).map(provider => this._getUpdatedConnectionProvider(provider));
//         });
//     }

//     getConnectionProvidersWithCapability(capability: string, batchable?: boolean): Promise<Connector[]> {
//         // TODO: RDBUG 4992641 - update to use HttpClient when RP supports client side filtering
//         return this.getConnectors(batchable).then(connectionProviders => {
//             return connectionProviders.filter(connector => {
//                 const { properties } = connector;
//                 return properties && properties.capabilities && properties.capabilities.filter(c => equals(c, capability)).length > 0;
//             });
//         });
//     }

//     getConnector(connectorId: string, batchable?: boolean): Promise<Connector> {
//         return this._getProviderWithSwaggerAndEnvironmentBadge(connectorId, batchable).then(connector => {
//             return this._getUpdatedConnectionProvider(connector);
//         });
//     }

//     /**
//      * @deprecated Use `getUniqueConnectionName` instead.
//      */
//     getNewConnectionName(): Promise<string> {
//         throw new NotImplementedException(Resources.METHOD_NOT_IMPLEMENTED);
//     }

//     /**
//      * Gets a unique connection name based on the connector name. This is the default implementation
//      * and would return connectionName as `{connectorId}-{prefix}`. Other service implementation can override this.
//      * Connection name must match ^[a-zA-Z0-9\\\\-\\\\.]{1,64}$
//      * @arg {string} connectorId - The connector ID.
//      * @arg {string[]} connectionNames - An array of names for already existing connections.
//      * @arg {string} connectorName - The connector name.
//      * @return {Promise<string>}
//      */
//     getUniqueConnectionName(connectorId: string, connectionNames: string[], connectorName: string): Promise<string> {
//         connectorName = connectorName.replace(/_/g, '-');

//         const hashMap: Record<string, boolean> = {};
//         for (const name of connectionNames) {
//             hashMap[name] = true;
//         }

//         let connectionName = connectorName;
//         let i = 1;
//         while (getPropertyValue(hashMap, connectionName)) {
//             connectionName = `${connectorName}-${i++}`;
//         }

//         return this._getUniqueConnectionName(connectorName, connectorId, connectionName, i);
//     }

//     refresh(): void {
//         this._initialized = false;
//         this._initConnections = null;

//         // notify external to refresh the cache or query
//         if (!!this.refreshConnections) {
//             this.refreshConnections();
//         }
//     }

//     refreshConnections: () => void; // external callback function to refresh connection list.

//     dispose(): void {
//         this._client.dispose();
//     }

//     private _getCustomConnectionProviders(batchable?: boolean): Promise<Connector[]> {
//         const path = this.urlService.getCustomConnectorsUri();
//         return this._client
//             .get<ArmResources<Connector>>({
//                 cache: true,
//                 path,
//                 query: {
//                     'api-version': this._options.apiVersionForCustomConnector,
//                 },
//                 batch: batchable,
//             })
//             .then(response => {
//                 if (response.ok) {
//                     return response.body.value;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.GET_CUSTOM_CONNECTION_PROVIDERS_FAILED, Resources.CONNECTION_GET_CUSTOM_CONNECTOR_FAILED, {
//                         uri: path,
//                         status: response.status,
//                     });
//                 }
//             });
//     }

//     private _getManagedConnectionProviders(batchable?: boolean): Promise<Connector[]> {
//         const path = this.urlService.getConnectionProvider();
//         return this._client
//             .get<ArmResources<Connector>>({
//                 cache: true,
//                 path,
//                 query: {
//                     'api-version': this._options.apiVersionForSharedManagedConnector,
//                 },
//                 batch: batchable,
//             })
//             .then(response => {
//                 if (response.ok) {
//                     return response.body.value;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.GET_MANAGED_CONNECTION_PROVIDERS_FAILED, Resources.CONNECTION_GET_MANAGED_CONNECTOR_FAILED, {
//                         uri: path,
//                         status: response.status,
//                     });
//                 }
//             });
//     }

//     private _convertToConnection(connection: any): Connection {
//         /* tslint:disable-line: no-any */
//         const properties = connection.properties,
//             apiProperty = getPropertyValue(properties, 'api'),
//             testLinksProperty: TestLink[] = getPropertyValue(properties, 'testLinks');

//         if (!!apiProperty) {
//             properties.apiId = getPropertyValue(apiProperty, 'id');
//         }

//         // NOTE(psamband): Normalizing the property names of the testLinks.
//         if (!!testLinksProperty) {
//             properties.testLinks = testLinksProperty.map(testLink => {
//                 return {
//                     requestUri: getPropertyValue(testLink, 'requesturi'),
//                     method: getPropertyValue(testLink, 'method'),
//                 };
//             });
//         }

//         properties.apiId = addPrefix(properties.apiId, '/');
//         connection.id = addPrefix(connection.id, '/');

//         properties.connectionParameters = extend({}, properties.connectionParameters || {}, properties['nonSecretParameterValues']);

//         connection.properties = properties;

//         return connection;
//     }

//     // We are creating new connection as the original object has many other
//     // properties which is creating infinite loop while extending the object
//     private _copyConnection(connection: Connection): Connection {
//         const properties = connection.properties,
//             parameters = clone(properties.connectionParameters),
//             newConnection: Connection = {
//                 name: connection.name,
//                 id: connection.id,
//                 type: connection.type,
//                 properties: {
//                     apiId: properties.apiId,
//                     displayName: properties.displayName,
//                     iconUri: properties.iconUri,
//                     createdTime: properties.createdTime,
//                     statuses: properties.statuses,
//                     createdBy: properties.createdBy,
//                     connectionAlternativeParameters: properties.connectionAlternativeParameters,
//                     connectionParameters: parameters,
//                     connectionParameterSets: properties.connectionParametesrSets,
//                     testLinks: properties.testLinks,
//                 },
//             };

//         return newConnection;
//     }

//     private _getProvider(connectorId: string, batchable?: boolean): Promise<Connector> {
//         return this._client
//             .get<Connector>({
//                 cache: true,
//                 path: connectorId,
//                 query: {
//                     'api-version': this._getApiVersionForConnector(connectorId),
//                 },
//                 batch: batchable,
//             })
//             .then(response => {
//                 if (response.ok) {
//                     return response.body;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.GET_CONNECTOR_FAILED, Resources.CONNECTION_GET_CONNECTOR_FAILED, {
//                         uri: connectorId,
//                         status: response.status,
//                     });
//                 }
//             });
//     }

//     private _getProviderSwagger(connectorId: string, batchable: boolean): Promise<any> {
//         /* tslint:disable-line: no-any */
//         return this._client
//             .get<any>({
//                 /* tslint:disable-line: no-any */ cache: true,
//                 path: connectorId,
//                 query: {
//                     'api-version': this._getApiVersionForConnector(connectorId),
//                     export: true,
//                 },
//                 batch: batchable,
//             })
//             .then(response => {
//                 if (response.ok) {
//                     return response.body;
//                 } else {
//                     this._throwError(response.body, ConnectionServiceErrorCode.GET_SWAGGER_FAILED, Resources.CONNECTIONS_GET_SWAGGER_FAILED, {
//                         uri: connectorId,
//                         status: response.status,
//                     });
//                 }
//             });
//     }

//     private _getApiVersionForConnector(connectorId: string): string {
//         const connectorIdLowerCase = connectorId.toLowerCase();

//         if (connectorIdLowerCase.lastIndexOf('/customapis/') > -1) {
//             return this._options.apiVersionForCustomConnector;
//         } else if (connectorIdLowerCase.lastIndexOf('microsoft.logic/integrationserviceenvironments') > -1) {
//             return this._options.apiVersionForIseManagedConnector;
//         } else {
//             return this._options.apiVersionForSharedManagedConnector;
//         }
//     }

//     private async _getProviderWithSwaggerAndEnvironmentBadge(connectorId: string, batchable: boolean): Promise<Connector> {
//         const [connector, swagger] = await Promise.all([this._getProvider(connectorId, batchable), this._getProviderSwagger(connectorId, batchable)]);

//         if (!connector || !connector.properties) {
//             const message = format(Resources.ERROR_UNDEFINED_CONNECTOR_OR_CONNECTOR_PROPERTIES, connectorId);
//             const data = {
//                 arePropertiesDefined: !!(connector && connector.properties),
//                 connectorId,
//                 isConnectorDefined: !!connector,
//             };
//             throw new AssertionException(AssertionErrorCode.UNDEFINED_CONNECTOR_OR_CONNECTOR_PROPERTIES, message, data);
//         } else {
//             if (connector.properties.integrationServiceEnvironment && !connector.properties.environmentBadge) {
//                 connector.properties.environmentBadge = iseBadge;
//             }

//             connector.properties.swagger = swagger;

//             return connector;
//         }
//     }

//     /* tslint:disable-next-line: no-any */
//     private _getRequestForCreateConnection(id: string, connectorId: string, connectionInfo: ConnectionInfo): HttpRequest<any> {
//         const parameterValues = connectionInfo?.connectionParameters;
//         const parameterValueSet: Record<string, any> = connectionInfo?.connectionParametersSet; // tslint:disable-line: no-any
//         const displayName = connectionInfo?.displayName;
//         return <HttpRequest<any>>{
//             // tslint:disable-line: no-any
//             path: id,
//             query: {
//                 'api-version': this._options.apiVersionForConnection,
//             },
//             body: {
//                 properties: {
//                     api: {
//                         id: connectorId,
//                     },
//                     parameterValues,
//                     parameterValueSet,
//                     displayName,
//                 },
//                 kind: 'V1',
//                 location: this.urlService.getLocation(),
//             },
//         };
//     }

//     /* tslint:disable-next-line: no-any */
//     private _getRequestForCreateConnectionWithAlternativeParameters(id: string, connectorId: string, properties: ConnectionInfo): HttpRequest<any> {
//         const alternativeParameterValues = properties?.internalAlternativeParameterValues;

//         const displayName = properties?.displayName;
//         return <HttpRequest<any>>{
//             // tslint:disable-line: no-any
//             path: id,
//             query: {
//                 'api-version': this._options.apiVersionForConnection,
//             },
//             body: {
//                 properties: {
//                     api: {
//                         id: connectorId,
//                     },
//                     parameterValueType: 'Alternative',
//                     alternativeParameterValues,
//                     displayName,
//                 },
//                 kind: 'V1',
//                 location: this.urlService.getLocation(),
//             },
//         };
//     }

//     private _getUpdatedConnectionProvider(connector: Connector): Connector {
//         let properties = getPropertyValue(connector.properties, 'generalinformation');

//         if (!!properties) {
//             const newConnectionProvider = clone(connector);

//             properties = getPropertyValue(newConnectionProvider.properties, 'generalinformation');

//             // Pushing the general information as first level properties in api provider properties
//             if (properties.id) {
//                 properties.id = addPrefix(properties.id, '/');
//             }
//             newConnectionProvider.properties = extend(newConnectionProvider.properties, properties);

//             return newConnectionProvider;
//         }

//         return connector;
//     }

//     private _getUniqueConnectionName(connectorName: string, connectorId: string, connectionName: string, i: number): Promise<string> {
//         const connectionId = this.urlService.getConnectionId(connectionName, connectorId);
//         return this._testConnectionIdUniqueness(connectionId).then(isUnique => {
//             if (isUnique) {
//                 return connectionName;
//             } else {
//                 connectionName = `${connectorName}-${i++}`;
//                 return this._getUniqueConnectionName(connectorName, connectorId, connectionName, i);
//             }
//         });
//     }

//     private _testConnectionIdUniqueness(id: string): Promise<boolean> {
//         const request = <HttpRequest<any>>{
//             /* tslint:disable-line: no-any */ path: id,
//             query: {
//                 'api-version': this._options.apiVersionForConnection,
//             },
//         };

//         return this._client.get<Connection>(request).then(response => {
//             if (response.status === 404) {
//                 return true;
//             } else if (response.status === 200) {
//                 return false;
//             } else {
//                 this._throwError(response.body, ConnectionServiceErrorCode.TEST_CONNECTION_UNIQUENESS_FAILED, Resources.CONNECTION_TEST_UNIQUENESS_FAILED, {
//                     uri: id,
//                     status: response.status,
//                 });
//             }
//         });
//     }

//     /* tslint:disable-next-line: no-any */
//     private _throwError(responseBody: any, connectionServiceErrorCode: ConnectionServiceErrorCode, defaultErrorMessage: string, data: Record<string, any>) {
//         const error = responseBody ? responseBody.error : undefined;
//         const errorMessage = error && error.message ? error.message : defaultErrorMessage;
//         throw new ConnectionServiceException(connectionServiceErrorCode, errorMessage, { ...data, responseBodyError: error });
//     }
// }
