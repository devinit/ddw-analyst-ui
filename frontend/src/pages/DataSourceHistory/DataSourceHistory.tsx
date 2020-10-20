import React, { FunctionComponent, ReactElement } from 'react';
import { Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import { SourcesHistoryTableCard } from '../../components/SourcesHistoryTableCard';
import { useSource } from '../../hooks';

const DataSourceHistory: FunctionComponent = (): ReactElement => {
  const { id } = useParams();
  const source = useSource(id);

  return (
    <Row>
      <SourcesHistoryTableCard activeSource={source} limit={10} offset={0} loading={!source} />
    </Row>
  );
};

export default DataSourceHistory;
