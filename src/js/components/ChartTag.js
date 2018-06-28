import React, { Component } from "react";

class ChartTag extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (                            
        <g transform="scale(0.15) translate(0, -60)">
            <path 
                fill={this.props.tagColor} 
                strokeLinejoin="round" 
                fillRule="nonzero"  
                d="M1.0000031167909607,64.83647055280849 L43.082916945685035,1.00000091303761 L400,1.00000091303761 L400,128.67294674507522 L43.082916945685035,128.67294674507522 L1.0000031167909607,64.83647055280849 z" 
            />
            <text 
                style={{font: '100px sans-serif'}} 
                fill={this.props.textColor} 
                x="200px" 
                y="50%" 
                textAnchor="middle" >
                {this.props.text||'n/a'}
            </text>
        </g>
    );
  }
}

export default ChartTag;