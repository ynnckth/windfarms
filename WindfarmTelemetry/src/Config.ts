
export const config = {
  telemetryInterval: 500,
  minSpeed: 1000,
  maxSpeed: 5000,
  minTemperature: 80,
  maxTemperature: 120,

  windfarm: {
    id: process.env.WINDFARM_ID,
  }
};