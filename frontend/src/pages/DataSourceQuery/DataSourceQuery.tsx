import React, { ReactElement } from 'react';
import { useParams } from 'react-router';
import { Row } from 'react-bootstrap';
import { DataSourceQueryCard } from '../../components/DataSourceQueryCard';

const DataSourceQuery = (): ReactElement => {
  const { id } = useParams();

  return (
    <Row>
      {/*  Queries created from a particular Data Source. */}
      <DataSourceQueryCard id={id} />
    </Row>
  );
};

export default DataSourceQuery;
