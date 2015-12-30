import React from 'react';
import ReactGradientColorPicker from '../src/index'

export default class Demo extends React.Component {
  render() {
  	var style = {
  		width: '300px'
  	};
  	var stops = [
  		{offset: 0.0, color: '#f00'},
      {offset: 0.5, color: '#fff'},
      {offset: 1.0, color: '#0f0'}
  	];
  	var onChangeCallback = function onChangeCallback(colorMap) {
  		// var mappedColor = colorMap(0.8);
  		// console.log(mappedColor);
  	}
    return (
	    <div style={style}>
	    	<ReactGradientColorPicker onChange={onChangeCallback} stops={stops}/>
	    </div>
    );
  }
  
}
