'use strict';
import 'babel-polyfill';
import 'whatwg-fetch';
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute} from 'react-router';
import {createHashHistory} from 'history';
import App from './components/admin/app';
import List from './components/admin/list';
import New from './components/admin/new';

const history = createHashHistory({queryKey: false});

render((
  <Router history={history}>
    <Route path='/' component={App}>
      <IndexRoute component={List} />
      <Route path='new' component={New}></Route>
    </Route>
  </Router>
), document.querySelector('#app'));
