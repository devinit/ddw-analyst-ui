import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = () => {
  return (
    <Row>
      <Col>Content Goes Here!</Col>
    </Row>
  );
};

export default AdvancedQueryBuilder;
