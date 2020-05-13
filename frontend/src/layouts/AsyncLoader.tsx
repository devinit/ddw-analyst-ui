import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const MainLayout = React.lazy(() => import('./MainLayout'));
export const AsyncMainLayout = (props: RouteComponentProps) => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <MainLayout {...props} />
  </React.Suspense>
);
