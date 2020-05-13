import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const Home = React.lazy(() => import('./Home'));
export const AsyncHome = (props: RouteComponentProps) => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <Home {...props} />
  </React.Suspense>
);
