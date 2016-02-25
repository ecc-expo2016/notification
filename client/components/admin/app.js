'use strict';
import React, {Component} from 'react';
import Header from './header';
import data from '../../data';

export default class App extends Component {
  state = {
    sections: data
  };
  render() {
    const {children} = this.props;
    const {sections} = this.state;

    return (
      <div>
        <Header />

        <section className='section'>
          <div className='container is-fluid'>
            {children && React.cloneElement(children, {sections})}
          </div>
        </section>
      </div>
    );
  }
}
