import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import WindfarmTelemetryService from './services/WindfarmTelemetryService';
import ConfigurationService from './services/ConfigurationService';
import WindfarmInventoryService from './services/WindfarmInventoryService';
import StateService from './services/StateService';

const configurationService = new ConfigurationService();
const stateService = new StateService();
const inventoryService = new WindfarmInventoryService(configurationService);
const telemetryService = new WindfarmTelemetryService(configurationService, stateService);
export const StateServiceContext = React.createContext<StateService>(stateService);
export const TelemetryServiceContext = React.createContext<WindfarmTelemetryService>(telemetryService);

ReactDOM.render(
  <App
    configurationService={configurationService}
    inventoryService={inventoryService}
    stateService={stateService}
  />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
