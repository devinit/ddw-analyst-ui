import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

const Root = () => <div>DDW Analyst UI</div>;

export const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={ Root } />
    </Switch>
  </BrowserRouter>
);
