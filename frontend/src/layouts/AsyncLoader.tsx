import React, { SuspenseProps, Suspense, ReactElement } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const MainLayout = React.lazy(() => import('./MainLayout'));
export const AsyncMainLayout = (props: RouteComponentProps): ReactElement<SuspenseProps> => (
  <Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <MainLayout {...props} />
  </Suspense>
);
