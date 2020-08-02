import React, { ReactElement } from 'react';
import { useParams } from 'react-router';
import { Row } from 'react-bootstrap';

const DataSourceQuery = (): ReactElement => {
  const { id } = useParams();

  return (
    <Row>
      {/*  Queries created from a particular Data Source. */}
      <h1>DataSourceQuery {id}</h1>
    </Row>
  );
};

export default DataSourceQuery;
