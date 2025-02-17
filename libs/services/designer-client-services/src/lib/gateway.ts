import type { Gateway, Subscription } from '@microsoft/utils-logic-apps';
import { AssertionErrorCode, AssertionException } from '@microsoft/utils-logic-apps';

export interface IGatewayService {
  /**
   * Gets gateways for connectorId.
   * @arg {string} connectorName - The connector NAME to retrieve gateway options from.
   */
  getGateways(subscriptionId: string, connectorName: string): Promise<Gateway[]>;

  /**
   * Gets subscriptions.
   */
  getSubscriptions(): Promise<Subscription[]>;
}

let service: IGatewayService;

export const InitGatewayService = (gatewayService: IGatewayService): void => {
  service = gatewayService;
};

export const GatewayService = (): IGatewayService => {
  if (!service) {
    throw new AssertionException(AssertionErrorCode.SERVICE_NOT_INITIALIZED, 'Gateway Service need to be initialized before using');
  }

  return service;
};
