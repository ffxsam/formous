// @flow

import React, { Component } from 'react';
import prebind from 'meteor-react-prebind';
import { Map, fromJS } from 'immutable';

type TestType = {
  critical: string,
  failProps: Object,
  test: (value: string) => boolean,
};

const Formous = (fields: Object): ReactClass => {
  return (Wrapped: ReactClass) => class extends Component {
    // Flow annotations
    fieldData: Object;
    state: Object;

    constructor(props: Object) {
      super(props);
      prebind(this);

      this.state = {
        fields: Map({}),
        form: {
          touched: false,
          valid: false,
        },
      };
    }

    componentWillMount() {
      const updatedFields = {};

      // Loop through each of the fields passed in
      for (const fieldName: string in fields) {
        const tests: Array<TestType> = fields[fieldName].tests;

        // Events that should be attached to the input fields
        const events: Object = {
          onBlur: this.onBlur.bind(this, fieldName, tests),
          onChange: this.onChange.bind(this, fieldName),
          onFocus: this.onFocus.bind(this),
          // I know, this isn't technically an event, but it needs to be there
          value: this.state.fields.getIn([fieldName, 'value']),
        };

        // Set initial field validity
        // TODO: we can't assume the form is initially blank
        // But how do we get the form input value?
        const testResult: ?TestType = this.testField(fieldName, tests, '');

        updatedFields[fieldName] = {
          events,
          valid: !testResult,
        };
      }

      this.setState({
        fields: fromJS(updatedFields),
      });
    }

    formSubmit(formHandler: Function): Function {
      return (event: Object) => {
        event.preventDefault();
        formHandler(
          this.state.form,
          this.state.fields
            .map((field: Object) => ({ value: field.get('value') })).toJS()
        );
      }
    }

    isFormValid(options: ?Object): boolean {
      const excludeField: ?Object = options && options.excludeField;
      const stateFields: Object = this.state.fields.toJS();
      const examineFields: Array<string> = Object.keys(stateFields)
        .filter((fieldName: string) => fieldName !== excludeField);

      if (examineFields.length === 0) return true;

      const formValid = Object.keys(stateFields)
        .filter((fieldName: string) => fieldName !== excludeField)
        .map((fieldName: string) => stateFields[fieldName])
        .reduce((a: any, b: Object) => {
          return (typeof a === 'object' ? a.valid : a) && b.valid;
        });

      /*
       * If we only have one field, .reduce() will have returned an object, not
       * a boolean.
       */
      return typeof formValid === 'boolean' ? formValid : formValid.valid;
    }

    onBlur(fieldName: string, tests: Array<TestType>, { target }: Object) {
      const failedTest: ?TestType = this.testField(fieldName, tests,
        target.value);
      let formValid: boolean;

      if (failedTest) {
        this.setState({
          fields: this.state.fields.mergeDeep({
            [fieldName]: {
              props: failedTest.failProps,
              valid: !failedTest.critical,
            },
          }),
        });
      } else {
        this.setState({
          fields: this.state.fields.mergeDeep({
            [fieldName]: {
              valid: true,
            },
          })
            .deleteIn([fieldName, 'props']),
        });
      }

      formValid = this.isFormValid({ excludeField: fieldName });

      this.setState({
        form: {
          ...this.state.form,
          valid: formValid && (!failedTest || !failedTest.critical),
        },
      });
    }

    onChange(fieldName: string, { target }: Object) {
      console.log('ok, whats up');
      console.dir(target);
      this.setState({
        fields: this.state.fields.setIn([fieldName, 'value'], target.value),
      });
    }

    onFocus() {
      this.setState({
        form: {
          ...this.state.form,
          touched: true,
        },
      });
    }

    // Returns the failed test
    testField(fieldName: string, tests: Array<TestType>,
      value: string): ?TestType {
      let failedTest: TestType;

      // Run tests on this field
      for (const test: Object of tests) {
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

        if (!test.test(value)) {
          failedTest = test;
          if (test.critical) break;
        }
      }

      return failedTest;
    }

    render() {
      return <Wrapped
        fields={this.state.fields.toJS()}
        formSubmit={this.formSubmit}
      />
    }
  }
};

export default Formous
