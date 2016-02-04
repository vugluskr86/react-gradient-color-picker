import React from 'react';
import ReactGradientColorPicker from '../src/index'

export default class Demo extends React.Component {

  render() {
  	var style = {
  		width: '300px',
  		height: '300px'
  	};
  	var stops = [
  		{offset: 0.0, color: '#f00'},
      {offset: 0.5, color: '#0f0'},
      {offset: 1.0, color: '#00f'}
  	];
  	var onChangeCallback = function onChangeCallback(colorStops, colorMap) {
  		// colorStops: an array of color stops
      // colorMap: a d3 linear scale function
      // how to get the mapped color:
      // var mappedColor = colorMap(0.8);
  	}
    return (
    	<div style={style}>
        <p>HSL</p>
	    	<ReactGradientColorPicker 
          colorSpace="HSL"
          onChange={onChangeCallback}
          stops={stops} />
        <p>HCL</p>
        <ReactGradientColorPicker 
          colorSpace="HCL"
          onChange={onChangeCallback}
          stops={stops} />
        <p>Lab</p>
        <ReactGradientColorPicker 
          colorSpace="Lab"
          onChange={onChangeCallback}
          stops={stops} />
        <p>RGB</p>
        <ReactGradientColorPicker 
          colorSpace="RGB"
          onChange={onChangeCallback}
          stops={stops} />
	    </div>
    );
  }
  
}
