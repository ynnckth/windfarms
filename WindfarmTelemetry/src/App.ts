import express from 'express';
import cors from 'cors';
import * as http from 'http';
import WindfarmTelemetryService from './WindfarmTelemetryService';
import {config} from './Config';


const app = express();

// TODO: limit cors access
app.use(cors({origin: '*'}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.set('port', process.env.PORT || 5000);

export const server = http.createServer(app);

const windfarmTelemetryService = new WindfarmTelemetryService();

// TODO: proper retry policy to re-connect to message broker
setTimeout(async () => {
  await windfarmTelemetryService.connectToMessageBroker();
  setInterval(() => windfarmTelemetryService.sendTelemetry(), config.telemetryInterval);
}, 10000);

export default app;