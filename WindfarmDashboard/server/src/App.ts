import express from 'express';
import cors from 'cors';
import * as http from 'http';
import * as path from 'path';


const app = express();

app.use(cors({origin: 'http://localhost:3000'})); // frontend dev server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.set('port', process.env.PORT || 5001);
app.use(express.static(path.join(__dirname, '../../client/build')));


export const server = http.createServer(app);

export default app;