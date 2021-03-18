import React, { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { QueryBuilderContainer } from '../../components/QueryBuilderContainer';
import { useSources } from '../../hooks';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = () => {
  const sources = useSources({ limit: 200, offset: 0 });
  console.log(sources.toJS());

  return (
    <Row>
      <Col>
        <React.Fragment>
          <Card>
            <Card.Header className="card-header-text card-header-danger">
              <Card.Title>Card Header Goes Here</Card.Title>
            </Card.Header>
            <Card.Body>
              <QueryBuilderContainer />
            </Card.Body>
          </Card>
        </React.Fragment>
      </Col>
    </Row>
  );
};

export default AdvancedQueryBuilder;
