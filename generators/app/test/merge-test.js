'use strict';

const assert = require('assert');
const { merge } = require('../utils');

describe('merge', () => {
  context('merge map', () => {
    let actual;

    beforeEach(() => {
      actual = merge({
        abc: 123,
        def: 456
      }, {
        abc: null,
        xyz: 789
      });
    });

    it('should remove "abc"', () => {
      assert.equal('abc' in actual, false);
    });

    it('should keep "def"', () => {
      assert.equal(actual.def, 456);
    });

    it('should add "xyz"', () => {
      assert.equal(actual.xyz, 789);
    });
  });

  context('merge map recursively', () => {
    let actual;

    beforeEach(() => {
      actual = merge({
        map: {
          abc: 123,
          def: 456
        }
      }, {
        map: {
          abc: null,
          xyz: 789
        }
      });
    });

    it('should remove "abc"', () => {
      assert.equal('abc' in actual.map, false);
    });

    it('should keep "def"', () => {
      assert.equal(actual.map.def, 456);
    });

    it('should add "xyz"', () => {
      assert.equal(actual.map.xyz, 789);
    });
  });

  context('merge array', () => {
    let actual;

    beforeEach(() => {
      actual = merge({
        array: [123]
      }, {
        array: [456]
      })
    });

    it('should replace array', () => {
      assert.deepEqual(actual, { array: [456] });
    });
  });
});
