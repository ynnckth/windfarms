import express from 'express';
import cors from 'cors';
import * as http from 'http';
import {getWindfarm, getWindfarms} from './WindfarmsController';


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

app.set('port', process.env.PORT || 5002);

app.get('/api/windfarms', getWindfarms);
app.get('/api/windfarms/:id', getWindfarm);

export const server = http.createServer(app);

export default app;