import classNames from 'classnames';
import { List, fromJS } from 'immutable';
import * as React from 'react';
import { Button, Card, Col, Nav, Row, Tab } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import * as sourcesActions from '../../actions/sources';
import { OperationStepForm } from '../../components/OperationStepForm/OperationStepForm';
import { SourceMap, SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { ReduxStore } from '../../store';
import { OperationStepMap } from '../../types/query-builder';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { QueryBuilderState, queryBuilderReducerId } from './reducers';
import { OperationForm } from '../../components/OperationForm';

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
  render() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    const activeSource = this.props.page.get('activeSource') as SourceMap | undefined;
    const activeStep = this.props.page.get('activeStep') as OperationStepMap | undefined;

    return (
      <Row>
        <Col lg={ 4 }>
          <Tab.Container defaultActiveKey="operation">
            <Card className="source-details">
              <Card.Body>

                <Nav variant="pills" className="nav-pills-danger" role="tablist">
                  <Nav.Item>
                    <Nav.Link eventKey="operation">Operation</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="steps">Operation Steps</Nav.Link>
                  </Nav.Item>
                </Nav>
                <Tab.Content>
                  <Tab.Pane eventKey="operation">
                    <OperationForm/>
                  </Tab.Pane>
                  <Tab.Pane eventKey="steps">
                    <div className="mb-3">
                      <label>Active Data Set</label>
                      <Dropdown
                        placeholder="Select Data Set"
                        fluid
                        selection
                        search
                        options={ this.getSelectOptionsFromSources(sources) }
                        loading={ loading }
                        onClick={ this.fetchSources }
                        onChange={ this.onSelectSource }
                        defaultValue={ activeSource ? activeSource.get('pk') as string : undefined }
                      />
                    </div>
                    <div className={ classNames('mb-3', { 'd-none': !activeSource }) }>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={ this.onAddAction }
                        disabled={ !!activeStep }
                      >
                        <i className="material-icons mr-1">add</i>
                        Add Operation
                      </Button>
                    </div>
                  </Tab.Pane>
                </Tab.Content>

              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>

        <Col lg={ 8 }>
          <Card className={ classNames({ 'd-none': !activeStep }) }>
            <Card.Header>
              <Card.Title>
                Create Operation Step
                <StyledIcon className="material-icons float-right" onClick={ this.resetAction }>
                  close
                </StyledIcon>
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                { this.renderOperationStepForm(activeSource, activeStep) }
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  private renderOperationStepForm(source?: SourceMap, step?: OperationStepMap) {
    if (step && source) {
      return (
        <OperationStepForm
          source={ source }
          step={ step }
          onSuccess={ this.props.actions.setActiveStep }
        />
      );
    }

    return null;
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

  private onAddAction = () => {
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    this.props.actions.setActiveStep(fromJS({ step_id: steps.count() + 1 }));
  }

  private resetAction = () => {
    this.props.actions.setActiveStep(undefined);
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
