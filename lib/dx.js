'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.warn = warn;
exports.inv = inv;
exports.default = runChecks;

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _findIndex = require('lodash/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function warn(test, message) {
  (0, _warning2.default)(test, '[Formous] ' + message);
}

function inv(test, message) {
  (0, _invariant2.default)(test, '[Formous] ' + message);
}

function checkTestProp(tests, propName, propType) {
  var comparator = function comparator(thing, expectedType) {
    if (!propType) {
      return typeof thing !== 'undefined';
    }

    return (typeof thing === 'undefined' ? 'undefined' : _typeof(thing)) === expectedType;
  };

  return tests.filter(function (t) {
    return comparator(t[propName], propType);
  }).length === tests.length;
}

function runChecks(options) {
  for (var fieldName in options.fields) {
    var field = options.fields[fieldName];

    inv(!!field.tests, 'You need a \'tests\' array for the "' + fieldName + '" ' + 'field.');

    var tests = field.tests;
    var numTests = tests.length;
    var nonCriticalInd = void 0;

    warn(!field.name, 'Object property \'name\' (declared on the "' + fieldName + '"' + ' field) is no longer required.');

    warn(numTests > 0, 'The "' + fieldName + '" field doesn\'t seem to have any tests. ' + 'The property is defined but it\'s an empty array. Is this a ' + 'mistake?');

    inv(checkTestProp(tests, 'critical', 'boolean'), 'Make sure all of the "' + fieldName + '" field\'s tests have the ' + '\'critical\' property, and that they\'re boolean values.');

    warn(checkTestProp(tests, 'failProps', 'object'), 'Make sure all of the "' + fieldName + '" field\'s tests have the ' + '\'failProps\' property, and that they\'re objects.');

    nonCriticalInd = (0, _findIndex2.default)(tests, function (test) {
      return !test.critical;
    });

    if (nonCriticalInd >= 0 && tests[nonCriticalInd + 1]) {
      for (var i = nonCriticalInd + 1; i < numTests; i++) {
        inv(!tests[i].critical, 'Double-check the "' + fieldName + '" ' + 'field\'s tests. Remember that critical tests must *always* ' + 'come before non-critical ones.');
      }
    }
  }
}