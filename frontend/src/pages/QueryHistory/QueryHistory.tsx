import React, { FunctionComponent, ReactElement } from 'react';
import { Alert, Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Dimmer, Loader } from 'semantic-ui-react';
import { DatasetHistoryCard } from '../../components/DatasetHistoryCard';
import { OperationMap } from '../../types/operations';
import { useOperation } from '../../utils/hooks';

const QueryHistory: FunctionComponent = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const { operation, loading } = useOperation(parseInt(id));

  return (
    <Row>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      {operation && !loading ? (
        <DatasetHistoryCard
          dataset={operation as OperationMap}
          limit={10}
          offset={0}
          loading={!operation}
        />
      ) : null}
      {!operation && !loading ? (
        <Alert variant="danger" className="w-100">
          <span>Invalid Dataset ID</span>
        </Alert>
      ) : null}
    </Row>
  );
};

export default QueryHistory;
