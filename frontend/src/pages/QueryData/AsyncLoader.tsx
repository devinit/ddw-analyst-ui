import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const QueryData = React.lazy(() => import('./QueryData'));
export const AsyncQueryData = (props: RouteComponentProps) =>
  <React.Suspense fallback={ <Dimmer active={ true } inverted><Loader content="Loading" /></Dimmer> }>
    <QueryData { ...props }/>
  </React.Suspense>;
