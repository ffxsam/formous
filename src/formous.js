// @flow

import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import type {
  FieldSpecType, TestType, TestResultType,
  UserEventType,
} from './types';
import runChecks, { warn } from './dx';

const Formous = (options: Object): ReactClass<*> => {
  return (Wrapped: ReactClass<*>) => class extends Component {
    // Flow annotations
    defaultsSet: boolean;
    fieldData: Object;
    state: Object;

    constructor(props: Object) {
      super(props);

      this.defaultsSet = false;
      this.state = {
        fields: Map({}),
        form: {
          touched: false,
          valid: false,
        },
      };
    }

    componentWillMount() {
      let updatedFields;

      // Deprecation warning
      if (!options.fields) {
        warn(false, 'Put fields in their own object. See details: ' +
          'https://gist.github.com/ffxsam/1233cef6c60df350cc4d35536428409b');
        options.fields = { ...options };
      }

      // Syntax checking.. for a positive developer experience!
      runChecks(options);
      updatedFields = this.initializeFields();
      this.updateFields(updatedFields);
    }

    clearForm = () => {
      const updatedFields = this.initializeFields(true);
      this.updateFields(fromJS(updatedFields));
    }

    /*
     * Check form validity along with its fields.
     */
    validateForm = (fields: Object, checkFields: boolean = true) => {
      const fieldsTouched = fields.reduce(
        (touched: boolean, field: Object) => {
          return touched || field.get('dirty');
        }, false);
      const dirtyFields = fields.reduce(
        (fields: Object, field: Object, fieldName: string) => {
          return fields.set(fieldName, field.set('dirty', true));
        }, this.state.fields);
      const validatedFields = checkFields ? dirtyFields.reduce(
        (updated: Object, field: Object, name: string) => {
          return this.onChangeField(field, name, updated);
        }, fields) : fields;

      return {
        fields: validatedFields,
        form: {
          ...this.updateFormValidity(validatedFields),
          touched: fieldsTouched,
        },
      };
    }

    /*
     * Submit handler.
     */
    handleSubmit = (formHandler: Function): Function => {
      return (event: Object) => {
        event.preventDefault();

        const { fields, form } = this.validateForm(this.state.fields);

        this.setState({ fields, form }, () => {
          formHandler(
            form,
            fields.map((field: Object) =>
              ({ value: field.get('value') })).toJS(),
          );
        });
      }
    }

    initializeFields = (reset: ?boolean): Object => {
      const updatedFields = Map(options.fields).reduce(
        (fields: Object, field: Object, fieldName: string) => {
          const fieldSpec: Object = {
            ...options.fields[fieldName],
            name: fieldName,
          };

          // Events that should be attached to the input fields
          const events: Object = {
            onBlur: this.onBlur.bind(this, fieldSpec),
            onChange: this.onChange.bind(this, fieldSpec),
            onFocus: this.onFocus.bind(this, fieldSpec),
            onValidatedChange: this.onValidatedChange.bind(this, fieldSpec),
          };

          const updatedFields = fields.set(fieldName, Map({
            events,
            dirty: false,
            criticalFail: false,
            valid: true,
            value: reset
              ? ''
              : (this.state.fields.getIn([fieldName, 'value']) || ''),
          }));
          return updatedFields;
        }, Map());

      return updatedFields;
    }

    getFieldSpec = (name: string): FieldSpecType => {
      return options.fields[name];
    }

    /*
     * Just returns a boolean indicating whether the form is valid. Doesn't run
     * any tests, just checks field validity (stored in state).
     */
    isFormValid = (fields: Object, options: ?{ excludeField: string }): boolean => { // eslint-disable-line
      const excludeField: ?string = options && options.excludeField;
      const stateFields: Object = fields.toJS();
      const examineFields: Array<string> = Object.keys(stateFields)
        .filter((fieldName: string) => fieldName !== excludeField);

      if (examineFields.length === 0) return true;

      const formValid = Object.keys(stateFields)
        .filter((fieldName: string) => fieldName !== excludeField)
        .map((fieldName: string) => stateFields[fieldName])
        .every((field: Object) => field.valid || !field.criticalFail);

      /*
       * If we only have one field, .reduce() will have returned an object, not
       * a boolean.
       */
      return typeof formValid === 'boolean' ? formValid : formValid.valid;
    }

    onValidatedChange = (fieldSpec: Object, { target }: UserEventType) => {
      const field = this.state.fields.get(fieldSpec.name).merge(Map({
        value: target.value,
        dirty: true,
      }));
      const fields = this.state.fields.set(fieldSpec.name, field);
      const validatedFields = this.onChangeField(field, fieldSpec.name, fields);

      this.setState({
        fields: validatedFields,
      });
    }

    updateFormFields = (values: Object) => {
      const mapValues = Map(values);
      const fields = mapValues.reduce(
        (allFields: Object, value: any, fieldName: string) => {
          const field = allFields.get(fieldName);
          return allFields.set(
            fieldName,
            field.merge(Map({ value, dirty: true }))
          );
        }, this.state.fields);
      const validatedFields = mapValues.reduce(
        (updatedFields: Object, value: any, fieldName: string) => {
          return this.onChangeField(
            updatedFields.get(fieldName), fieldName, updatedFields);
        }, fields);

      this.setState({
        fields: validatedFields,
      });
    }

    onBlur = (fieldSpec: Object) => {
      const field = this.state.fields.get(fieldSpec.name)
        .set('dirty', true);
      const updatedFields = this.state.fields.set(
        fieldSpec.name, field
      );

      const validatedFields = this.onChangeField(
        field, fieldSpec.name, updatedFields);
      this.setState({
        currentField: undefined,
        fields: validatedFields,
        form: this.updateFormValidity(validatedFields),
      });
    }

    onChange = (fieldSpec: Object, { target }: UserEventType) => {
      const updatedField = this.state.fields.get(fieldSpec.name).merge(Map({
        value: target.value,
        dirty: true,
      }));
      this.setState({
        fields: this.state.fields.set(fieldSpec.name, updatedField),
      });
    }

    onFocus = (fieldSpec: Object) => {
      this.setState({
        currentField: fieldSpec,
      });
    }

    setDefaultValues = (defaultData: Object) => {
      // Prevent settings defaults twice
      if (!this.defaultsSet) {
        const updatedFields = Map(defaultData).reduce(
          (fields: Object, value: any, fieldName: string) => {
            return fields.setIn([fieldName, 'value'], value);
          }, this.state.fields);
        const validatedFields = updatedFields.reduce(
          (fields: Object, field: Object, fieldName: string) => {
            return this.onChangeField(field, fieldName, fields);
          }, updatedFields);
        this.updateFields(validatedFields);
        this.defaultsSet = true;
      }
    }

    getFieldSpec = (name: string): FieldSpecType => {
      return options.fields[name];
    }

    /*
     * Handle a change to a field, expects field value to already be updated.
     * Returns updated fields.
     */
    onChangeField = (field: Object, fieldName: string,
      fields: Object, checkAlsoTests: boolean = true): Object => {
      const fieldSpec = this.getFieldSpec(fieldName);
      const testResults = fieldSpec.tests.reduce(
        (result: TestResultType, testSpec: TestType) => {
          if (result.valid) {
            const testResult: boolean =
              testSpec.test(
                field.get('value'),
                fields.toJS(),
                field.toJS()
              );
            return {
              valid: testResult,
              failProps: !testResult ? testSpec.failProps : {},
              criticalFail: !testResult && testSpec.critical,
            };
          }
          return result;
        }, { valid: true, failProps: {}, criticalFail: false });
      const validatedField = field.merge(Map(testResults));
      const updatedFields = fields.set(fieldName, validatedField);

      const alsoTested = checkAlsoTests && fieldSpec.alsoTest
      ? fieldSpec.alsoTest.reduce((alsoFields: Object, alsoName: string) => {
        const alsoField = updatedFields.get(alsoName);
        return this.onChangeField(alsoField, alsoName, alsoFields, false);
      }, updatedFields)
      : updatedFields;

      return alsoTested;
    }

    /*
     * Update fields in state.
     */
    updateFields = (fields: Object) => {
      this.setState({
        fields,
        form: this.updateFormValidity(fields),
      });
    }

    /*
     * Returns an updated form state.
     */
    updateFormValidity = (fields: Object) => {
      return {
        ...this.state.form,
        valid: this.isFormValid(fields),
      };
    }

    render() {
      return <Wrapped
        { ...this.props }
        clearForm={this.clearForm}
        fields={this.state.fields.toJS()}
        formSubmit={this.handleSubmit}
        formState={this.state.form}
        updateFormFields={this.updateFormFields}
        setDefaultValues={this.setDefaultValues}
      />
    }
  }
};

export default Formous;
