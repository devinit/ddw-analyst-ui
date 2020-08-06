import React, { FunctionComponent, ReactElement, createContext } from 'react';
import { Card } from 'react-bootstrap';
import { DataSourceQueryTable } from '../DataSourceQueryTable';
import { QueryResult, ResultData } from '../../pages/DataSourceQuery/utils';

export interface DataSourceQueryCardProps {
  query?: QueryResult;
}

export interface DataSourcesQueryContext {
  count?: number;
  next?: number;
  previous?: number;
  results?: Array<ResultData>;
}

export const DataSourceQueryContext = createContext<DataSourcesQueryContext>({});

export const DataSourceQueryCard: FunctionComponent<DataSourceQueryCardProps> = (
  props,
): ReactElement => {
  return (
    <React.Fragment>
      <DataSourceQueryContext.Provider
        value={{
          count: props.query?.count,
          next: props.query?.next,
          previous: props.query?.previous,
          results: props.query?.results,
        }}
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
