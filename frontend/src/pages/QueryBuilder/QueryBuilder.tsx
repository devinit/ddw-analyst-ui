import axios, { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Nav, Row, Tab } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import * as sourcesActions from '../../actions/sources';
import { OperationForm } from '../../components/OperationForm';
import { OperationStepForm } from '../../components/OperationStepForm';
import OperationSteps from '../../components/OperationSteps';
import { SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { ReduxStore } from '../../store';
import { Operation, OperationMap, OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { QueryBuilderState, queryBuilderReducerId } from './reducers';
import { api } from '../../utils';

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
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const operation = this.props.page.get('operation') as OperationMap | undefined;

    return (
      <Row>
        <Col lg={ 4 }>
          <Tab.Container defaultActiveKey="operation">
            <Card className="source-details">
              <Card.Body>

                <Nav variant="pills" className="nav-pills-danger" role="tablist">
                  <Nav.Item><Nav.Link eventKey="operation">Operation</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="steps">Operation Steps</Nav.Link></Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="operation">
                    <OperationForm
                      operation={ operation }
                      valid={ steps.count() > 0 }
                      onUpdateOperation={ this.props.actions.updateOperation }
                      onSuccess={ this.onSaveOperation }
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="steps">
                    <OperationSteps
                      sources={ sources }
                      isFetchingSources={ loading }
                      steps={ steps }
                      fetchSources={ this.props.actions.fetchSources }
                      onSelectSource={ this.props.actions.setActiveSource }
                      onAddStep={ this.props.actions.updateActiveStep }
                      activeSource={ activeSource }
                      activeStep={ activeStep }
                    />
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
          onUpdateStep={ this.props.actions.updateActiveStep }
          onSuccess={ this.onAddOperationStep }
        />
      );
    }

    return null;
  }

  private resetAction = () => {
    this.props.actions.updateActiveStep(undefined);
  }

  private onAddOperationStep = (step: OperationStepMap) => {
    this.props.actions.addOperationStep(step);
    this.props.actions.updateActiveStep(undefined);
  }

  private onSaveOperation = () => {
    this.props.actions.savingOperation();
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const operation = this.props.page.get('operation') as OperationMap;

    const data: Operation = { ...operation.toJS() as Operation, operation_steps: steps.toJS() };
    if (this.props.token) {
      axios.request({
        url: api.routes.OPERATIONS,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.props.token}`
        },
        data
      })
      .then((response: AxiosResponse<Operation[]>) => {
        if (response.status === 200 || response.status === 201) {
          this.props.actions.operationSaved(true);
        }
      })
      .catch(() => {
        this.props.actions.operationSaved(false);
      });
    }
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
