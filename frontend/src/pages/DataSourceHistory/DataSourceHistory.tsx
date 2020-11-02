import React, { FunctionComponent, ReactElement } from 'react';
import { Alert, Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Dimmer, Loader } from 'semantic-ui-react';
import { SourceHistoryCard } from '../../components/SourceHistoryCard';
import { useSource } from '../../hooks';

const DataSourceHistory: FunctionComponent = (): ReactElement => {
  const { id } = useParams();
  const { source, loading } = useSource(id);

  return (
    <Row>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      {source && !loading ? (
        <SourceHistoryCard source={source} limit={10} offset={0} loading={!source} />
      ) : null}
      {!source && !loading ? (
        <Alert variant="danger" className="w-100">
          <span>Invalid Source ID</span>
        </Alert>
      ) : null}
    </Row>
  );
};

export default DataSourceHistory;
