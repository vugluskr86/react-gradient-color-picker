'use strict';

import _ from 'lodash';
import ColorPicker from 'react-colors-picker';
import d3 from 'd3';
import React from 'react';

const HandlerWidth = 4;
const ColorPickerWidth = 16;
const Width = 300;
const Height = 15;
const DefaultColorSpace = 'HSL';

const ColorSpaces = {
    'HSL': d3.interpolateHsl,
    'HCL': d3.interpolateHcl,
    'Lab': d3.interpolateLab,
    'RGB': d3.interpolateRgb
};

const DefaultStops = [
    { offset: 0.0, color: '#00f' },
    { offset: 0.5, color: '#0f0' },
    { offset: 1.0, color: '#f00' }
];

const CompareOffset = function CompareOffset(a, b) {
    return a.offset - b.offset;
};
const ColorPickerID = function ColorPickerID(containerID, idx) {
    return containerID + '_gc-cp_' + idx;
}

class ReactGradientColorPicker extends React.Component {

    constructor(props) {
        super(props);

        // TODO: how to get auto-expanded width
        var rootHeight = Height;
        var rootWidth = Width;
        if (this.props.width) {
            rootWidth = this.props.width;
        }

        this.containerID = _.uniqueId('gc-canvas_');
        this.svg = null;
        var defaultStops = this.props.stops || DefaultStops;
        var stops = defaultStops.map((stop, idx) => {
            return {
                idx: idx,
                x: rootWidth * stop.offset,
                offset: stop.offset,
                color: stop.color
            }
        });

        var initColorSpace = DefaultColorSpace;
        if (this.props.colorSpace) {
            if (ColorSpaces.hasOwnProperty(this.props.colorSpace)) {
                initColorSpace = this.props.colorSpace
            } else {
                /* eslint-disable no-console */
                console.error('Incorrect props: colorSpace should be one of [HSL,HCL,Lab,RGB]');
                /* eslint-enable no-console */
            }
        }

        // init state
        this.state = {
            rootWidth: rootWidth,
            rootHeight: rootHeight,
            colorSpace: initColorSpace,
            stops: stops
        };
    }

    _addHandler(mouseX) {
        var offset = 1.0 * mouseX / this.state.rootWidth;
        var midColor = this.colorScale(offset);
        var newStop = {
            idx: this.state.stops.length,
            x: mouseX,
            offset: offset,
            color: midColor
        };
        var newStops = this.state.stops.concat([newStop]);
        newStops.sort(CompareOffset);
        this.setState({ stops: newStops });

        this._notifyChange();
    }

    _dragHandler(d, mouseX, colorPickerID) {
        // only update handler position but not state
        d.x = mouseX;
        d3.select(this).attr('x', mouseX);
        d3.select('#' + colorPickerID)
            .style('left', (d.x - ColorPickerWidth / 2) + 'px')
            .style('top', Height + 'px');
    }

    _dragHandlerEnd(d) {
        // when the end of drag, update the state once.
        var newStops = _.cloneDeep(this.state.stops);
        var currentHandler = _.find(newStops, { 'idx': d.idx });
        currentHandler.offset = 1.0 * d.x / this.state.rootWidth;
        currentHandler.x = d.x;
        this.setState({ stops: newStops });

        this._notifyChange();
    }

    _notifyChange() {
        if (this.props.onChange) {
            this.props.onChange(this.state.stops, this.colorScale);
        }
    }

    componentDidMount() {
        // TODO: get the auto-expanded comonent width
        var rootWidth = this.refs.root.offsetWidth;
        var rootHeight = this.state.rootHeight;
        if (this.props.width) {
            rootWidth = this.props.width;
        }
        var newStops = this.state.stops.map((stop) => {
            stop.x = stop.offset * rootWidth;
            return stop;
        });

        // TODO: this is anti-pattern. should fix it soon.
        /* eslint-disable react/no-did-mount-set-state */
        this.setState({
            rootWidth: rootWidth,
            stops: newStops
        });
        /* eslint-enable react/no-did-mount-set-state */

        var self = this;
        // init canvas
        this.canvas = d3.select('#' + this.containerID)
            .append('canvas')
            .attr('width', rootWidth)
            .attr('height', 1)
            .style('width', rootWidth + 'px')
            .style('height', rootHeight + 'px');

        this.svg = d3.select('#' + this.containerID)
            .append('svg')
            .attr('width', rootWidth)
            .attr('height', rootHeight);

        this.colorMap = this.svg.append('rect')
            .attr('id', 'gc-color-map')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', rootWidth)
            .attr('height', rootHeight)
            .attr('fill', 'rgba(0,0,0,0)')
            .on('click', function clickColorMap() {
                var mouseX = d3.mouse(this)[0];
                self._addHandler(mouseX);
            });
    }

