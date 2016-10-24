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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
          var updatedFields = _this.initializeFields();
          _this.updateFields((0, _immutable.fromJS)(updatedFields));
        };

        _this.validateForm = function (fields) {
          var markDirty = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          var fieldsTouched = fields.reduce(function (touched, field) {
            return touched || field.get('dirty');
          }, false);

          var dirtyFields = markDirty ? fields.reduce(function (fields, field, fieldName) {
            return fields.set(fieldName, field.set('dirty', true));
          }, _this.state.fields) : fields;

          var validatedFields = dirtyFields.reduce(function (updated, field, name) {
            return _this.onChangeField(field, name, updated);
          }, fields);

          return {
            fields: validatedFields,
            form: _extends({}, _this.updateFormValidity(validatedFields), {
              touched: fieldsTouched
            })
          };
        };

        _this.handleSubmit = function (formHandler) {
          return function (event) {
            event.preventDefault();

            var _this$validateForm = _this.validateForm(_this.state.fields, true);

            var fields = _this$validateForm.fields;
            var form = _this$validateForm.form;


            _this.setState({ fields: fields, form: form }, function () {
              formHandler(form, fields.map(function (field) {
                return { value: field.get('value') };
              }).toJS());
            });
          };
        };

        _this.initializeFields = function () {
          var updatedFields = (0, _immutable.Map)(options.fields).reduce(function (fields, field, fieldName) {
            var fieldSpec = _extends({}, options.fields[fieldName], {
              name: fieldName
            });

            var events = {
              onBlur: _this.onBlur.bind(_this, fieldSpec),
              onChange: _this.onChange.bind(_this, fieldSpec),
              onFocus: _this.onFocus.bind(_this, fieldSpec),
              onValidatedChange: _this.onValidatedChange.bind(_this, fieldSpec)
            };

            var updatedFields = fields.set(fieldName, (0, _immutable.Map)({
              events: events,
              dirty: false,
              criticalFail: false,
              failProps: undefined,
              value: ''
            }));
            return updatedFields;
          }, (0, _immutable.Map)());

          return updatedFields;
        };

        _this.getFieldSpec = function (name) {
          return options.fields[name];
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
            return !field.failProps || !field.criticalFail;
          });

          return typeof formValid === 'boolean' ? formValid : formValid.valid;
        };

        _this.onValidatedChange = function (fieldSpec, _ref) {
          var target = _ref.target;

          var field = _this.state.fields.get(fieldSpec.name).merge((0, _immutable.Map)({
            value: target.value,
            dirty: true
          }));
          var fields = _this.state.fields.set(fieldSpec.name, field);

          var _this$validateForm2 = _this.validateForm(fields);

          var formFields = _this$validateForm2.fields;
          var form = _this$validateForm2.form;


          _this.setState({
            fields: formFields,
            form: form
          });
        };

        _this.updateFormFields = function (values) {
          var mapValues = (0, _immutable.Map)(values);
          var fields = mapValues.reduce(function (allFields, value, fieldName) {
            var field = allFields.get(fieldName);
            return allFields.set(fieldName, field.merge((0, _immutable.Map)({ value: value, dirty: true })));
          }, _this.state.fields);

          var _this$validateForm3 = _this.validateForm(fields);

          var validatedFields = _this$validateForm3.fields;
          var form = _this$validateForm3.form;


          _this.setState({
            fields: validatedFields,
            form: form
          });
        };

        _this.onBlur = function (fieldSpec) {
          var field = _this.state.fields.get(fieldSpec.name).set('dirty', true);
          var updatedFields = _this.state.fields.set(fieldSpec.name, field);

          var _this$validateForm4 = _this.validateForm(updatedFields);

          var fields = _this$validateForm4.fields;
          var form = _this$validateForm4.form;

          _this.setState({
            currentField: undefined,
            fields: fields,
            form: form
          });
        };

        _this.onChange = function (fieldSpec, _ref2) {
          var target = _ref2.target;

          var updatedField = _this.state.fields.get(fieldSpec.name).merge((0, _immutable.Map)({
            value: target.value,
            dirty: true
          }));
          _this.setState({
            fields: _this.state.fields.set(fieldSpec.name, updatedField)
          });
        };

        _this.onFocus = function (fieldSpec) {
          _this.setState({
            currentField: fieldSpec
          });
        };

        _this.setDefaultValues = function (defaultData) {
          if (!_this.defaultsSet) {
            var updatedFields = (0, _immutable.Map)(defaultData).reduce(function (fields, value, fieldName) {
              return fields.setIn([fieldName, 'value'], value);
            }, _this.state.fields);
            _this.setState({
              fields: updatedFields
            });
            _this.defaultsSet = true;
          }
        };

        _this.getFieldSpec = function (name) {
          return options.fields[name];
        };

        _this.onChangeField = function (field, fieldName, fields) {
          var checkAlsoTests = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

          var fieldSpec = _this.getFieldSpec(fieldName);
          var testResults = fieldSpec.tests.reduce(function (result, testSpec) {
            if (!result.failProps) {
              var testResult = testSpec.test(field.get('value'), fields.toJS(), field.toJS());
              return {
                failProps: !testResult ? testSpec.failProps : undefined,
                criticalFail: !testResult && testSpec.critical
              };
            }
            return result;
          }, { failProps: undefined, criticalFail: false });
          var validatedField = field.merge((0, _immutable.Map)(testResults));
          var updatedFields = fields.set(fieldName, validatedField);

          var alsoTested = checkAlsoTests && fieldSpec.alsoTest ? fieldSpec.alsoTest.reduce(function (alsoFields, alsoName) {
            var alsoField = updatedFields.get(alsoName);
            return _this.onChangeField(alsoField, alsoName, alsoFields, false);
          }, updatedFields) : updatedFields;

          return alsoTested;
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
          this.updateFields(updatedFields);
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