import React, { FunctionComponent, ReactElement, createContext } from 'react';
import { Card } from 'react-bootstrap';
import { DataSourceQueryTable } from '../DataSourceQueryTable';
import { QueryResult } from '../../pages/DataSourceQuery/utils';

export interface DataSourceQueryCardProps {
  query?: QueryResult;
}

export interface DataSourcesQueryContext {
  count?: number;
  next?: number;
}

export const DataSourceQueryContext = createContext<DataSourcesQueryContext>({});

export const DataSourceQueryCard: FunctionComponent<DataSourceQueryCardProps> = (
  props,
): ReactElement => {
  return (
    <React.Fragment>
      <DataSourceQueryContext.Provider
        value={{ count: props.query?.count, next: props.query?.next }}
      >
        <Card className="col-md-12">
          <Card.Header className="card-header-danger card-header-icon">
            <h4 className="card-title">Data Source Queries</h4>
          </Card.Header>
          <Card.Body>
            <DataSourceQueryTable />
          </Card.Body>
        </Card>
      </DataSourceQueryContext.Provider>
    </React.Fragment>
  );
};
