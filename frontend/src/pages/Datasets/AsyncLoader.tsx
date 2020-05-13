import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const Datasets: any = React.lazy(() => import('./Datasets')); // TODO: correct variable type
export const AsyncDatasets = (props: RouteComponentProps) => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <Datasets {...props} />
  </React.Suspense>
);
