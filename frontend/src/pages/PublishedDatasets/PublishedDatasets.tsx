import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { OperationsTableCard } from '../../components/OperationsTableCard';

type PageProps = RouteComponentProps;

export const PublishedDatasets: FunctionComponent<PageProps> = () => {
  return (
    <Row>
      <Col>
        <OperationsTableCard limit={10} offset={0} showMyQueries={false} />
      </Col>
    </Row>
  );
};

export { PublishedDatasets as default };
