import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const Login = React.lazy(() => import('./Login'));
export const AsyncLogin = (props: RouteComponentProps) => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <Login {...props} />
  </React.Suspense>
);
