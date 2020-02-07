import {Response, Request} from 'express';
import {config} from './Config';


export const getConfiguration = (req: Request, res: Response) => {
  res.json(config);
};