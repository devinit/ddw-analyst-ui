import React, { ReactElement, FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { useParams } from 'react-router';

const DataSourceHistory: FunctionComponent = (): ReactElement => {
  const { id } = useParams();

  return <Row>Content Goes Here - {id}</Row>;
};

export default DataSourceHistory;
