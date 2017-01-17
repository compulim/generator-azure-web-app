'use strict';

// import React, { Component } from 'react';
// import { render } from 'react-dom';

import Summation from './ui/summation';

// import './index.less';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.handleXChange = this.handleXChange.bind(this);
    this.handleYChange = this.handleYChange.bind(this);

    this.state = {
      x: 1,
      y: 2
    };
  }

  handleXChange(newValue) {
    this.setState({ x: newValue });
  }

  handleYChange(newValue) {
    this.setState({ y: newValue });
  }

  render() {
    return (
      <div>
        <h1>Hello, World!</h1>
        <samp>NODE_ENV = "{ process.env.NODE_ENV }"</samp>
        <p>
          <a href="/api/health">Health check</a>
        </p>
        <Summation
          onXChange={ this.handleXChange }
          onYChange={ this.handleYChange }
          x={ this.state.x }
          y={ this.state.y }
        />
      </div>
    );
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('reactRoot')
);
