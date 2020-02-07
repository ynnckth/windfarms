export const config = {
  windfarmId: process.env.WINDFARM_ID,
  windfarmInventory: {
    baseUrl: process.env.INVENTORY_URL,
  },
  windfarmTelemetry: {
    baseUrl: process.env.TELEMETRY_URL,
  }
};