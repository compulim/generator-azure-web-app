'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './index.less';

class Index extends Component {
  render() {
    return (
      <div>
        <h1>Hello, World!</h1>
        <samp>NODE_ENV = "{ process.env.NODE_ENV }"</samp>
        <p>
          <a href="/api/health">Health check</a>
        </p>
      </div>
    );
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('reactRoot')
);