    _refreshCanvas() {
        if (this.svg === null) {
            return;
        }

        var rootWidth = this.state.rootWidth;
        var rootHeight = this.state.rootHeight;

        // refresh canvas size
        this.canvas
            .attr('width', this.state.rootWidth)
            .attr('height', 1)
            .style('width', this.state.rootWidth + 'px')
            .style('height', this.state.rootHeight + 'px');

        this.svg.attr('width', rootWidth)
            .attr('height', rootHeight);

        // refresh color scale
        var stops = this.state.stops.map(function iterator(s) {
            return {
                offset: s.offset,
                color: s.color
            };
        }).sort(CompareOffset);
        var offsets = _.map(stops, 'offset');
        var colors = _.map(stops, 'color');
        this.colorScale = d3.scale.linear()
            .domain(offsets)
            .range(colors)
            .interpolate(ColorSpaces[this.state.colorSpace]);

        var _localColorScale = this.colorScale;

        this.colorMap
            .attr('width', rootWidth)
            .attr('height', rootHeight);

        this.canvas.each(function renderCanvas() {
                var context = this.getContext('2d'),
                    image = context.createImageData(rootWidth, 1);
                for (var i = 0, j = -1, c; i < rootWidth; ++i) {
                    c = d3.rgb(_localColorScale(i * 1.0 / rootWidth));
                    image.data[++j] = c.r;
                    image.data[++j] = c.g;
                    image.data[++j] = c.b;
                    image.data[++j] = 255;
                }
                context.putImageData(image, 0, 0);
            })
            // refresh gradient
        var gradientID = this.containerID + '_gc-gradient';
        this.gradient = this.svg.select('#' + gradientID)
            .attr('x2', rootWidth)
            .selectAll('stop')
            .data(this.state.stops);

        // enter stops
        this.gradient.enter()
            .append('stop')
            .attr('offset', function offsetAccessor(d) {
                return (d.offset * 100) + '%';
            })
            .attr('stop-color', function colorAccessor(d) {
                return d.color;
            });
        // update existing stops
        this.gradient
            .attr('offset', (d) => (d.offset * 100).toString() + '%')
            .attr('stop-color', (d) => d.color);

        // remove non-exist stops
        this.gradient.exit().remove();

        // refresh handlers
        this.handlers = this.svg.selectAll('.gc-handler')
            .data(this.state.stops);

        // enter new handlers
        var self = this;
        var dragCallback = function dragCallback(d) {
            var newX = d3.event.x;
            if (newX >= 0 && newX <= self.state.rootWidth) {
                self._dragHandler.call(this, d, newX, ColorPickerID(self.containerID, d.idx));
            }
        }
        var drag = d3.behavior.drag()
            .origin(Object)
            .on('drag', dragCallback)
            .on('dragend', this._dragHandlerEnd.bind(this));

        this.handlers.enter()
            .append('rect')
            .attr('class', 'gc-handler')
            .attr('x', function xPos(d) {
                return d.x - HandlerWidth / 2;
            }.bind(this))
            .attr('y', '0')
            .attr('width', HandlerWidth)
            .attr('height', rootHeight)
            .call(drag);

        // update existing handlers
        this.handlers
            .attr('x', function xPos(d) {
                return d.x - HandlerWidth / 2;
            }.bind(this));

        // remove non-exist handlers
        this.handlers.exit().remove();

        // refresh the color pickers
        this.state.stops.forEach(function iterator(s) {
            d3.select('#' + ColorPickerID(this.containerID, s.idx))
                .style('left', (s.x - ColorPickerWidth / 2) + 'px')
                .style('top', Height + 'px');
        }.bind(this));

    }

    render() {
        this._refreshCanvas();

        var colorChangeCallback = function colorChangeCallback(color, idx) {
            var newStops = _.cloneDeep(this.state.stops);
            var currentHandler = _.find(newStops, { 'idx': idx });
            currentHandler.color = color;
            this.setState({ stops: newStops });

            // notify change
            if (this.props.onChange) {
                this.props.onChange(this.state.stops, this.colorScale);
            }
        }.bind(this);
        var colorpickers = this.state.stops.map(function iterator(s) {
            let pickerId = ColorPickerID(this.containerID, s.idx);
            let callback = (c) => colorChangeCallback(c.color, s.idx);
            var style = {
                left: (s.x - ColorPickerWidth / 2) + 'px',
                top: Height + 'px'
            }
            return ( < div className = "gc-colorpicker"
                id = { pickerId }
                key = { pickerId }
                style = { style } >
                < ColorPicker animation = "slide-up"
                color = { s.color }
                onChange = { callback }
                placement = "bottomLeft" / >
                < /div>
            );
        }.bind(this));
        return ( < div className = "gc-container"
            ref = "root" > { colorpickers } < div className = "gc-canvas"
            id = { this.containerID } > < /div> < /div>
        );
    }

    // Publid API:
    getColorMap() {
        return this.colorScale;
    }

    getColorStops() {
        return this.state.stops;
    }
}

ReactGradientColorPicker.propTypes = {
    stops: React.PropTypes.arrayOf(React.PropTypes.object),
    colorSpace: React.PropTypes.string,
    onChange: React.PropTypes.func,
    width: React.PropTypes.number
};

module.exports = ReactGradientColorPicker;
