import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

const AdvancedQueryBuilder = React.lazy(() => import('./AdvancedQueryBuilder'));

export const AsyncAdvancedQueryBuilder = (props: RouteComponentProps): JSX.Element => (
  <React.Suspense
    fallback={
      <Dimmer active={true} inverted>
        <Loader content="Loading" />
      </Dimmer>
    }
  >
    <AdvancedQueryBuilder {...props} />
  </React.Suspense>
);
