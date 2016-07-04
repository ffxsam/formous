'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _meteorReactPrebind = require('meteor-react-prebind');

var _meteorReactPrebind2 = _interopRequireDefault(_meteorReactPrebind);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Formous = function Formous(fields) {
  return function (Wrapped) {
    return function (_Component) {
      _inherits(_class2, _Component);

      // Flow annotations

      function _class2(props) {
        _classCallCheck(this, _class2);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class2).call(this, props));

        (0, _meteorReactPrebind2.default)(_this);

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

          // Loop through each of the fields passed in
          for (var fieldName in fields) {
            var tests = fields[fieldName].tests;

            // Events that should be attached to the input fields
            var events = {
              onBlur: this.onBlur.bind(this, fieldName, tests),
              onChange: this.onChange.bind(this, fieldName),
              onFocus: this.onFocus.bind(this)
            };

            // Set initial field validity
            // TODO: we can't assume the form is initially blank
            // But how do we get the form input value?
            var testResult = this.testField(fieldName, tests, '');

            updatedFields[fieldName] = {
              events: events,
              valid: !testResult,
              value: this.state.fields.getIn([fieldName, 'value'])
            };
          }

          this.setState({
            fields: (0, _immutable.fromJS)(updatedFields)
          });
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
        value: function isFormValid(options) {
          var excludeField = options && options.excludeField;
          var stateFields = this.state.fields.toJS();
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

          /*
           * If we only have one field, .reduce() will have returned an object, not
           * a boolean.
           */
          return typeof formValid === 'boolean' ? formValid : formValid.valid;
        }
      }, {
        key: 'onBlur',
        value: function onBlur(fieldName, tests, _ref) {
          var target = _ref.target;

          var failedTest = this.testField(fieldName, tests, target.value);
          var formValid = void 0;

          if (failedTest) {
            this.setState({
              fields: this.state.fields.mergeDeep(_defineProperty({}, fieldName, {
                failProps: failedTest.failProps,
                valid: !failedTest.critical
              }))
            });
          } else {
            this.setState({
              fields: this.state.fields.mergeDeep(_defineProperty({}, fieldName, {
                valid: true
              })).deleteIn([fieldName, 'failProps'])
            });
          }

          formValid = this.isFormValid({ excludeField: fieldName });

          this.setState({
            form: _extends({}, this.state.form, {
              valid: formValid && (!failedTest || !failedTest.critical)
            })
          });
        }
      }, {
        key: 'onChange',
        value: function onChange(fieldName, _ref2) {
          var target = _ref2.target;

          this.setState({
            fields: this.state.fields.setIn([fieldName, 'value'], target.value)
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

        // Returns the failed test

      }, {
        key: 'testField',
        value: function testField(fieldName, tests, value) {
          var failedTest = void 0;

          // Run tests on this field
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = tests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _test = _step.value;

              /*
               * Each test object contains the following properties:
               *
               * test(value: string): boolean
               *    The function to test the string. Return true if it passes,
               *    or false if it fails.
               *
               * failProps: Object
               *    The props to apply to a field in case of test failure.
               *
               * critical: boolean
               *    Whether this test failure should prevent form submission or
               *    not.
               */

              if (!_test.test(value)) {
                failedTest = _test;
                if (_test.critical) break;
              }
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

          return failedTest;
        }
      }, {
        key: 'render',
        value: function render() {
          console.log(this.state.fields.toJS());

          return _react2.default.createElement(Wrapped, {
            fields: this.state.fields.toJS(),
            formSubmit: this.formSubmit
          });
        }
      }]);

      return _class2;
    }(_react.Component);
  };
};

exports.default = Formous;