import React, { ReactElement } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const QueryHistory = React.lazy(() => import('./QueryHistory'));
export const AsyncQueryHistory = (): ReactElement => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <QueryHistory />
  </React.Suspense>
);
