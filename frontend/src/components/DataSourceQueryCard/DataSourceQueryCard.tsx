import React, { FunctionComponent, ReactElement } from 'react';
import { Card } from 'react-bootstrap';
import { DataSourceQueryTable } from '../DataSourceQueryTable';

interface DataSourceQueryCardProps {
  id: number;
}
export const DataSourceQueryCard: FunctionComponent<DataSourceQueryCardProps> = (
  props,
): ReactElement => {
  return (
    <React.Fragment>
      <Card className="col-md-12">
        <Card.Header className="card-header-danger card-header-icon">
          <h4 className="card-title">Data Source Queries</h4>
        </Card.Header>
        <Card.Body>
          <DataSourceQueryTable />
          {props.id}{' '}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
