import { fromJS } from 'immutable';
import * as React from 'react';
import { Filters, OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { AggregateQueryBuilder } from '../AggregateQueryBuilder';
import FilterQueryBuilder from '../FilterQueryBuilder';
import { JoinQueryBuilder } from '../JoinQueryBuilder';
import { SelectQueryBuilder } from '../SelectQueryBuilder';
import { TransformQueryBuilder } from '../TransformQueryBuilder';
import { Alert } from 'react-bootstrap';

interface QueryBuilderHandlerProps {
  alerts?: { [key: string]: string };
  source: SourceMap;
  step: OperationStepMap;
  onUpdateOptions: (options: string) => void;
}

export class QueryBuilderHandler extends React.Component<QueryBuilderHandlerProps> {
  render() {
    try {
      return this.renderQueryBuilder();
    } catch (error) {
      if (error.message && error.message.indexOf('JSON')) {
        return <Alert variant="warning">Invalid JSON in step options. Delete and recreate the step.</Alert>;
      }
      console.log(error); //tslint:disable-line

      return <Alert variant="warning">Failed to process step options. Delete and recreate the step.</Alert>;
    }
  }

  renderQueryBuilder() {
    const { alerts, onUpdateOptions, step, source } = this.props;
    const query = step.get('query_func');
    const options = step.get('query_kwargs') as string;
    if (query === 'filter') {
      const { filters }: Filters = options ? JSON.parse(options) : { filters: [] };

      return (
        <FilterQueryBuilder source={ source } filters={ fromJS(filters) } onUpdateFilters={ onUpdateOptions } />
      );
    }
    if (query === 'select') {
      const { columns } = options ? JSON.parse(options) : { columns: [] }; // TODO: specify type

      return (
        <SelectQueryBuilder source={ source } columns={ columns } onUpdateColumns={ this.props.onUpdateOptions }/>
      );
    }
    if (query === 'aggregate') {
      const parsedOptions = options ? JSON.parse(options) : { group_by: [], agg_func_name: '', operational_column: '' };

      return (
        <AggregateQueryBuilder
          alerts={ alerts }
          source={ source }
          groupBy={ parsedOptions.group_by }
          function={ parsedOptions.agg_func_name }
          column={ parsedOptions.operational_column }
          onUpdate={ onUpdateOptions }
        />
      );
    }
    if (query === 'scalar_transform' || query === 'multi_transform') {
      const parsedOptions = options
        ? JSON.parse(options)
        : { operational_value: '', trans_func_name: '', operational_column: '', operational_columns: [] };

      return (
        <TransformQueryBuilder
          alerts={ alerts }
          source={ source }
          value={ parsedOptions.operational_value }
          function={ parsedOptions.trans_func_name }
          column={ parsedOptions.operational_column }
          columns={ parsedOptions.operational_columns }
          multi={ query === 'multi_transform' }
          onUpdate={ onUpdateOptions }
        />
      );
    }
    if (query === 'join') {
      const parsedOptions = options ? JSON.parse(options) : { table_name: '', schema_name: '', join_on: {} };

      return (
        <JoinQueryBuilder
          alerts={ alerts }
          source={ source }
          tableName={ parsedOptions.table_name }
          schema={ parsedOptions.schema_name }
          columnMapping={ parsedOptions.join_on }
          onUpdate={ onUpdateOptions }
        />
      );
    }

    return null;
  }
}
