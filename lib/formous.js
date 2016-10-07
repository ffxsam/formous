'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

        var _this = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, props));

        _this.clearForm = function () {
          var updatedFields = _this.initializeFields(true);
          _this.updateFields((0, _immutable.fromJS)(updatedFields));
        };

        _this.validateForm = function () {
          var fields = _this.state.fields.reduce(function (updated, field, name) {
            return updated.setIn([name, 'dirty'], true);
          }, _this.state.fields);
          var updatedFields = _this.validate(fields);

          var formState = _extends({}, _this.updateFormValidity(updatedFields), {
            touched: true
          });

          return {
            fields: updatedFields,
            formState: formState
          };
        };

        _this.handleSubmit = function (formHandler) {
          return function (event) {
            event.preventDefault();

            var _this$validateForm = _this.validateForm();

            var fields = _this$validateForm.fields;
            var formState = _this$validateForm.formState;


            _this.setState({ fields: fields, form: formState }, function () {
              formHandler(formState, fields.map(function (field) {
                return { value: field.get('value') };
              }).toJS());
            });
          };
        };

        _this.initializeFields = function (reset) {
          var updatedFields = {};

          for (var fieldName in options.fields) {
            var fieldSpec = _extends({}, options.fields[fieldName], {
              dirty: false,
              name: fieldName
            });

            var events = {
              onBlur: _this.onBlur.bind(_this, fieldSpec),
              onChange: _this.onChange.bind(_this, fieldSpec),
              onFocus: _this.onFocus.bind(_this, fieldSpec),
              onValidatedChange: _this.onValidatedChange.bind(_this, fieldSpec)
            };

            var testResults = _this.testField(fieldSpec, '', true);

            updatedFields[fieldName] = {
              events: events,
              valid: (0, _helpers.allTestsPassed)(testResults),
              value: reset ? '' : _this.state.fields.getIn([fieldName, 'value']) || ''
            };
          }

          return updatedFields;
        };

        _this.isFormValid = function (fields, options) {
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
          }).every(function (field) {
            return field.valid;
          });

          return typeof formValid === 'boolean' ? formValid : formValid.valid;
        };

        _this.markFieldAsValid = function (fieldName, valid, options) {
          var fields = _this.state.fields.mergeDeep(_defineProperty({}, fieldName, {
            failProps: options.quietly ? undefined : options.failProps,
            valid: valid
          }));

          _this.updateFields(fields);
        };

        _this.onValidatedChange = function (fieldSpec, _ref) {
          var target = _ref.target;

          var field = _this.state.fields.get(fieldSpec.name).merge((0, _immutable.Map)({
            value: target.value,
            dirty: true
          }));
          var fields = _this.state.fields.set(fieldSpec.name, field);
          var testResult = _this.checkField(field, fieldSpec, fields);

          var updatedField = field.merge((0, _immutable.Map)({
            failProps: testResult.failProps,
            valid: testResult.passed
          }));
          _this.setState({
            fields: fields.set(fieldSpec.name, updatedField)
          });
        };

        _this.updateFormFields = function (values) {
          var mapValues = (0, _immutable.Map)(values);
          var fields = mapValues.reduce(function (allFields, value, fieldName) {
            return allFields.setIn([fieldName, 'value'], value);
          }, _this.state.fields);

          var updatedFields = mapValues.reduce(function (allFields, value, fieldName) {
            var fieldSpec = options.fields[fieldName];
            var field = allFields.get(fieldName);
            var testResult = _this.checkField(field, fieldSpec, allFields);
            var updatedField = allFields.get(fieldName).merge((0, _immutable.Map)({
              value: value,
              failProps: testResult.quiet ? undefined : testResult.failProps,
              valid: testResult.passed
            }));
            return allFields.set(fieldName, updatedField);
          }, fields);

          _this.setState({
            fields: updatedFields,
            form: _this.updateFormValidity(updatedFields)
          });
        };

        _this.onBlur = function (fieldSpec, _ref2) {
          var target = _ref2.target;

          var field = _this.state.fields.get(fieldSpec.name);
          var updatedFields = _this.state.fields.set(fieldSpec.name, field.merge((0, _immutable.Map)({
            value: target.value,
            dirty: true
          })));
          var validatedFields = _this.validate(updatedFields);
          _this.setState({
            currentField: undefined,
            fields: validatedFields,
            form: _this.updateFormValidity(validatedFields)
          });
        };

        _this.onChange = function (fieldSpec, _ref3) {
          var target = _ref3.target;

          _this.setState({
            fields: _this.state.fields.setIn([fieldSpec.name, 'value'], target.value)
          });
        };

        _this.onFocus = function (fieldSpec) {
          _this.setState({
            currentField: fieldSpec,
            form: _extends({}, _this.state.form, {
              touched: true
            })
          });
        };

        _this.setDefaultValues = function (defaultData) {
          if (!_this.defaultsSet) {
            var defaults = {};

            for (var fieldName in defaultData) {
              var field = _extends({}, options.fields[fieldName], {
                name: fieldName
              });
              var tests = options.fields[fieldName] && options.fields[fieldName].tests;
              var testResults = void 0;

              if (tests) {
                testResults = _this.testField(field, defaultData[fieldName], true);
              } else {
                testResults = [];
              }

              defaults[fieldName] = (0, _immutable.Map)({
                valid: (0, _helpers.allTestsPassed)(testResults),
                value: defaultData[fieldName]
              });
            }

            var fields = _this.state.fields.mergeDeep(defaults);

            _this.updateFields(fields);
            _this.defaultsSet = true;
          }
        };

        _this.validate = function (fields) {
          var valids = (0, _immutable.Map)(options.fields).reduce(function (allFields, fieldSpec, name) {
            var field = allFields.get(name);
            var dirty = field.get('dirty');
            if (!dirty) {
              return allFields.set(name, field);
            }
            var valid = _this.checkField(field, fieldSpec, allFields);

            var validatedFields = allFields.set(name, field.merge((0, _immutable.Map)({
              valid: valid.passed,
              failProps: valid.failProps
            })));

            if (fieldSpec.alsoTest) {
              var alsoValidatedFields = fieldSpec.alsoTest.reduce(function (alsoFields, fieldName) {
                var alsoField = allFields.get(fieldName);
                var alsoFieldSpec = options.fields[fieldName];
                var alsoResult = _this.checkField(alsoField, alsoFieldSpec, alsoFields);
                var allAlsoFields = alsoFields.set(fieldName, alsoField.merge((0, _immutable.Map)({
                  valid: alsoResult.passed,
                  failProps: alsoResult.failProps
                })));
                return allAlsoFields;
              }, validatedFields);
              return alsoValidatedFields;
            }

            return validatedFields;
          }, fields);
          return valids;
        };

        _this.checkField = function (field, fieldSpec, fields) {
          return fieldSpec.tests.reduce(function (result, testSpec) {
            if (result.passed) {
              var testResult = testSpec.test(field.get('value'), fields.toJS());
              return {
                passed: testResult,
                failProps: !testResult ? testSpec.failProps : undefined
              };
            }
            return result;
          }, { passed: true, failProps: undefined });
        };

        _this.testField = function (fieldSpec, value, initial) {
          var tests = fieldSpec.tests;
          var completedTests = [];
          var failedTestCount = 0;

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = tests[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var test = _step.value;

              var testResult = test.test(value, _this.state.fields.toJS());

              completedTests = [_extends({}, test, {
                passed: testResult,
                fieldName: fieldSpec.name
              })];

              if (!testResult) break;
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

          failedTestCount = completedTests.filter(function (test) {
            return !test.passed;
          }).length;

          if (fieldSpec.alsoTest && !initial && failedTestCount === 0) {
            fieldSpec.alsoTest.forEach(function (fieldName) {
              var fieldInfo = _extends({}, options.fields[fieldName], {
                name: fieldName
              });
              var fieldValue = _this.state.fields.getIn([fieldName, 'value']);
              var sideEffectTests = _this.testField(fieldInfo, fieldValue);

              sideEffectTests = sideEffectTests.map(function (test) {
                return _extends({}, test, { quiet: true });
              });

              completedTests = [].concat(_toConsumableArray(completedTests), _toConsumableArray(sideEffectTests));
            });
          }

          return completedTests;
        };

        _this.updateFields = function (fields) {
          _this.setState({
            fields: fields,
            form: _this.updateFormValidity(fields)
          });
        };

        _this.updateFormValidity = function (fields) {
          return _extends({}, _this.state.form, {
            valid: _this.isFormValid(fields)
          });
        };

        _this.defaultsSet = false;
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
          var updatedFields = void 0;

          if (!options.fields) {
            (0, _dx.warn)(false, 'Put fields in their own object. See details: ' + 'https://gist.github.com/ffxsam/1233cef6c60df350cc4d35536428409b');
            options.fields = _extends({}, options);
          }

          (0, _dx2.default)(options);
          updatedFields = this.initializeFields();
          this.updateFields((0, _immutable.fromJS)(updatedFields));
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Wrapped, _extends({}, this.props, {
            clearForm: this.clearForm,
            fields: this.state.fields.toJS(),
            formSubmit: this.handleSubmit,
            formState: this.state.form,
            updateFormFields: this.updateFormFields,
            setDefaultValues: this.setDefaultValues
          }));
        }
      }]);

      return _class2;
    }(_react.Component);
  };
};

exports.default = Formous;