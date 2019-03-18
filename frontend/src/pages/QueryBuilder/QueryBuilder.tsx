import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import * as sourcesActions from '../../actions/sources';
import { SourceMap, SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { ReduxStore } from '../../store';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { QueryAction, QueryBuilderState, queryBuilderReducerId } from './reducers';

interface ActionProps {
  actions: typeof sourcesActions & typeof pageActions;
}
interface ReduxState {
  sources: SourcesState;
  token: TokenState;
  page: QueryBuilderState;
}
type QueryBuilderProps = ActionProps & ReduxState;

const StyledIcon = styled.i`cursor: pointer;`;

class QueryBuilder extends React.Component<QueryBuilderProps> {
  private actions = [
    { key: 'filter', icon: 'filter', text: 'Filter', value: 'filter' },
    { key: 'join', icon: 'chain', text: 'Join', value: 'join' },
    { key: 'aggregate', icon: 'rain', text: 'Aggregate', value: 'aggregate' },
    { key: 'transform', icon: 'magic', text: 'Transform', value: 'transform' }
  ];

  render() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    const activeSource = this.props.page.get('activeSource') as SourceMap;
    const action = this.props.page.get('action') as string;

    return (
      <Row>
        <Col lg={ 4 }>
          <Card>
            <Card.Header>
              <Card.Title>Query State</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Card.Text>Active Data Set</Card.Text>
                <Dropdown
                  placeholder="Select Data Set"
                  fluid
                  selection
                  search
                  options={ this.getSelectOptionsFromSources(sources) }
                  loading={ loading }
                  onClick={ this.fetchSources }
                  onChange={ this.onSelectSource }
                />
              </div>
              <div className={ classNames('mb-3', { 'd-none': !activeSource }) }>
                <Dropdown
                  options={ this.actions }
                  simple
                  item
                  text="Actions"
                  onChange={ this.onSelectAction }
                  disabled={ !!action }
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={ 8 }>
          <Card className={ classNames({ 'd-none': !action }) }>
            <Card.Header>
              <Card.Title>
                { action ? action.toUpperCase() : 'Select Action' }
                <StyledIcon className="material-icons float-right" onClick={ this.resetAction }>
                  close
                </StyledIcon>
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>Action Details Go Here!</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  private getSelectOptionsFromSources(sources: List<SourceMap>): DropdownItemProps[] {
    if (sources.count()) {
      return sources.map(source => ({
        key: source.get('pk'),
        text: source.get('indicator'),
        value: source.get('pk')
      })).toJS();
    }

    return [];
  }

  private fetchSources = () => {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    if (!sources.count() && !loading) {
      this.props.actions.fetchSources();
    }
  }

  private onSelectSource = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const selectedSource = sources.find(source => source.get('pk') === data.value);
    if (selectedSource) {
      this.props.actions.setActiveSource(selectedSource);
    }
  }

  private onSelectAction = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    this.props.actions.setAction(data.value as QueryAction);
  }

  private resetAction = () => {
    this.props.actions.setAction(undefined);
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ ...sourcesActions, ...pageActions }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    token: reduxStore.get('token') as TokenState,
    sources: reduxStore.get('sources') as SourcesState,
    page: reduxStore.get(`${queryBuilderReducerId}`)
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryBuilder);

export { connector as QueryBuilder };
