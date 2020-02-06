import {Response, Request} from "express";
import {config} from './Config';


export const getWindfarmDetails = (req: Request, res: Response) => {
  res.json(config.windfarm);
};