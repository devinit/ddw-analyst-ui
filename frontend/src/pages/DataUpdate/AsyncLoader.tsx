import React, { ReactElement, SuspenseProps } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const DataUpdate = React.lazy(() => import('./DataUpdate'));
export const AsyncDataUpdate = (props: RouteComponentProps): ReactElement<SuspenseProps> => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <DataUpdate {...props} />
  </React.Suspense>
);
