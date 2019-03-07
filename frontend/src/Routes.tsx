import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { store } from './store';

export const Routes = () => (
  <Provider store={ store }>
    <BrowserRouter>
      <Switch>
        <Route exact path="/login" component={ Login } />
        <Route path="/" component={ MainLayout } />
      </Switch>
    </BrowserRouter>
  </Provider>
);
