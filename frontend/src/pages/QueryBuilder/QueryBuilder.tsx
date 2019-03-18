import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import * as sourcesActions from '../../actions/sources';
import { SourceMap, SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { ReduxStore } from '../../store';
import * as pageActions from './actions';

interface ActionProps {
  actions: typeof sourcesActions & typeof pageActions;
}
interface ReduxState {
  sources: SourcesState;
  token: TokenState;
}
type QueryBuilderProps = ActionProps & ReduxState;

class QueryBuilder extends React.Component<QueryBuilderProps> {
  render() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;

    return (
      <Row>
        <Col lg={ 3 }>
          <Card>
            <Card.Header>
              <Card.Title>Actions</Card.Title>
            </Card.Header>
            <Card.Body>
              <Card.Text>Actions Go Here!</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={ 9 }>
          <Card>
            <Card.Body>
              <Col lg={ 6 } className="pl-0">
                <div>Active Data Set</div>
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
              </Col>
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
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({ ...sourcesActions, ...pageActions }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    token: reduxStore.get('token') as TokenState,
    sources: reduxStore.get('sources') as SourcesState
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryBuilder);

export { connector as QueryBuilder };
