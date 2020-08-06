import React, { FunctionComponent, useContext } from 'react';
import {
  DataSourceQueryContext,
  DataSourcesQueryContext,
} from '../../components/DataSourceQueryCard';

export const DataSourceQueryRow: FunctionComponent = () => {
  const { count, next } = useContext<DataSourcesQueryContext>(DataSourceQueryContext);

  return (
    <tr>
      <td>{count}</td>
      <td>{next}</td>
      <td>3</td>
      <td>4</td>
    </tr>
  );
};
