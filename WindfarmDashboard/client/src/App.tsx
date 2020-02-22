import React, {useEffect, useState} from 'react';
import './App.css';
import {AppBar, FormControl, InputLabel, MenuItem, Paper, Select, Toolbar, Typography} from '@material-ui/core';
import WindfarmInventoryService from './services/WindfarmInventoryService';
import {Windfarm} from './types/Windfarm';
import Telemetry from './components/Telemetry/Telemetry';
import {TelemetryServiceContext} from './index';
import ConfigurationService from './services/ConfigurationService';


interface IProps {
  configurationService: ConfigurationService;
  inventoryService: WindfarmInventoryService;
}

const App: React.FC<IProps> = (props: IProps) => {

  const {inventoryService, configurationService} = props;
  const [windfarms, setWindfarms] = useState<Windfarm[] | undefined>(undefined);
  const [selectedWindfarm, setSelectedWindfarm] = useState<Windfarm | undefined>(undefined);

  useEffect(() => {
    if (windfarms !== undefined) {
      return;
    }
    const loadWindfarms = async () => {
      const config = await configurationService.getConfiguration();
      const windfarms = await inventoryService.getWindfarms();
      setWindfarms(windfarms);
    };
    loadWindfarms();
  }, [windfarms, configurationService, inventoryService]);

  const onSelectedWindfarm = (w: any) => {
    console.log('Selected windfarm ', w);
  };

  return (
    <div>
      <AppBar position="relative">
        <Toolbar>
          <div className="header-content">
            <div>Windfarm Dashboard</div>

            {windfarms &&
            <FormControl>
              <InputLabel id="select-label">Windfarm</InputLabel>
              <Select
                labelId="select-label"
                value={}
                onChange={onSelectedWindfarm}>
                {windfarms.map(w => <MenuItem value={w.id}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>}
            <div className="header-spacer"/>
          </div>
        </Toolbar>
      </AppBar>

      <div className="content">
        <div>
          {selectedWindfarm &&
          <Paper variant="outlined">
            <div className="windfarm-details">
              <Typography variant="h6" component="h6">Windfarm details</Typography>
              <ul>
                <li>Id: {selectedWindfarm.id}</li>
                <li>Number of turbines: {selectedWindfarm.numberOfTurbines}</li>
                <li>Commissioning date: {selectedWindfarm.commissioningDate}</li>
              </ul>
            </div>
          </Paper>}
        </div>
        <TelemetryServiceContext.Consumer>
          {telemetryService => <Telemetry telemetryService={telemetryService}/>}
        </TelemetryServiceContext.Consumer>
      </div>
      {/* TODO: idea: add world map with highlighted wind farm location: https://jsfiddle.net/BlackLabel/gt71a4xe/ */}
    </div>
  );
};

export default App;
