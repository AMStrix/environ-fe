import React, { Component } from "react";
import ReactDOM from "react-dom";
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  AreaSeries,
  CustomSVGSeries
} from 'react-vis';
import {curveCatmullRom} from 'd3-shape';
import 'react-vis/dist/style.css';
import ToggleButton from './ToggleButton.js';

class Chart extends Component {
  constructor() {
    super();
    this.timeout = null;
    this.defaultHistoryOption = -1;
    this.state = {
      from: null,
      to: null,
      temperatureHistory: null,
      humidityHistory: null,
      historyOption: null
    };
    this.historyOptions = [
      {disp: '1H', val: -1},
      {disp: '6H', val: -6},
      {disp: '12H', val: -12},
      {disp: '24H', val: -24}
    ];
  }
  componentDidMount() {
    this.updateFromToState(this.defaultHistoryOption);
  }
  render() {
    return (
        <div>
        { this.historyOptions.map( ho =>
          <ToggleButton 
            onClick={() => this.handleHistoryOptionsClick(ho.val)}
            key={ho.val} 
            on={this.state.historyOption === ho.val}>
            {ho.disp}
          </ToggleButton>  
        )}
        { this.state.temperatureHistory && this.renderCharts() }
      </div>
    );
  }
  renderCharts() {
    return (
      <div>
        <XYPlot
          margin={{top: 10, right: 40, left: 10, bottom: 40}}
          xType="time"
          width={600}
          height={200}
          style={{font: '12px sans-serif'}}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis title="Time" />
          <YAxis title="Temperature" orientation="right" />
          <AreaSeries data={this.state.fanHistoryTemp} style={{strokeWidth: 0, fill: 'rgba(23, 76, 167, 0.19)'}} />
          <LineSeries data={this.state.temperatureHistory} curve={curveCatmullRom.alpha(0.5)} color="rgb(255, 8, 0)" />
          <CustomSVGSeries
            data={
              [ 
                { 
                  x: this.state.temperatureHistory[this.state.temperatureHistory.length-1].x, 
                  y: this.state.temperatureHistory[this.state.temperatureHistory.length-1].y, 
                  size: 10, 
                  customComponent: () => {
                    return (
                      <g>
                        <circle cx="10" cy="0" r={40 / 2} fill="rgb(255, 8, 0)" />
                        <text x="10" y="0" textAnchor="middle" fill="white" dy=".3em">
                          {/*this.state.temperatureHistory[this.state.temperatureHistory.length-1].y*/
                            this.props.temperature + '°'
                          }
                        </text>
                      </g>);
                  } 
                }
              ]
            }/>
        </XYPlot>
        <XYPlot
          margin={{top: 10, right: 40, left: 10, bottom: 40}}
          xType="time"
          width={600}
          height={200}
          style={{font: '12px sans-serif'}}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis title="Time" />
          <YAxis title="Humidity" orientation="right" />
          <AreaSeries data={this.state.fanHistoryHum} style={{strokeWidth: 0, fill: 'rgba(23, 76, 167, 0.19)'}} />
          <LineSeries data={this.state.humidityHistory} curve={curveCatmullRom.alpha(0.5)} color="rgb(0, 8, 255)" />
          <CustomSVGSeries
            data={
              [ 
                { 
                  x: this.state.humidityHistory[this.state.humidityHistory.length-1].x, 
                  y: this.state.humidityHistory[this.state.humidityHistory.length-1].y, 
                  size: 10, 
                  customComponent: () => {
                    return (
                      <g>
                        <circle cx="10" cy="0" r={40 / 2} fill="rgb(0, 8, 255)"/>
                        <text x="10" y="0" textAnchor="middle" fill="white" dy=".3em" >
                          {/*this.state.humidityHistory[this.state.humidityHistory.length-1].y*/
                            this.props.humidity + '%'
                          }
                        </text>
                      </g>);
                  } 
                }
              ]
            }/>
        </XYPlot>
      </div>
    );
  }
  handleHistoryOptionsClick(duration) {
    this.updateFromToState(duration);
  }
  updateFromToState(duration) {
    if (this.timeout) { clearTimeout(this.timeout); }
    const from = (x => {
      x.setHours(x.getHours() + duration);
      x.setSeconds(0, 0);
      return x.toISOString();
    })(new Date());
    const to = (x => {
      x.setSeconds(0, 0);
      return x.toISOString();
    })(new Date());
    const historyOption = duration;
    this.setState({ historyOption, from, to }, () => this.queryHistory());
    this.timeout = setTimeout(() => this.updateFromToState(this.state.historyOption), 60000);
  }
  async queryHistory() {
    const { from, to } = this.state;
    const result = await this.props.client.query({
      query: HISTORY,
      variables: { from, to }
    });
    const temperatureHistory = result.data.history.map(x => ({x: Date.parse(x.time), y: x.t}));
    const humidityHistory = result.data.history.map(x => ({x: Date.parse(x.time), y: x.h}));
    let maxTemp = result.data.history.reduce((a, x) => x.t > a ? x.t : a, 0);
    let minTemp = result.data.history.reduce((a, x) => x.t < a ? x.t : a, maxTemp);
    const fanHistoryTemp = this.calculateFanHistory(minTemp, maxTemp, result.data.history);
    const maxHum = result.data.history.reduce((a, x) => x.h > a ? x.h : a, 0);
    const minHum = result.data.history.reduce((a, x) => x.h < a ? x.h : a, maxHum);
    const fanHistoryHum = this.calculateFanHistory(minHum, maxHum, result.data.history);
    //console.log(fanHistoryTemp);
    this.setState({ temperatureHistory, humidityHistory, fanHistoryTemp, fanHistoryHum });
  }
  calculateFanHistory(min, max, history) {
    return history.reduce((a, x) => {
      let m = {false: min, true: max, null: min};
      let xyObj = x => ({x: Date.parse(x.time), y: m[x.f]});
      let last = a[a.length-1];
      if (!a.length) { // first
        a.push(xyObj(x));
      } else if (m[x.f] !== last.y) {
        let curXy = xyObj(x);
        a.push((z => ({x: curXy.x - 1, y: z.y}))(last));
        a.push(curXy);
      }
      return a;
    }, []);
  }
}


const HISTORY = gql`
  query History($from: String!, $to: String!) {
    history(from: $from, to: $to) {time,t,h,f}
  }
`;

export default withApollo(Chart);