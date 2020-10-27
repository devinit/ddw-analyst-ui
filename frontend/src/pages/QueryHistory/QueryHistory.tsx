import React, { FunctionComponent, ReactElement } from 'react';
import { Alert, Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Dimmer, Loader } from 'semantic-ui-react';
import { DatasetHistoryCard } from '../../components/DatasetHistoryCard';
import { useOperation } from '../../utils/hooks/operations';

const QueryHistory: FunctionComponent = (): ReactElement => {
  const { id } = useParams();
  const { operation, loading } = useOperation(id);

  return (
    <Row>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      {operation && !loading ? (
        <DatasetHistoryCard dataset={operation} limit={10} offset={0} loading={!operation} />
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
