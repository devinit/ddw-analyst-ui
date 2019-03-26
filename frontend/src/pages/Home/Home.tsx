import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationsTableCard } from '../../components/OperationsTableCard';
import { List } from 'immutable';

export class Home extends React.Component {
  render() {
    return (
      <Row>
        <Col>
          <Dimmer active={ false } inverted>
            <Loader content="Loading" />
          </Dimmer>
        </Col>

        <OperationsTableCard operations={ List() } onRowClick={ () => null }/>
      </Row>
    );
  }
}
