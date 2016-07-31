// @flow

// DX = Developer Experience. Let's make this thing friendly, eh?!

import warning from 'warning';
import invariant from 'invariant';
import _ from 'lodash';
import type { TestType } from './types';

export function warn(test: boolean, message: string) {
  warning(test, `[Formous] ${message}`);
}

export function inv(test: boolean, message: string) {
  invariant(test, `[Formous] ${message}`);
}

function checkTestProp(tests: Array<TestType>, propName: string,
  propType: ?string): boolean {
  const comparator = (thing: any, expectedType: ?string): boolean => {
    if (!propType) {
      return typeof thing !== 'undefined';
    }

    return typeof thing === expectedType;
  };

  return tests.filter(
      (t: Object) => comparator(t[propName], propType)
    ).length === tests.length;
}

export default function runChecks(options: Object) {
  for (const fieldName: string in options.fields) {
    const field: Object = options.fields[fieldName];

    inv(!!field.tests, `You need a 'tests' array for the "${fieldName}" ` +
      'field.');

    const tests: Array<TestType> = field.tests;
    const numTests: number = tests.length;
    let nonCriticalInd: number;

    // Check for 'name' property
    inv(!!field.name,
      `The "${fieldName}" field is missing a "name" property. For ` +
      'example:\nfields: {\n  email: {\n    name: \'email\',\n' +
      '    tests: [ /*...*/ ],\n  },\n}');

    // Make sure we even have tests
    warn(numTests > 0,
      `The "${fieldName}" field doesn't seem to have any tests. ` +
      'The property is defined but it\'s an empty array. Is this a ' +
      'mistake?');

    inv(checkTestProp(tests, 'critical', 'boolean'),
      `Make sure all of the "${fieldName}" field's tests have the ` +
      '\'critical\' property, and that they\'re boolean values.');

    // TODO: check for failProps (warning) and test func (error)
    warn(checkTestProp(tests, 'failProps', 'object'),
      `Make sure all of the "${fieldName}" field's tests have the ` +
      '\'failProps\' property, and that they\'re objects.');

    // Make sure critical tests come before non-critical
    nonCriticalInd = _.findIndex(tests, (test: Object) => !test.critical);

    if (nonCriticalInd >= 0 && tests[nonCriticalInd + 1]) {
      for (let i: number = nonCriticalInd + 1; i < numTests; i++) {
        inv(!tests[i].critical, `Double-check the "${fieldName}" ` +
          'field\'s tests. Remember that critical tests must *always* ' +
          'come before non-critical ones.');
      }
    }
  }
}
