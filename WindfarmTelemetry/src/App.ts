import express from 'express';
import cors from 'cors';
import {Socket} from 'socket.io';
import * as http from 'http';
import {getWindfarmDetails} from './WindfarmController';
import WindfarmTelemetryService from './WindfarmTelemetryService';
import {config} from './Config';


const app = express();

// TODO: add frontend client domain
app.use(cors({origin: 'http://localhost:3000'}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.set('port', process.env.PORT || 5000);

app.get('/', (req, res) => res.json({message: 'check windfarm details at /api/details'}));
app.get('/api/details', getWindfarmDetails);


export const server = http.createServer(app);
const io = require("socket.io")(server, {origins: 'http://localhost:3000'});  // TODO: add frontend client domain
const windfarmTelemetryService = new WindfarmTelemetryService(io);


io.on('connection', (socket: Socket) => {
  console.log('Client connected to telemetry stream', socket.client.id);
  setInterval(() => windfarmTelemetryService.sendWindfarmTelemetry(), config.telemetryInterval);
});

export default app;