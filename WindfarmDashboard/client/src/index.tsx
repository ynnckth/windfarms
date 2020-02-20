import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import WindfarmTelemetryService from './services/WindfarmTelemetryService';
import ConfigurationService from './services/ConfigurationService';
import WindfarmInventoryService from './services/WindfarmInventoryService';

const configurationService = new ConfigurationService();
const inventoryService = new WindfarmInventoryService(configurationService);
export const TelemetryServiceContext = React.createContext<WindfarmTelemetryService>(new WindfarmTelemetryService());

ReactDOM.render(
  <App
    configurationService={configurationService}
    inventoryService={inventoryService}
  />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
