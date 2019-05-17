import { List, Set, fromJS } from 'immutable';
import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { DropdownItemProps } from 'semantic-ui-react';
import { queryBuilderReducerId } from '../../pages/QueryBuilder/reducers';
import { ReduxStore } from '../../store';
import { Filters, OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { formatString } from '../../utils';
import { AggregateQueryBuilder } from '../AggregateQueryBuilder';
import FilterQueryBuilder from '../FilterQueryBuilder';
import { JoinQueryBuilder } from '../JoinQueryBuilder';
import { SelectQueryBuilder } from '../SelectQueryBuilder';
import { TransformQueryBuilder } from '../TransformQueryBuilder';

interface ComponentProps {
  alerts?: { [key: string]: string };
  source: SourceMap;
  step: OperationStepMap;
  editable?: boolean;
  onUpdateOptions: (options: string) => void;
}

interface ReduxState {
  steps: List<OperationStepMap>;
}
type QueryBuilderHandlerProps = ComponentProps & ReduxState;

class QueryBuilderHandler extends React.Component<QueryBuilderHandlerProps> {
  static getSelectOptionsFromColumns(columns: Set<string>): DropdownItemProps[] {
    if (columns.count()) {
      return columns.toArray().map((column, key) => ({
        key,
        text: formatString(column),
        value: column
      }));
    }

    return [];
  }

  static isNumerical(functn: string) {
    return functn !== 'text_search' && functn !== 'concat';
  }

  static getSelectOptionsFromFilteredColumns(columnsList: ColumnList, columns: Set<string>, functn?: string): DropdownItemProps[] { //tslint:disable-line
    const dataSetColumns = columnsList.filter(column => columns.find(col => col === column.get('name')));
    const generatedColumns = columns.subtract(Set(dataSetColumns.map(column => column.get('name'))) as Set<string>);
    let selectableColumns = generatedColumns;
    if (dataSetColumns.count()) {
      if (functn) {
        const dataType: 'N' | 'C' = this.isNumerical(functn) ? 'N' : 'C';
        selectableColumns = selectableColumns.union(
          dataSetColumns
            .filter(column => column.get('data_type') === dataType)
            .map(column => column.get('name')) as List<string>
        );
      } else {
        selectableColumns = selectableColumns.union(dataSetColumns.map(column => column.get('name'))) as Set<string>;
      }
    }

    return selectableColumns.map((column, key) => ({
      key,
      text: formatString(column),
      value: column
    })).toJS();
  }

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
    const { alerts, onUpdateOptions, step, steps, source } = this.props;
    const query = step.get('query_func');
    const options = step.get('query_kwargs') as string;
    if (query === 'filter') {
      const { filters }: Filters = options ? JSON.parse(options) : { filters: [] };

      return (
        <FilterQueryBuilder
          source={ source }
          filters={ fromJS(filters) }
          onUpdateFilters={ onUpdateOptions }
          editable={ this.props.editable }
        />
      );
    }
    if (query === 'select') {
      const { columns } = options ? JSON.parse(options) : { columns: [] }; // TODO: specify type

      return (
        <SelectQueryBuilder
          source={ source }
          columns={ columns }
          step={ step }
          steps={ steps }
          onUpdateColumns={ this.props.onUpdateOptions }
          editable={ this.props.editable }
        />
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
          step={ step }
          steps={ steps }
          onUpdate={ onUpdateOptions }
          editable={ this.props.editable }
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
          step={ step }
          steps={ steps }
          multi={ query === 'multi_transform' }
          onUpdate={ onUpdateOptions }
          editable={ this.props.editable }
        />
      );
    }
    if (query === 'join') {
      const parsedOptions = options
        ? JSON.parse(options)
        : { table_name: '', schema_name: '', join_on: {}, columns_x: [], columns_y: [], join_how: '' };
      const columns = source.get('columns') as ColumnList;

      return (
        <JoinQueryBuilder
          alerts={ alerts }
          source={ source }
          tableName={ parsedOptions.table_name }
          schema={ parsedOptions.schema_name }
          columnMapping={ parsedOptions.join_on }
          columnsX={ parsedOptions.columns_x || columns.map(column => column.get('name')) }
          columnsY={ parsedOptions.columns_y || [] }
          joinType={ parsedOptions.join_how }
          onUpdate={ onUpdateOptions }
          editable={ this.props.editable }
        />
      );
    }

    return null;
  }
}

const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  steps: reduxStore.getIn([ `${queryBuilderReducerId}`, 'steps' ]) as List<OperationStepMap>
});

const connector = connect(mapStateToProps)(QueryBuilderHandler);

export { connector as default, connector as QueryBuilderHandler, QueryBuilderHandler as QueryBuilderHandlerStatic };
