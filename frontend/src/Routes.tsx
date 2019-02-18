import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Login } from './pages/Login';

export const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={ Login } />
    </Switch>
  </BrowserRouter>
);
