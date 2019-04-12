import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { MapStateToProps, connect } from 'react-redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { ReduxStore } from '../../store';
import { ColumnList, SourceMap } from '../../types/sources';
import { JoinColumnsMapper } from '../JoinColumnsMapper';

interface ReduxState {
  sources: List<SourceMap>;
}

interface ComponentProps {
  source: SourceMap;
  tableName?: string;
  schema?: string;
  columnMapping?: { [key: string]: string };
  onUpdate?: (options: string) => void;
}
type JoinQueryBuilderProps = ComponentProps & ReduxState;

class JoinQueryBuilder extends React.Component<JoinQueryBuilderProps> {
  render() {
    const secondarySource = this.getSourceFromTableName(this.props.sources, this.props.tableName);
    const sourceID = secondarySource && secondarySource.get('id');
    const { columnMapping, source: primarySource } = this.props;

    return (
      <React.Fragment>

        <Col md={ 6 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Data Set To Join With</Form.Label>
            <Dropdown
              name="source"
              placeholder="Select Data Set"
              fluid
              search
              selection
              options={ this.getSelectOptionsFromSources(this.props.sources, this.props.source) }
              value={ sourceID as string | undefined }
              onChange={ this.onChange }
            />
          </Form.Group>
        </Col>

        <Col md={ 12 } className={ classNames('mt-2 pl-0', { 'd-none': !secondarySource }) }>
          {
            columnMapping && secondarySource
              ? this.renderColumnMappings(columnMapping, primarySource, secondarySource)
              : null
          }
          <Button variant="danger" size="sm" onClick={ this.addMapping }>
            <i className="material-icons mr-1">add</i>
            Add Mapping
          </Button>
        </Col>
      </React.Fragment>
    );
  }

  private renderColumnMappings(columnMapping: { [key: string]: string }, primarySource: SourceMap, secondarySource: SourceMap) { //tslint:disable-line
    const primaryColumns = primarySource.get('columns') as ColumnList;
    const secondaryColumns = secondarySource.get('columns') as ColumnList;

    return Object.keys(columnMapping).map(primaryColumn =>
      <JoinColumnsMapper
        key={ primaryColumn }
        primaryColumns={ primaryColumns }
        secondaryColumns={ secondaryColumns }
        primaryColumn={ primaryColumn }
        secondaryColumn={ columnMapping[primaryColumn] }
        columnMapping={ columnMapping }
        onUpdate={ this.onChangeMapping }
      />
    );

    return [];
  }

  private getSelectOptionsFromSources(sources: List<SourceMap>, currentSource: SourceMap): DropdownItemProps[] {
    if (sources.count()) {
      return sources
        .filter(source => source.get('id') !== currentSource.get('id'))
        .map(source => ({
          key: source.get('id'),
          text: source.get('indicator'),
          value: source.get('id')
        })).toJS();
    }

    return [];
  }

  private addMapping = () => {
    const { columnMapping, onUpdate, schema, tableName } = this.props;
    if (onUpdate) {
      const options = { table_name: tableName, schema_name: schema };
      if (columnMapping) {
        onUpdate(JSON.stringify({ ...options, join_on: { ...columnMapping, column1: 'column2' } }));
      } else {
        onUpdate(JSON.stringify({ ...options, join_on: { column1: 'column2' } }));
      }
    }
  }

  private getSourceFromTableName(sources: List<SourceMap>, tableName?: string) {
    return sources.count() && tableName
      ? sources.find(source => source.get('active_mirror_name') === tableName)
      : undefined;
  }

  private onChange = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (!this.props.onUpdate) {
      return;
    }
    if (data.name === 'source') {
      const selectedSource = this.props.sources.find(source => source.get('id') === data.value);
      if (selectedSource) {
        const { columnMapping } = this.props;
        const options = { join_on: columnMapping };
        this.props.onUpdate(JSON.stringify({
          ...options,
          table_name: selectedSource.get('active_mirror_name'),
          schema_name: selectedSource.get('schema')
        }));
      }
    }
  }

  private onChangeMapping = (columnMapping: { [key: string]: string }) => {
    const { onUpdate, schema, tableName } = this.props;
    if (!onUpdate) { return; }
    const options = { table_name: tableName, schema_name: schema };
    onUpdate(JSON.stringify({ ...options, join_on: columnMapping }));
  }
}

const mapStateToProps: MapStateToProps<ReduxState, ComponentProps, ReduxStore> =
  (reduxStore: ReduxStore): ReduxState => ({
    sources: reduxStore.getIn([ 'sources', 'sources' ]) as List<SourceMap>
  });

const connector = connect(mapStateToProps)(JoinQueryBuilder);

export { connector as JoinQueryBuilder };
