export interface Configuration {
  windfarmInventory: WindfarmInventoryConfiguration;
  messageBroker: MessageBrokerConfiguration;
}

export interface WindfarmInventoryConfiguration {
  baseUrl: string;
}

export interface MessageBrokerConfiguration {
  host: string;
  port: number;
  userName: string;
  password: string;
}