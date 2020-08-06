import React, { FunctionComponent, useContext } from 'react';
import {
  DataSourceQueryContext,
  DataSourcesQueryContext,
} from '../../components/DataSourceQueryCard';

export const DataSourceQueryRow: FunctionComponent = () => {
  const { results } = useContext<DataSourcesQueryContext>(DataSourceQueryContext);

  return (
    <>
      {results
        ? results.map((result) => (
            <tr key={result.id}>
              <td>{result.name}</td>
              <td>{result.updated_on}</td>
              <td>{result.is_draft ? 'published' : 'pending'}</td>
              <td>{result.operation_query}</td>
            </tr>
          ))
        : null}
    </>
  );
};
