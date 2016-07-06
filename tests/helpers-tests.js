import { expect } from 'chai';
import { allTestsPassed } from '../src/helpers';

describe('allTestsPassed', function () {
  const goodTests = [
    { passed: true, critical: true },
    { passed: true, critical: true },
    { passed: true, critical: true },
  ];
  const oneBadTest = [
    { passed: true, critical: true },
    { passed: false, critical: true },
    { passed: true, critical: true },
  ];
  const allBadTests = [
    { passed: false, critical: true },
    { passed: false, critical: true },
    { passed: false, critical: true },
  ];
  const oneFailedNonCritical = [
    { passed: true, critical: true },
    { passed: true, critical: true },
    { passed: false, critical: false },
    { passed: false, critical: false },
  ];

  it('returns true if all tests passed', function () {
    expect(allTestsPassed(goodTests)).to.equal(true);
  });

  it('returns false if one or more tests failed', function () {
    expect(allTestsPassed(oneBadTest)).to.equal(false);
  });

  it('returns false if all tests failed', function () {
    expect(allTestsPassed(allBadTests)).to.equal(false);
  });

  it('returns true if only non-critical tests failed', function () {
    expect(allTestsPassed(oneFailedNonCritical)).to.equal(true);
  });
});
