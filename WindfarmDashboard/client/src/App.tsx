import React from 'react';
import './App.css';
import {
  AppBar,
  Paper,
  Toolbar,
  Typography
} from '@material-ui/core';
import WindfarmInventoryService from './services/WindfarmInventoryService';
import {Windfarm} from './types/Windfarm';
import Telemetry from './components/Telemetry/Telemetry';
import Header from './components/Header/Header';
import {TelemetryServiceContext} from './index';
import ConfigurationService from './services/ConfigurationService';
import StateService from './services/StateService';
import {Subscription} from 'rxjs';


interface IProps {
  configurationService: ConfigurationService;
  inventoryService: WindfarmInventoryService;
  stateService: StateService;
}

interface IState {
  windfarms: Windfarm[];
  selectedWindfarm?: Windfarm;
}

class App extends React.Component<IProps, IState> {
  public state: IState;
  private selectedWindfarmSubscription?: Subscription;

  constructor(props: IProps) {
    super(props);
    this.state = {
      windfarms: [],
      selectedWindfarm: undefined,
    };
  }

  async componentDidMount(): Promise<void> {
    // TODO: refactor => check if can be replaced with deep watch of this.props.stateService.windfarm
    this.selectedWindfarmSubscription = this.props.stateService.onSelectedWindfarm()
      .subscribe((selectedWindfarm: Windfarm) => this.setState({selectedWindfarm: selectedWindfarm}));
    try {
      const windfarms = await this.props.inventoryService.getWindfarms();
      this.setState({windfarms: windfarms});
    } catch (e) {
      console.log('Error loading windfarms: ', e);
    }
  }

  componentWillUnmount(): void {
    this.selectedWindfarmSubscription?.unsubscribe();
  }

  render() {
    const {windfarms, selectedWindfarm} = this.state;

    return (
      <div>
        <AppBar position="relative">
          <Toolbar>
            <Header stateService={this.props.stateService} windfarms={windfarms}/>
          </Toolbar>
        </AppBar>

        <div className="content">
          {selectedWindfarm &&
          <div>
            <Paper variant="outlined">
              <div className="windfarm-details">
                <Typography variant="h6" component="h6">Windfarm details</Typography>
                <ul>
                  <li>Id: {selectedWindfarm.id}</li>
                  <li>Number of turbines: {selectedWindfarm.numberOfTurbines}</li>
                  <li>Commissioning date: {selectedWindfarm.commissioningDate}</li>
                </ul>
              </div>
            </Paper>
          </div>}
          <TelemetryServiceContext.Consumer>
            {telemetryService =>
              <Telemetry
                telemetryService={telemetryService}
                stateService={this.props.stateService}
              />}
          </TelemetryServiceContext.Consumer>
        </div>
        {/* TODO: idea: add world map with highlighted wind farm location: https://jsfiddle.net/BlackLabel/gt71a4xe/ */}
      </div>
    );
  }
}

export default App;
