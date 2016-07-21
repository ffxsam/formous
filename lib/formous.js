'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _meteorReactPrebind = require('meteor-react-prebind');

var _meteorReactPrebind2 = _interopRequireDefault(_meteorReactPrebind);

var _immutable = require('immutable');

var _dx = require('./dx');

var _dx2 = _interopRequireDefault(_dx);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Formous = function Formous(options) {
  return function (Wrapped) {
    return function (_Component) {
      _inherits(_class2, _Component);

      function _class2(props) {
        _classCallCheck(this, _class2);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class2).call(this, props));

        (0, _meteorReactPrebind2.default)(_this);

        _this.defaultsSet = false;
        window.Formous = _this;

        _this.state = {
          fields: (0, _immutable.Map)({}),
          form: {
            touched: false,
            valid: false
          }
        };
        return _this;
      }

      _createClass(_class2, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
          var updatedFields = {};

          if (!options.fields) {
            (0, _dx.warn)(false, 'Put fields in their own object. See details: ' + 'https://gist.github.com/ffxsam/1233cef6c60df350cc4d35536428409b');
            options.fields = _extends({}, options);
          }

          (0, _dx2.default)(options);

          for (var fieldName in options.fields) {
            var fieldSpec = _extends({}, options.fields[fieldName], {
              name: fieldName
            });

            var events = {
              onBlur: this.onBlur.bind(this, fieldSpec),
              onChange: this.onChange.bind(this, fieldSpec),
              onFocus: this.onFocus.bind(this)
            };

            var testResults = this.testField(fieldSpec, '', true);

            updatedFields[fieldName] = {
              events: events,
              valid: (0, _helpers.allTestsPassed)(testResults),
              value: this.state.fields.getIn([fieldName, 'value']) || ''
            };
          }

          this.setState({
            fields: (0, _immutable.fromJS)(updatedFields)
          }, this.setFormValidity);
        }
      }, {
        key: 'formSubmit',
        value: function formSubmit(formHandler) {
          var _this2 = this;

          return function (event) {
            event.preventDefault();
            formHandler(_this2.state.form, _this2.state.fields.map(function (field) {
              return { value: field.get('value') };
            }).toJS());
          };
        }
      }, {
        key: 'isFormValid',
        value: function isFormValid(fields, options) {
          var excludeField = options && options.excludeField;
          var stateFields = fields.toJS();
          var examineFields = Object.keys(stateFields).filter(function (fieldName) {
            return fieldName !== excludeField;
          });

          if (examineFields.length === 0) return true;

          var formValid = Object.keys(stateFields).filter(function (fieldName) {
            return fieldName !== excludeField;
          }).map(function (fieldName) {
            return stateFields[fieldName];
          }).reduce(function (a, b) {
            return ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' ? a.valid : a) && b.valid;
          });

          return typeof formValid === 'boolean' ? formValid : formValid.valid;
        }
      }, {
        key: 'markFieldAsValid',
        value: function markFieldAsValid(fieldName, valid, options) {
          this.setState({
            fields: this.state.fields.mergeDeep(_defineProperty({}, fieldName, {
              failProps: options.quietly ? undefined : options.failProps,
              valid: valid
            }))
          }, this.setFormValidity);
        }
      }, {
        key: 'onBlur',
        value: function onBlur(fieldSpec, _ref) {
          var target = _ref.target;

          var completedTests = this.testField(fieldSpec, target.value);

          this.setFieldsValidity(fieldSpec, completedTests);
        }
      }, {
        key: 'onChange',
        value: function onChange(fieldSpec, _ref2) {
          var target = _ref2.target;

          this.setState({
            fields: this.state.fields.setIn([fieldSpec.name, 'value'], target.value)
          });
        }
      }, {
        key: 'onFocus',
        value: function onFocus() {
          this.setState({
            form: _extends({}, this.state.form, {
              touched: true
            })
          });
        }
      }, {
        key: 'setDefaultValues',
        value: function setDefaultValues(defaultData) {
          if (!this.defaultsSet) {
            var defaults = {};

            for (var fieldName in defaultData) {
              var field = options.fields[fieldName];
              var tests = options.fields[fieldName] && options.fields[fieldName].tests;
              var testResults = void 0;

              if (tests) {
                testResults = this.testField(field, defaultData[fieldName], true);
              } else {
                testResults = [];
              }

              defaults[fieldName] = {
                valid: (0, _helpers.allTestsPassed)(testResults),
                value: defaultData[fieldName]
              };
            }

            var fields = this.state.fields.mergeDeep(defaults);

            this.setState({
              fields: fields,
              form: _extends({}, this.state.form, {
                valid: this.isFormValid(fields)
              })
            });

            this.defaultsSet = true;
          }
        }
      }, {
        key: 'setFieldsValidity',
        value: function setFieldsValidity(fieldSpec, tests) {
          var updatedFields = {};

          if (tests.length === 0) {
            (0, _dx.warn)(false, 'We should never see this? If you see this, please submit' + 'an issue at https://github.com/ffxsam/formous/issues');
          } else {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = tests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var test = _step.value;

                updatedFields[test.fieldName] = {
                  failProps: test.passed || test.quiet ? undefined : test.failProps,
                  valid: test.passed
                };
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            this.setState({
              fields: this.state.fields.mergeDeep(_extends({}, updatedFields))
            }, this.setFormValidity);
          }
        }
      }, {
        key: 'setFormValidity',
        value: function setFormValidity() {
          this.setState({
            form: _extends({}, this.state.form, {
              valid: this.isFormValid(this.state.fields)
            })
          });
        }
      }, {
        key: 'testField',
        value: function testField(fieldSpec, value, initial) {
          var _this3 = this;

          var tests = fieldSpec.tests;
          var completedTests = [];
          var failedTestCount = 0;

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = tests[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var test = _step2.value;

              var testResult = test.test(value, this.state.fields.toJS());

              completedTests = [_extends({}, test, {
                passed: testResult,
                fieldName: fieldSpec.name
              })];

              if (!testResult) break;
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          failedTestCount = completedTests.filter(function (test) {
            return !test.passed;
          }).length;

          if (fieldSpec.alsoTest && !initial && failedTestCount === 0) {
            fieldSpec.alsoTest.forEach(function (fieldName) {
              var fieldInfo = options.fields[fieldName];
              var fieldValue = _this3.state.fields.getIn([fieldName, 'value']);
              var sideEffectTests = _this3.testField(fieldInfo, fieldValue);

              sideEffectTests = sideEffectTests.map(function (test) {
                return _extends({}, test, { quiet: true });
              });

              completedTests = [].concat(_toConsumableArray(completedTests), _toConsumableArray(sideEffectTests));
            });
          }

          return completedTests;
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Wrapped, _extends({}, this.props, {
            fields: this.state.fields.toJS(),
            formSubmit: this.formSubmit,
            setDefaultValues: this.setDefaultValues
          }));
        }
      }]);

      return _class2;
    }(_react.Component);
  };
};

exports.default = Formous;