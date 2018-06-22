import React, { Component } from "react";
import ReactDOM from "react-dom";
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Chart from './Chart';

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    if (this.props.currentData && this.props.currentData.loading) {
      return <div>Loading...</div>;
    }

    if (this.props.currentData && this.props.currentData.error) {
      return <div>currentData query error</div>;
    }

    return (
      <div>
        Temperature: {this.props.currentData.currentTemperature}°F <br/>
        Humidity: {this.props.currentData.currentHumidity}%<br/>
        Fan: {this.props.currentData.currentFanState ? 'on' : 'off'}
        <Chart/>
      </div>
    );
  }
}

const CURRENT_DATA = gql`
    query CurrentData {
        currentTemperature,
        currentHumidity,
        currentFanState
    }
`;

export default graphql(
  CURRENT_DATA, 
  { 
    name: 'currentData', 
    options: { pollInterval: 2000 }
  }
) (App);