import React, { ReactElement, FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { OperationsTableCard } from '../../components/OperationsTableCard';

const DataSourceQueries: FunctionComponent = (): ReactElement => {
  const { id } = useParams();

  return (
    <Row>
      <OperationsTableCard limit={10} offset={0} sourceID={id} />
    </Row>
  );
};

export default DataSourceQueries;
