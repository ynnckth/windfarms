export interface Configuration {
  windfarmId: string;
  windfarmInventory: WindfarmInventoryConfiguration;
  windfarmTelemetry: WindfarmTelemetryConfiguration;
  messageBroker: MessageBrokerConfiguration;
}

export interface WindfarmInventoryConfiguration {
  baseUrl: string;
}

export interface WindfarmTelemetryConfiguration {
  baseUrl: string;
}

export interface MessageBrokerConfiguration {
  host: string;
  port: number;
}