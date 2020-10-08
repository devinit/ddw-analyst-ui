import React, { ReactElement } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const PublishedDatasets = React.lazy(() => import('./PublishedDatasets'));
export const AsyncPublishedDatasets = (props: RouteComponentProps): ReactElement => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <PublishedDatasets {...props} />
  </React.Suspense>
);
