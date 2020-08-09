import React, { ReactElement } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const DataSourceQueries = React.lazy(() => import('./DataSourceQueries'));
export const AsyncDataSourceQueries = (): ReactElement => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <DataSourceQueries />
  </React.Suspense>
);
