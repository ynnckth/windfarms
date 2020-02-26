export const config = {
  windfarmInventory: {
    baseUrl: process.env.INVENTORY_URL,
  },
  messageBroker: {
    host: process.env.MESSAGE_BROKER_HOST,
    port: 15675,
    userName: process.env.MESSAGE_BROKER_USERNAME,
    password: process.env.MESSAGE_BROKER_PASSWORD,
  }
};