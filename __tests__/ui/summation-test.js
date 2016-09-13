import React from 'react';
import renderer from 'react-test-renderer';
import Summation from '../../web/src/ui/summation';

describe('<Summation>', () => {
  let tree;

  describe('when summing 1 and 2', () => {
    beforeEach(() => {
      tree = renderer.create(<Summation x={ 1 } y={ 2 }/>).toJSON();
    });

    it('should return 3', () => {
      expect(tree).toMatchSnapshot();
    });
  });
});
