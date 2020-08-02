import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const DataSourceQuery = React.lazy(() => import('./DataSourceQuery'));
export const AsyncDataSourceQuery = () => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <DataSourceQuery />
  </React.Suspense>
);
