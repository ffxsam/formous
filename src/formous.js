// @flow

import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import type { TestType } from './types';
import runChecks, { warn } from './dx';
import { allTestsPassed } from './helpers';

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
      this.updateFields(fromJS(updatedFields));
    }

    clearForm = () => {
      const updatedFields = this.initializeFields(true);
      this.updateFields(fromJS(updatedFields));
    };

    validateForm = () => {
      const fields = this.state.fields;
      const updatedFields = fields.reduce(
        (acc: Object, field: Object, name: string) => {
          const fieldTests: Object[] = this.testField(options.fields[name],
                                                      field.get('value'));
          const test = fieldTests[fieldTests.length - 1];

          const updatedField = this.state.fields.get(name).mergeDeep(
            Map({
              failProps: test.passed || test.quiet
                ? undefined
                : test.failProps,
              valid: test.passed,
            })
          );
          return acc.set(name, updatedField);
        }, Map({}));

      const updated = {
        fields: updatedFields,
        form: {
          ...this.updateFormValidity(updatedFields),
          touched: true,
        },
      };

      return {
        fields: updated.fields,
        formState: updated.form,
      };
    }

    /*
     * Submit handler.
     */
    handleSubmit = (formHandler: Function): Function => {
      return (event: Object) => {
        event.preventDefault();

        const { fields, formState }:
          { fields: Object, formState: Object } = this.validateForm();

        this.setState({ fields, form: formState }, () => {
          formHandler(
            formState,
            fields
              .map((field: Object) => ({ value: field.get('value') })).toJS()
          );
        });
      }
    };

    initializeFields = (reset: ?boolean): Object => {
      const updatedFields = {};

      // Loop through each of the fields passed in
      for (const fieldName: string in options.fields) {
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

        // Set initial field validity
        const testResults: Array<TestType> = this.testField(fieldSpec, '',
          true);

        updatedFields[fieldName] = {
          events,
          valid: allTestsPassed(testResults),
          value: reset
            ? ''
            : (this.state.fields.getIn([fieldName, 'value']) || ''),
        };
      }

      return updatedFields;
    };

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
        .every((field: Object) => field.valid);

      /*
       * If we only have one field, .reduce() will have returned an object, not
       * a boolean.
       */
      return typeof formValid === 'boolean' ? formValid : formValid.valid;
    };

    markFieldAsValid = (fieldName: string, valid: boolean, options: {
      failProps: ?Object,
      quietly: boolean,
    }) => {
      const fields = this.state.fields.mergeDeep({
        [fieldName]: {
          failProps: options.quietly ? undefined : options.failProps,
          valid,
        },
      });

      this.updateFields(fields);
    };

    onValidatedChange = (fieldSpec: Object, { target }: Object) => {
      const fieldTests: Array<TestType> =
        this.testField(fieldSpec, target.value);
      const test = fieldTests[fieldTests.length - 1];

      const updatedField = this.state.fields.get(fieldSpec.name).merge(
        Map({
          value: target.value,
          failProps: test.passed || test.quiet
            ? undefined
            : test.failProps,
          valid: test.passed,
        })
      );
      this.setState({
        fields: this.state.fields.set(fieldSpec.name, updatedField),
      });
    }

    onBlur = (fieldSpec: Object, { target }: Object) => {
      this.setState({ currentField: undefined });
      this.testFieldAndUpdateState(fieldSpec, target.value);
    };

    onChange = (fieldSpec: Object, { target }: Object) => {
      this.setState({
        fields: this.state.fields.setIn([fieldSpec.name, 'value'],
          target.value),
      });
    };

    onFocus = (fieldSpec: Object) => {
      this.setState({
        currentField: fieldSpec,
        form: {
          ...this.state.form,
          touched: true,
        },
      });
    };

    setDefaultValues = (defaultData: Object) => {
      // Prevent settings defaults twice
      if (!this.defaultsSet) {
        const defaults: Object = {};

        for (const fieldName: string in defaultData) {
          const field: Object = {
            ...options.fields[fieldName],
            name: fieldName,
          };
          const tests: ?Array<TestType> = options.fields[fieldName] &&
            options.fields[fieldName].tests;
          let testResults: Array<TestType>;

          if (tests) {
            testResults = this.testField(field, defaultData[fieldName], true);
          } else {
            testResults = [];
          }

          defaults[fieldName] = {
            valid: allTestsPassed(testResults),
            value: defaultData[fieldName],
          };
        }

        const fields = this.state.fields.mergeDeep(defaults);

        this.updateFields(fields);
        this.defaultsSet = true;
      }
    };

    /*
     * Take an array of test results and update the state with the form validity
     * and individual field's validity and failProps.
     */
    setFieldsValidity = (tests: Array<TestType>) => {
      const updatedFields = {};

      if (tests.length === 0) {
        warn(false, 'We should never see this? If you see this, please submit' +
          'an issue at https://github.com/ffxsam/formous/issues');
      } else {
        for (const test: TestType of tests) {
          updatedFields[test.fieldName] = {
            failProps: test.passed || test.quiet
              ? undefined
              : test.failProps,
            valid: test.passed,
          };
        }

        const fields = this.state.fields.mergeDeep(updatedFields);
        this.updateFields(fields);

        return fields;
      }
    };

    // Returns all tests that were run
    testField = (fieldSpec: Object, value: string,
      initial: ?boolean): Array<TestType> => {
      /*
       * testField will actually start at a single field and run its tests, but
       * due to the alsoTest field, there can be chaining. So testField will
       * return an array of all failed tests.
       */
      const tests: Array<TestType> = fieldSpec.tests;
      let completedTests: Array<TestType> = [];
      let failedTestCount: number = 0;

      for (const test: Object of tests) {
        const testResult: boolean = test.test(value, this.state.fields.toJS());

        completedTests = [{
          ...test,
          passed: testResult,
          fieldName: fieldSpec.name,
        }];

        if (!testResult) break;
      }

      failedTestCount = completedTests
        .filter((test: TestType) => !test.passed).length;

      /*
       * See if there are related fields we should test
       * Check !initial, because we don't want to do side-effect tests on form
       * mount.
       */
      if (fieldSpec.alsoTest && !initial && failedTestCount === 0) {
        fieldSpec.alsoTest.forEach((fieldName: string) => {
          const fieldInfo: Object = {
            ...options.fields[fieldName],
            name: fieldName,
          };
          const fieldValue: string =
            this.state.fields.getIn([fieldName, 'value']);
          let sideEffectTests: Array<TestType> =
            this.testField(fieldInfo, fieldValue);

          // Side-effect tests should never display error props
          sideEffectTests = sideEffectTests
            .map((test: Object) => ({ ...test, quiet: true }));

          completedTests = [...completedTests, ...sideEffectTests];
        });
      }

      return completedTests;
    };

    testFieldAndUpdateState = (fieldSpec: Object, value: string) => {
      const completedTests: Array<TestType> = this.testField(fieldSpec, value);
      return this.setFieldsValidity(completedTests);
    };

    /*
     * Update fields in state.
     */
    updateFields = (fields: Object) => {
      this.setState({
        fields,
        form: this.updateFormValidity(fields),
      });
    };

    /*
     * Returns an updated form state.
     */
    updateFormValidity = (fields: Object) => {
      return {
        ...this.state.form,
        valid: this.isFormValid(fields),
      };
    };

    render() {
      return <Wrapped
        { ...this.props }
        clearForm={this.clearForm}
        fields={this.state.fields.toJS()}
        formSubmit={this.handleSubmit}
        formState={this.state.form}
        setDefaultValues={this.setDefaultValues}
      />
    }
  }
};

export default Formous
