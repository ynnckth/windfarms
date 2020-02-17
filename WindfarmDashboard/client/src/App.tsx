import React, {useEffect, useState} from 'react';
import './App.css';
import {AppBar, Paper, Toolbar, Typography} from '@material-ui/core';
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
  const [windfarm, setWindfarm] = useState<Windfarm | undefined>(undefined);

  useEffect(() => {
    if (windfarm !== undefined) {
      return;
    }
    const loadWindfarm = async () => {
      const config = await configurationService.getConfiguration();
      const windfarm = await inventoryService.getWindfarm(config.windfarmId);
      setWindfarm(windfarm);
    };
    loadWindfarm();
  }, [windfarm, configurationService, inventoryService]);

  return (
    <div>
      <AppBar position="relative">
        <Toolbar>
          <div className="header-content">
            <div>Windfarm Dashboard</div>
            {windfarm && <div>{windfarm.name}</div>}
            <div className="header-spacer"/>
          </div>
        </Toolbar>
      </AppBar>

      <div className="content">
        <div>
          {windfarm &&
          <Paper variant="outlined">
            <div className="windfarm-details">
              <Typography variant="h6" component="h6">Windfarm details</Typography>
              <ul>
                <li>Id: {windfarm.id}</li>
                <li>Number of turbines: {windfarm.numberOfTurbines}</li>
                <li>Commissioning date: {windfarm.commissioningDate}</li>
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
