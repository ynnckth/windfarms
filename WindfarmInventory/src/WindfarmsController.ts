import {Response, Request} from 'express';
import {config} from './Config';


export const getWindfarms = (req: Request, res: Response) => {
  res.json(config.windfarms);
};

export const getWindfarm = (req: Request, res: Response) => {
  const windfarm = config.windfarms.find(w => w.id === req.params.id);
  if (!windfarm) {
    res.status(404);
    res.send({error: 'not found'});
    return;
  }
  res.json(windfarm);
};