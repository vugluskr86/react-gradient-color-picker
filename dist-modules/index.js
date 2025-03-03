'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _rcColorPicker = require('rc-color-picker');

var _rcColorPicker2 = _interopRequireDefault(_rcColorPicker);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HandlerWidth = 4;
var ColorPickerWidth = 16;
var Width = 300;
var Height = 15;
var DefaultColorSpace = 'HSL';

var ColorSpaces = {
    'HSL': _d2.default.interpolateHsl,
    'HCL': _d2.default.interpolateHcl,
    'Lab': _d2.default.interpolateLab,
    'RGB': _d2.default.interpolateRgb
};

var DefaultStops = [{ offset: 0.0, color: '#00f', opacity: 1.0 }, { offset: 0.5, color: '#0f0', opacity: 0.5 }, { offset: 1.0, color: '#f00', opacity: 1.0 }];

var CompareOffset = function CompareOffset(a, b) {
    return a.offset - b.offset;
};
var ColorPickerID = function ColorPickerID(containerID, idx) {
    return containerID + '_gc-cp_' + idx;
};

var ReactGradientColorPicker = function (_React$Component) {
    _inherits(ReactGradientColorPicker, _React$Component);

    function ReactGradientColorPicker(props) {
        _classCallCheck(this, ReactGradientColorPicker);

        // TODO: how to get auto-expanded width
        var _this = _possibleConstructorReturn(this, (ReactGradientColorPicker.__proto__ || Object.getPrototypeOf(ReactGradientColorPicker)).call(this, props));

        var rootHeight = Height;
        var rootWidth = Width;
        if (_this.props.width) {
            rootWidth = _this.props.width;
        }

        _this.containerID = _lodash2.default.uniqueId('gc-canvas_');
        _this.svg = null;
        var defaultStops = _this.props.stops || DefaultStops;
        var stops = defaultStops.map(function (stop, idx) {
            return {
                idx: idx,
                x: rootWidth * stop.offset,
                offset: stop.offset,
                color: stop.color,
                opacity: stop.opacity
            };
        });

        var initColorSpace = DefaultColorSpace;
        if (_this.props.colorSpace) {
            if (ColorSpaces.hasOwnProperty(_this.props.colorSpace)) {
                initColorSpace = _this.props.colorSpace;
            } else {
                /* eslint-disable no-console */
                console.error('Incorrect props: colorSpace should be one of [HSL,HCL,Lab,RGB]');
                /* eslint-enable no-console */
            }
        }

        // init state
        _this.state = {
            rootWidth: rootWidth,
            rootHeight: rootHeight,
            colorSpace: initColorSpace,
            stops: stops
        };
        return _this;
    }

    _createClass(ReactGradientColorPicker, [{
        key: '_addHandler',
        value: function _addHandler(mouseX) {
            var offset = 1.0 * mouseX / this.state.rootWidth;
            var midColor = this.colorScale(offset);
            var newStop = {
                idx: this.state.stops.length,
                x: mouseX,
                offset: offset,
                color: midColor,
                opacity: 1.0
            };
            var newStops = this.state.stops.concat([newStop]);
            newStops.sort(CompareOffset);
            this.setState({ stops: newStops });

            this._notifyChange();
        }
    }, {
        key: '_removeHandler',
        value: function _removeHandler(idx) {
            var oldStops = this.state.stops;

            var stopIdx = _lodash2.default.findIndex(this.state.stops, { idx: idx });
            if (stopIdx !== -1) {
                this.setState({
                    stops: [].concat(_toConsumableArray(oldStops.slice(0, stopIdx)), _toConsumableArray(oldStops.slice(stopIdx + 1)))
                });
            }
        }
    }, {
        key: '_dragHandler',
        value: function _dragHandler(d, mouseX, colorPickerID) {
            // only update handler position but not state
            d.x = mouseX;
            _d2.default.select(this).attr('x', mouseX);
            _d2.default.select('#' + colorPickerID).style('left', d.x - ColorPickerWidth / 2 + 'px').style('top', Height + 'px');
        }
    }, {
        key: '_dragHandlerEnd',
        value: function _dragHandlerEnd(d) {
            // when the end of drag, update the state once.
            var newStops = _lodash2.default.cloneDeep(this.state.stops);
            var currentHandler = _lodash2.default.find(newStops, { 'idx': d.idx });
            currentHandler.offset = 1.0 * d.x / this.state.rootWidth;
            currentHandler.x = d.x;
            this.setState({ stops: newStops });

            this._notifyChange();
        }
    }, {
        key: '_notifyChange',
        value: function _notifyChange() {
            if (this.props.onChange) {
                this.props.onChange(this.state.stops, this.colorScale);
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            // TODO: get the auto-expanded comonent width
            var rootWidth = this.refs.root.offsetWidth;
            var rootHeight = this.state.rootHeight;
            if (this.props.width) {
                rootWidth = this.props.width;
            }
            var newStops = this.state.stops.map(function (stop) {
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
            this.canvas = _d2.default.select('#' + this.containerID).append('canvas').attr('width', rootWidth).attr('height', 1).style('width', rootWidth + 'px').style('height', rootHeight + 'px');

            this.svg = _d2.default.select('#' + this.containerID).append('svg').attr('width', rootWidth).attr('height', rootHeight);

            this.colorMap = this.svg.append('rect').attr('id', 'gc-color-map').attr('x', 0).attr('y', 0).attr('width', rootWidth).attr('height', rootHeight).attr('fill', 'rgba(0,0,0,0)').on('click', function clickColorMap() {
                var mouseX = _d2.default.mouse(this)[0];
                self._addHandler(mouseX);
            });
        }
    }, {
        key: '_refreshCanvas',
        value: function _refreshCanvas() {
            if (this.svg === null) {
                return;
            }

            var rootWidth = this.state.rootWidth;
            var rootHeight = this.state.rootHeight;

            // refresh canvas size
            this.canvas.attr('width', this.state.rootWidth).attr('height', 1).style('width', this.state.rootWidth + 'px').style('height', this.state.rootHeight + 'px');

            this.svg.attr('width', rootWidth).attr('height', rootHeight);

            // refresh color scale
            var stops = this.state.stops.map(function iterator(s) {
                return {
                    offset: s.offset,
                    color: s.color,
                    opacity: s.opacity
                };
            }).sort(CompareOffset);
            var offsets = _lodash2.default.map(stops, 'offset');
            var colors = _lodash2.default.map(stops, 'color');
            var opacity = _lodash2.default.map(stops, 'opacity');

            this.colorScale = _d2.default.scale.linear().domain(offsets).range(colors).interpolate(ColorSpaces[this.state.colorSpace]);

            this.opacityScale = _d2.default.scale.linear().domain(offsets).range(opacity);

            var _localColorScale = this.colorScale;
            var _localOpacityScale = this.opacityScale;

            this.colorMap.attr('width', rootWidth).attr('height', rootHeight);

            this.canvas.each(function renderCanvas() {
                var context = this.getContext('2d'),
                    image = context.createImageData(rootWidth, 1);
                for (var i = 0, j = -1, c, a; i < rootWidth; ++i) {
                    c = _d2.default.rgb(_localColorScale(i * 1.0 / rootWidth));
                    a = _localOpacityScale(i * 1.0 / rootWidth);
                    image.data[++j] = c.r;
                    image.data[++j] = c.g;
                    image.data[++j] = c.b;
                    image.data[++j] = a * 255;
                }
                context.putImageData(image, 0, 0);
            });
            // refresh gradient
            var gradientID = this.containerID + '_gc-gradient';
            this.gradient = this.svg.select('#' + gradientID).attr('x2', rootWidth).selectAll('stop').data(this.state.stops);

            // enter stops
            this.gradient.enter().append('stop').attr('offset', function offsetAccessor(d) {
                return d.offset * 100 + '%';
            }).attr('stop-color', function colorAccessor(d) {
                return d.color;
            });
            // update existing stops
            this.gradient.attr('offset', function (d) {
                return (d.offset * 100).toString() + '%';
            }).attr('stop-color', function (d) {
                return d.color;
            });

            // remove non-exist stops
            this.gradient.exit().remove();

            // refresh handlers
            this.handlers = this.svg.selectAll('.gc-handler').data(this.state.stops);

            // enter new handlers
            var self = this;
            var dragCallback = function dragCallback(d) {
                var newX = _d2.default.event.x;
                if (newX >= 0 && newX <= self.state.rootWidth) {
                    self._dragHandler.call(this, d, newX, ColorPickerID(self.containerID, d.idx));
                }
            };
            var drag = _d2.default.behavior.drag().origin(Object).on('drag', dragCallback).on('dragend', this._dragHandlerEnd.bind(this));

            this.handlers.enter().append('rect').attr('class', 'gc-handler').attr('x', function xPos(d) {
                return d.x - HandlerWidth / 2;
            }.bind(this)).attr('y', '0').attr('width', HandlerWidth).attr('height', rootHeight).call(drag);

            // update existing handlers
            this.handlers.attr('x', function xPos(d) {
                return d.x - HandlerWidth / 2;
            }.bind(this));

            // remove non-exist handlers
            this.handlers.exit().remove();

            // refresh the color pickers
            this.state.stops.forEach(function iterator(s) {
                _d2.default.select('#' + ColorPickerID(this.containerID, s.idx)).style('left', s.x - ColorPickerWidth / 2 + 'px').style('top', Height + 'px');
            }.bind(this));
        }
    }, {
        key: 'render',
        value: function render() {
            this._refreshCanvas();

            var colorChangeCallback = function colorChangeCallback(color, opacity, idx) {
                var newStops = _lodash2.default.cloneDeep(this.state.stops);
                var currentHandler = _lodash2.default.find(newStops, { 'idx': idx });
                currentHandler.color = color;
                currentHandler.opacity = 1.0 * opacity / 100;
                this.setState({ stops: newStops });

                // notify change
                if (this.props.onChange) {
                    this.props.onChange(this.state.stops, this.colorScale);
                }
            }.bind(this);
            var colorpickers = this.state.stops.map(function iterator(s) {
                var _this2 = this;

                var pickerId = ColorPickerID(this.containerID, s.idx);
                var removeCallback = function removeCallback() {
                    return _this2._removeHandler(s.idx);
                };
                var callback = function callback(c) {
                    return colorChangeCallback(c.color, c.alpha, s.idx);
                };
                var style = {
                    left: s.x - ColorPickerWidth / 2 + 'px',
                    top: Height + 'px'
                };
                return _react2.default.createElement(
                    'div',
                    { key: pickerId, className: 'gc-colorpicker', style: style },
                    _react2.default.createElement(
                        'div',
                        { id: pickerId,
                            key: pickerId },
                        _react2.default.createElement(_rcColorPicker2.default, { animation: 'slide-up',
                            color: s.color,
                            alpha: s.opacity * 100,
                            onChange: callback,
                            placement: 'bottomLeft' })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'remove-btn',
                            onClick: removeCallback },
                        ' x '
                    )
                );
            }.bind(this));
            return _react2.default.createElement(
                'div',
                { className: 'gc-container',
                    ref: 'root' },
                ' ',
                colorpickers,
                ' ',
                _react2.default.createElement(
                    'div',
                    { className: 'gc-canvas',
                        id: this.containerID },
                    ' '
                ),
                ' '
            );
        }

        // Publid API:

    }, {
        key: 'getColorMap',
        value: function getColorMap() {
            return this.colorScale;
        }
    }, {
        key: 'getColorStops',
        value: function getColorStops() {
            return this.state.stops;
        }
    }]);

    return ReactGradientColorPicker;
}(_react2.default.Component);

ReactGradientColorPicker.propTypes = {
    stops: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.object),
    colorSpace: _react2.default.PropTypes.string,
    onChange: _react2.default.PropTypes.func,
    width: _react2.default.PropTypes.number
};

module.exports = ReactGradientColorPicker;