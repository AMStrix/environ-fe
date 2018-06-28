import React, { Component } from "react";
import ReactDOM from "react-dom";
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Measure from 'react-measure';

import Chart from './Chart';

class App extends Component {
  constructor() {
    super();
    this.state = {
      dimensions: {
        width: -1,
        height: -1
      }
    };
  }
  render() {
    if (this.props.currentData && this.props.currentData.loading) {
      return <div>Loading...</div>;
    }

    if (this.props.currentData && this.props.currentData.error) {
      return <div>currentData query error</div>;
    }

    return (
      <Measure bounds onResize={(x) => this.setState({ dimensions: x.bounds })}>
      {({ measureRef }) => 
        <div ref={measureRef}>
          Temperature: {this.props.currentData.currentTemperature}°F <br/>
          Humidity: {this.props.currentData.currentHumidity}%<br/>
          Fan: {this.props.currentData.currentFanState ? 'on' : 'off'}
          { this.state.dimensions.width > 0 && 
            <Chart 
              width={this.state.dimensions.width}
              temperature={this.props.currentData.currentTemperature}
              humidity={this.props.currentData.currentHumidity} />
          }
        </div>
      }
      </Measure>
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