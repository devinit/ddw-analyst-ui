import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Alert, Button, Col, Form } from 'react-bootstrap';
import { MapDispatchToProps, MapStateToProps, connect } from 'react-redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { ReduxStore } from '../../store';
import { ColumnList, SourceMap } from '../../types/sources';
import { JoinColumnsMapper } from '../JoinColumnsMapper';
import { JoinOptions } from '../../types/operations';
import * as sourcesActions from '../../actions/sources';
import { bindActionCreators } from 'redux';

interface ReduxState {
  sources: List<SourceMap>;
  isFetchingSources: boolean;
}
type ActionProps = typeof sourcesActions;
type Alerts = { [P in keyof JoinOptions ]: string };

interface ComponentProps {
  alerts?: Partial<Alerts>;
  source: SourceMap;
  tableName?: string;
  schema?: string;
  columnsX: string[];
  columnsY: string[];
  columnMapping?: { [key: string]: string };
  joinType: string;
  editable?: boolean;
  onUpdate?: (options: string) => void;
}
type JoinQueryBuilderProps = ComponentProps & ReduxState & ActionProps;

class JoinQueryBuilder extends React.Component<JoinQueryBuilderProps> {
  static defaultProps: Partial<JoinQueryBuilderProps> = {
    alerts: {},
    editable: true
  };
  private joinTypes = [
    { key: 'inner', text: 'Inner Join', value: 'inner' },
    { key: 'outer', text: 'Outer Join', value: 'outer' },
    { key: 'left', text: 'Left Join', value: 'left' },
    { key: 'right', text: 'Right Join', value: 'right' },
    { key: 'left_outer', text: 'Left Outer Join', value: 'left_outer' },
    { key: 'right_outer', text: 'Right Outer Join', value: 'right_outer' },
    { key: 'full', text: 'Full Join', value: 'full' },
    { key: 'cross', text: 'Cross Join', value: 'cross' }
  ];

  render() {
    const secondarySource = this.getSourceFromTableName(this.props.sources, this.props.tableName);
    const sourceID = secondarySource && secondarySource.get('id');
    const { columnMapping, source: primarySource, alerts } = this.props;

    return (
      <React.Fragment>

        <Col md={ 6 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Join Type</Form.Label>
            <Dropdown
              name="join_how"
              placeholder="Join Type"
              fluid
              search
              selection
              options={ this.joinTypes }
              value={ this.props.joinType }
              onChange={ this.onChange }
              disabled={ !this.props.editable }
            />
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && alerts.join_how) }) }
            >
              { alerts && alerts.join_how }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={ 6 } className="mt-2 pl-0">
          <Form.Group>
            <Form.Label className="bmd-label-floating">Data set to join with</Form.Label>
            <Dropdown
              name="source"
              placeholder="Select Data Set"
              fluid
              search
              selection
              options={ this.getSelectOptionsFromSources(this.props.sources, this.props.source) }
              loading={ this.props.isFetchingSources }
              value={ sourceID as string | undefined }
              onChange={ this.onChange }
              disabled={ !this.props.editable }
            />
            <Form.Control.Feedback
              type="invalid"
              className={ classNames({ 'd-block': !!(alerts && (alerts.table_name || alerts.schema_name)) }) }
            >
              { alerts && (alerts.table_name || alerts.schema_name) }
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={ 12 } className={ classNames('mt-2 pl-0', { 'd-none': !secondarySource }) }>
          <Alert variant="danger" hidden={ !alerts || !alerts.join_on }>{ alerts && alerts.join_on }</Alert>
          {
            columnMapping && secondarySource
              ? this.renderColumnMappings(columnMapping, primarySource, secondarySource)
              : null
          }
          <Button variant="danger" size="sm" onClick={ this.addMapping } hidden={ !this.props.editable }>
            <i className="material-icons mr-1">add</i>
            Add Mapping
          </Button>
        </Col>
      </React.Fragment>
    );
  }

  componentDidMount() {
    if (!this.props.isFetchingSources) {
      this.props.fetchSources({ limit: 1000 });
    }
    if (this.props.onUpdate && !this.props.columnsX.length) {
      this.props.onUpdate(JSON.stringify({ columns_x: this.props.columnsX }));
    }
  }

  componentDidUpdate(prevProps: JoinQueryBuilderProps) {
    const { onUpdate, sources, tableName } = this.props;
    if (tableName && prevProps.tableName !== tableName && onUpdate) {
      const secondarySource = this.getSourceFromTableName(sources, tableName);
      if (secondarySource) {
        const columns = secondarySource.get('columns') as ColumnList;
        this.updateOptions({ columns_y: columns.map(column => column.get('name')) });
      }
    }
  }

  private renderColumnMappings(columnMapping: { [key: string]: string }, primarySource: SourceMap, secondarySource: SourceMap) { //tslint:disable-line
    const primaryColumns = primarySource.get('columns') as ColumnList;
    const secondaryColumns = secondarySource.get('columns') as ColumnList;

    return Object.keys(columnMapping).map(primaryColumn =>
      <JoinColumnsMapper
        key={ primaryColumn }
        editable={ this.props.editable }
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
    const { columnMapping, onUpdate } = this.props;
    if (onUpdate) {
      if (columnMapping) {
        this.updateOptions({ join_on: { ...columnMapping, column1: 'column2' } });
      } else {
        this.updateOptions({ join_on: { column1: 'column2' } });
      }
    }
  }

  private updateOptions(updatedOptions: { [key: string]: any }) {
    const { columnMapping, columnsX, columnsY, onUpdate, schema, tableName, joinType } = this.props;
    if (onUpdate) {
      const options = {
        table_name: tableName,
        schema_name: schema,
        columns_x: columnsX,
        columns_y: columnsY,
        join_how: joinType,
        join_on: columnMapping,
        ...updatedOptions
      };
      onUpdate(JSON.stringify(options));
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
    let options: { [key: string]: any } = {};
    if (data.name === 'source') {
      const selectedSource = this.props.sources.find(source => source.get('id') === data.value);
      if (selectedSource) {
        const { columnMapping } = this.props;
        options = {
          table_name: selectedSource.get('active_mirror_name'),
          schema_name: selectedSource.get('schema'),
          join_on: columnMapping
        };
      }
    } else {
      options[data.name] = data.value;
    }
    this.updateOptions(options);
  }

  private onChangeMapping = (columnMapping: { [key: string]: string }) => {
    this.updateOptions({ join_on: columnMapping });
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps =>
  bindActionCreators(sourcesActions, dispatch);

const mapStateToProps: MapStateToProps<ReduxState, ComponentProps, ReduxStore> =
  (reduxStore: ReduxStore): ReduxState => ({
    sources: reduxStore.getIn([ 'sources', 'sources' ]) as List<SourceMap>,
    isFetchingSources: reduxStore.getIn([ 'sources', 'loading' ]) as boolean
  });

const connector = connect(mapStateToProps, mapDispatchToProps)(JoinQueryBuilder);

export { connector as JoinQueryBuilder };
