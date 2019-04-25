import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { AsyncMainLayout } from './layouts';
import Login from './pages/Login';
import { store } from './store';

export const Routes = () => (
  <Provider store={ store }>
    <BrowserRouter>
      <Switch>
        <Route exact path="/login" component={ Login } />
        <Route path="/" component={ AsyncMainLayout } />
      </Switch>
    </BrowserRouter>
  </Provider>
);
