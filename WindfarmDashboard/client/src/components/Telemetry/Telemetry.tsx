import React from 'react';
import './Telemetry.css';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {speedChartConfig, temperatureChartConfig} from '../../ChartConfig';
import {WindfarmTelemetry} from '../../types/WindfarmTelemetry';
import WindfarmTelemetryService from '../../services/WindfarmTelemetryService';


interface IProps {
  telemetryService: WindfarmTelemetryService;
}

interface IState {
  telemetryData: WindfarmTelemetry[];
}

class Telemetry extends React.Component<IProps, IState> {
  public state: IState;

  private MAX_TELEMETRY_DATA_TO_KEEP = 50;

  private temperatureChartReference: HighchartsReact | null = null;
  private speedChartReference: HighchartsReact | null = null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      telemetryData: [],
    };
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

  async componentDidMount() {
    const {telemetryService} = this.props;

    await telemetryService.connect();
    console.log('Subscribing to telemetry stream');
    telemetryService.telemetryStream!.on('windfarm_telemetry', (telemetry: WindfarmTelemetry) => {
        let telemetryData = this.state.telemetryData.concat(telemetry);
        if (telemetryData.length > this.MAX_TELEMETRY_DATA_TO_KEEP) {
          telemetryData = telemetryData.slice(telemetryData.length - this.MAX_TELEMETRY_DATA_TO_KEEP, telemetryData.length);
        }
        this.setState({telemetryData: telemetryData});
        this.updateCharts();
      });
  }

  render() {
    return (
      <div className="telemetry">
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
      </div>
    );
  }
}

export default Telemetry;