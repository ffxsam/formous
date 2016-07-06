// @flow

export type TestType = {
  critical: boolean,
  failProps: Object,
  fieldName: string,
  passed: boolean,
  quiet: boolean,
  test: (value: string, fields: ?Object) => boolean,
};
