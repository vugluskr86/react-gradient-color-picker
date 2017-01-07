import React from 'react';
import ReactGradientColorPicker from '../src/index'

export default class Demo extends React.Component {

  render() {
    var style = {
      width: '800px',
      height: '200px'
    };
    var stops = [
      {offset: 0.0, color: '#f00', opacity: 1.0},
      {offset: 0.5, color: '#0f0', opacity: 0.5},
      {offset: 1.0, color: '#00f', opacity: 0.1}
    ];
    /* eslint-disable no-unused-vars */
    var onChangeCallback = function onChangeCallback(colorStops, colorMap) {
      // colorStops: an array of color stops
      // colorMap: a d3 linear scale function
      // how to get the mapped color:
      // var mappedColor = colorMap(0.8);
    }
    /* eslint-enable no-unused-vars */
    return (
      <div style={style}>
        <div className="left halfWidth"> 
          <p>HSL</p>
          <ReactGradientColorPicker 
            colorSpace="HSL"
            onChange={onChangeCallback}
            stops={stops}
            width={350} />
          <p>HCL</p>
          <ReactGradientColorPicker 
            colorSpace="HCL"
            onChange={onChangeCallback}
            stops={stops}
            width={350} />

        </div>
        <div className="right halfWidth"> 
          <p>Lab</p>
          <ReactGradientColorPicker 
            colorSpace="Lab"
            onChange={onChangeCallback}
            stops={stops}
            width={350} />
          <p>RGB</p>
          <ReactGradientColorPicker 
            colorSpace="RGB"
            onChange={onChangeCallback}
            stops={stops}
            width={350} />
        </div>
      </div>
    );
  }
  
}
