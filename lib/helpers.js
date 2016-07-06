'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.allTestsPassed = allTestsPassed;
function allTestsPassed(tests) {
  return tests.filter(function (test) {
    return !test.critical || test.passed;
  }).length === tests.length;
}