// @flow

export type TestType = {
  critical: boolean,
  failProps: Object,
  fieldName: string,
  passed: boolean,
  quiet: boolean,
  test: (value: string, fields: ?Object) => boolean,
};

export type TestResultType = {
  failProps: ?Object,
  criticalFail: boolean,
};

export type FieldSpecType = {
  name: string,
  tests: Function[],
};

export type UserEventType = {
  target: {value: any},
};
