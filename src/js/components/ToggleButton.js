import React, { Component } from "react";

class ToggleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (   
        <button 
            onClick={this.props.onClick}
            disabled={this.props.disabled} 
            style={{outline: 'none', backgroundColor: this.props.on ? 'tan' : 'white'}}>
            {this.props.children}
        </button>
    );
  }
}

export default ToggleButton;
