[![build status](https://secure.travis-ci.org/survivejs/react-component-boilerplate.png)](http://travis-ci.org/survivejs/react-component-boilerplate) [![bitHound Score](https://www.bithound.io/github/survivejs/react-component-boilerplate/badges/score.svg)](https://www.bithound.io/github/survivejs/react-component-boilerplate) [![Dependency Status](https://david-dm.org/survivejs/react-component-boilerplate.svg)](https://david-dm.org/survivejs/react-component-boilerplate)
# react-gradient-color-picker

This is a simple gradient color picker integrated with react. 
The reason I decide to develop it since there's no usable gradient color picker on npm so far (2015/12/30). Please join me to make it better and more useful.

## Basic Usage

* Linting - **npm run lint** - Runs ESLint.
* Testing - **npm test** and **npm run tdd** - Runs Karma/Mocha/Chai/Phantom. Code coverage report is generated through istanbul/isparta to `build/`.
* Developing - **npm start** - Runs the development server at *localhost:8080* and use Hot Module Replacement. You can override the default host and port through env (`HOST`, `PORT`).
* Creating a version - **npm version <x.y.<>** - Updates */dist* and *package.json* with the new version and create a version tag to Git.
* Publishing a version - **npm publish** - Pushes a new version to npm and updates the project site.

## Highlighting Demo

```js
render() {
	var style = {
		width: '300px'
	};
	var stops = [
		{offset: 0.0, color: '#000'},
		{offset: 0.5, color: '#aaa'},
		{offset: 1.0, color: '#fff'}
	];
	var onChangeCallback = function onChangeCallback(colorMap) {
  		console.log(colorMap);
  		// var mappedColor = colorMap(0.8);
  	}
	return (
		<div style={style}>
			<ReactGradientColorPicker onChange={onChangeCallback} stops={stops}/>
		</div>
	);
}
```

## License

*react-gradient-color-picker* is available under MIT. See LICENSE for more details.

