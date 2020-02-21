export const config = {
  windfarmId: process.env.WINDFARM_ID,
  windfarmInventory: {
    baseUrl: process.env.INVENTORY_URL,
  },
  windfarmTelemetry: {
    baseUrl: process.env.TELEMETRY_URL,
  },
  messageBroker: {
    host: process.env.MESSAGE_BROKER_HOST,
    port: 15675,
  }
};