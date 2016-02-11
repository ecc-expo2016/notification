'use strict';
import React, {Component} from 'react';
import {Link, IndexLink} from 'react-router';

export default class Header extends Component {
  render() {
    return (
      <nav className='header'>
        <div className='container'>
          <div className='header-left'>
            <IndexLink
              className='header-tab'
              activeClassName='is-active'
              to='/'>作品リスト</IndexLink>
            <Link
              className='header-tab'
              activeClassName='is-active'
              to='/new'>新規追加</Link>
            <a
              className='header-tab'
              href='/admin/logout'>ログアウト</a>
          </div>
        </div>
      </nav>
    );
  }
}
