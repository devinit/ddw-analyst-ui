import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

const Root = () => (
  <Grid className="col-lg-4">
    <div>DDW Analyst UI</div>
  </Grid>
);

export const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={ Root } />
    </Switch>
  </BrowserRouter>
);
