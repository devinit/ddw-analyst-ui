import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const DataSources = React.lazy(() => import('./DataSources'));
export const AsyncDataSources = (props: RouteComponentProps) => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <DataSources {...props} />
  </React.Suspense>
);
