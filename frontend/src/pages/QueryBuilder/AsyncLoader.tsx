import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const QueryBuilder = React.lazy(() => import('./QueryBuilder'));
export const AsyncQueryBuilder = (props: RouteComponentProps) =>
  <React.Suspense fallback={ <Dimmer active={ true } inverted><Loader content="Loading" /></Dimmer> }>
    <QueryBuilder { ...props }/>
  </React.Suspense>;
