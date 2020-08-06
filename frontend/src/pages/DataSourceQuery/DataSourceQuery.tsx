import React, { ReactElement, useEffect, useState } from 'react';
// import { useParams } from 'react-router';
import { Row } from 'react-bootstrap';
import { DataSourceQueryCard } from '../../components/DataSourceQueryCard';
import { fetchQueriesOnDataset, QueryResult } from './utils';

const DataSourceQuery = (): ReactElement => {
  const [queryResult, setQueryResult] = useState<QueryResult>();
  // const { id } = useParams();
  useEffect(() => {
    fetchQueriesOnDataset().then((result) => {
      if (result) {
        setQueryResult(result.data);
      }
    });
  }, []);

  return (
    <Row>
      {/*  Queries created from a particular Data Source. */}
      <DataSourceQueryCard query={queryResult} />
    </Row>
  );
};

export default DataSourceQuery;
