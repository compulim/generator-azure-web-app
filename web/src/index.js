'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './index.less';

class Index extends Component {
  render() {
    return (
      <h1>Hello, World!</h1>
    );
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('reactRoot')
);
