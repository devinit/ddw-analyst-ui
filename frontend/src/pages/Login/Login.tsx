import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { PageWrapper } from '../../components/PageWrapper';

export class Login extends React.Component {
  render() {
    return (
      <PageWrapper fullPage>
        <Grid className="col-lg-4">
          <div>Login Page</div>
        </Grid>
      </PageWrapper>
    );
  }
}
