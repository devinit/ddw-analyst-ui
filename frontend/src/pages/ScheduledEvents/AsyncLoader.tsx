import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const ScheduledEvents = React.lazy(() => import('./ScheduledEvents'));
export const AsyncScheduledEvents = (props: RouteComponentProps) => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <ScheduledEvents {...props} />
  </React.Suspense>
);
