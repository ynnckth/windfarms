import React from 'react';
import './Telemetry.css';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {speedChartConfig, temperatureChartConfig} from '../../ChartConfig';
import {WindfarmTelemetry} from '../../types/WindfarmTelemetry';
import WindfarmTelemetryService from '../../services/WindfarmTelemetryService';
import {Subscription} from 'rxjs';
import StateService from '../../services/StateService';
import {Windfarm} from '../../types/Windfarm';


interface IProps {
  telemetryService: WindfarmTelemetryService;
  stateService: StateService;
}

interface IState {
  telemetryData: WindfarmTelemetry[];
}

class Telemetry extends React.Component<IProps, IState> {
  public state: IState;

  private MAX_TELEMETRY_DATA_TO_KEEP = 50;

  private temperatureChartReference: HighchartsReact | null = null;
  private speedChartReference: HighchartsReact | null = null;
  private telemetrySubscription: Subscription | undefined;
  private stateServiceSubscription: Subscription | undefined;

  constructor(props: IProps) {
    super(props);
    this.state = {
      telemetryData: [],
    };
  }

  async componentDidMount() {
    const {telemetryService, stateService} = this.props;

    await telemetryService.connect();
    this.stateServiceSubscription = stateService.onSelectedWindfarm()
      .subscribe((selectedWindfarm: Windfarm) => {
        telemetryService.subscribe(selectedWindfarm.id);
        this.setState({telemetryData: []}, () => this.updateCharts());
      });

    this.telemetrySubscription = telemetryService.onTelemetryMessage()
      .subscribe((telemetryMessage: WindfarmTelemetry) => {
        console.log('Received telemetry message: ', telemetryMessage);

        let telemetryData = this.state.telemetryData.concat(telemetryMessage);
        if (telemetryData.length > this.MAX_TELEMETRY_DATA_TO_KEEP) {
          telemetryData = telemetryData.slice(telemetryData.length - this.MAX_TELEMETRY_DATA_TO_KEEP, telemetryData.length);
        }
        this.setState({telemetryData: telemetryData}, () => this.updateCharts());
      });
  }

  componentWillUnmount(): void {
    this.stateServiceSubscription?.unsubscribe();
    this.telemetrySubscription?.unsubscribe();
  }

  updateCharts = () => {
    if (this.temperatureChartReference) {
      let latencyChart = this.temperatureChartReference.chart;
      latencyChart.series[0].setData(this.state.telemetryData.map(telemetryPoint => telemetryPoint.avgTemperature), true, false);
    }
    if (this.speedChartReference) {
      let speedChart = this.speedChartReference.chart;
      speedChart.series[0].setData(this.state.telemetryData.map(telemetryPoint => telemetryPoint.avgSpeed), true, false);
    }
  };

  render() {
    const {selectedWindfarm} = this.props.stateService;

    return (
      <div className="telemetry">
        {selectedWindfarm &&
        <React.Fragment>
          <div className="avg-temperature-chart">
            <HighchartsReact
              highcharts={Highcharts}
              options={temperatureChartConfig}
              ref={element => this.temperatureChartReference = element}
            />
          </div>
          <div className="avg-speed-chart">
            <HighchartsReact
              highcharts={Highcharts}
              options={speedChartConfig}
              ref={element => this.speedChartReference = element}
            />
          </div>
        </React.Fragment>}
      </div>
    );
  }
}

export default Telemetry;