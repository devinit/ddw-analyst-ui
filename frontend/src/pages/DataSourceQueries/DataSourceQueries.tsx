import React, { ReactElement, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row } from 'react-bootstrap';
import { DataSourceQueryCard } from '../../components/DataSourceQueryCard';
import { fetchQueriesOnDataset, QueryResult } from './utils';

const DataSourceQueries = (): ReactElement => {
  const [queryResult, setQueryResult] = useState<QueryResult>();
  const { id } = useParams();
  useEffect(() => {
    fetchQueriesOnDataset(id).then((result) => {
      if (result) {
        setQueryResult(result);
      }
    });
  }, []);

  return (
    <Row>
      <DataSourceQueryCard query={queryResult} />
    </Row>
  );
};

export default DataSourceQueries;
