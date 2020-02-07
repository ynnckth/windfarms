export interface Configuration {
  windfarmId: string;
  windfarmInventory: WindfarmInventoryConfiguration;
  windfarmTelemetry: WindfarmTelemetryConfiguration;
}

export interface WindfarmInventoryConfiguration {
  baseUrl: string;
}

export interface WindfarmTelemetryConfiguration {
  baseUrl: string;
}
