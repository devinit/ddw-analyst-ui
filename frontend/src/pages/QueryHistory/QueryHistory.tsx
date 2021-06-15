import React, { FunctionComponent, ReactElement, Suspense } from 'react';
import { Alert, Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { DatasetHistoryCard } from '../../components/DatasetHistoryCard';
import { OperationMap } from '../../types/operations';
import { useOperation, OperationReader } from '../../utils/hooks/operations';

interface RenderQueryHistoryParams {
  operationReader: OperationReader;
}

const RenderQueryHistory = (props: RenderQueryHistoryParams) => {
  const { operation, loading } = props.operationReader();

  return (
    <Row>
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

const QueryHistory: FunctionComponent = (): ReactElement => {
  const { id } = useParams<{ id: string }>();
  const operationReader = useOperation(parseInt(id));

  return (
    <Suspense fallback="Loading Dataset History">
      <RenderQueryHistory operationReader={operationReader} />
    </Suspense>
  );
};

export default QueryHistory;
