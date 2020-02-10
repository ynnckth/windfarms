import express from 'express';
import cors from 'cors';
import {Socket} from 'socket.io';
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
const io = require("socket.io")(server);  // TODO: restrict origins
const windfarmTelemetryService = new WindfarmTelemetryService(io);
let clients: Socket[] = [];

setInterval(() => windfarmTelemetryService.sendWindfarmTelemetry(), config.telemetryInterval);

io.on('connection', (socket: Socket) => {
  clients.push(socket);
  console.log('Connected client: ', socket.id);

  socket.on('disconnect', () => {
    socket.disconnect(true);
    clients = clients.filter(client => client.id !== socket.id);
    console.log('Disconnected client ', socket.id);
  });
});
export default app;