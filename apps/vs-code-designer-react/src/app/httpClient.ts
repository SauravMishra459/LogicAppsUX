import { batch, corsFetch } from '@microsoft/azureportal-reactview/Ajax';
import type { HttpRequestOptions, IHttpClient } from '@microsoft/designer-client-services-logic-apps';
import { HTTP_METHODS } from '@microsoft/utils-logic-apps';

export class HttpClient implements IHttpClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async get<ReturnType>(options: HttpRequestOptions<unknown>): Promise<ReturnType> {
    const response = await batch<ReturnType>({ ...options, type: HTTP_METHODS.GET, uri: getRequestUrl(options) });
    return response.content;
  }

  async post<ReturnType, BodyType>(options: HttpRequestOptions<BodyType>): Promise<ReturnType> {
    const response = await corsFetch({
      url: getRequestUrl(options),
      method: HTTP_METHODS.POST,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: this.accessToken,
      },
      body: JSON.stringify(options.content),
      commandName: 'Designer.httpClient.post',
    });

    if (!isSuccessResponse(response.status)) {
      return Promise.reject(response);
    }

    try {
      return JSON.parse(response.responseText);
    } catch {
      return response as any;
    }
  }

  async put<ReturnType, BodyType>(options: HttpRequestOptions<BodyType>): Promise<ReturnType> {
    const response = await corsFetch({
      url: getRequestUrl(options),
      method: HTTP_METHODS.PUT,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: this.accessToken,
      },
      body: JSON.stringify(options.content),
      commandName: 'Designer.httpClient.put',
    });

    if (!isSuccessResponse(response.status)) {
      return Promise.reject(response);
    }

    try {
      return JSON.parse(response.responseText);
    } catch {
      return response as any;
    }
  }

  async delete<ReturnType>(options: HttpRequestOptions<unknown>): Promise<ReturnType> {
    const response = await batch<ReturnType>({ ...options, type: HTTP_METHODS.DELETE, uri: getRequestUrl(options) });
    return response.content;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispose(): void {}
}

function getRequestUrl(options: HttpRequestOptions<unknown>): string {
  const { uri, queryParameters } = options;
  let queryString = '';

  if (queryParameters) {
    for (const queryKey of Object.keys(queryParameters)) {
      queryString += `${encodeURIComponent(queryKey)}=${encodeURIComponent(queryParameters[queryKey])}&`;
    }
    queryString = queryString.substring(0, queryString.length - 1);
  }

  return queryString ? `${uri}?${queryString}` : uri;
}

function isSuccessResponse(statusCode: number): boolean {
  return statusCode >= 200 && statusCode <= 299;
}
