// @flow

import type { TestType } from './types';

export function allTestsPassed(tests: Array<TestType>) {
  return tests.filter((test: TestType) =>
      !test.critical || test.passed).length === tests.length;
}
