import * as Highcharts from 'highcharts';


export const temperatureChartConfig: Highcharts.Options = {
  title: {text: 'Avg Temperature'},
  series: [
    {
      type: 'line',
      name: 'avg temperature',
      data: [],
    }
  ],
  xAxis: {
    visible: false
  },
  yAxis: {title: {text: '°C'}},
  plotOptions: {
    line: {
      marker: {
        enabled: false
      }
    }
  },
};

export const speedChartConfig: Highcharts.Options = {
  title: {text: 'Avg Turbine Speed'},
  series: [
    {
      type: 'line',
      name: 'avg speed',
      data: [],
    }
  ],
  xAxis: {
    visible: false
  },
  yAxis: {title: {text: 'rpm'}},
  plotOptions: {
    line: {
      marker: {
        enabled: false
      },
      color: 'orange'
    }
  },
};