import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { OperationsTableCard } from '../../components/OperationsTableCard';
import { SourcesContext } from '../../context';
import { useSources } from '../../hooks';

type PageProps = RouteComponentProps;

export const PublishedDatasets: FunctionComponent<PageProps> = () => {
  const sources = useSources({ limit: 200, offset: 0 });

  return (
    <Row>
      <Col>
        <SourcesContext.Provider value={{ sources }}>
          <OperationsTableCard limit={10} offset={0} showMyQueries={false} />
        </SourcesContext.Provider>
      </Col>
    </Row>
  );
};

export { PublishedDatasets as default };
