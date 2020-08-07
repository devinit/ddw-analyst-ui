import React, { ReactElement } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const DataSourceQuery = React.lazy(() => import('./DataSourceQuery'));
export const AsyncDataSourceQuery = (): ReactElement => (
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
