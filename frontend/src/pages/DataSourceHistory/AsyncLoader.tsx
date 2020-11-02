import React, { ReactElement } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const DataSourceHistory = React.lazy(() => import('./DataSourceHistory'));
export const AsyncDataSourceHistory = (): ReactElement => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <DataSourceHistory />
  </React.Suspense>
);
