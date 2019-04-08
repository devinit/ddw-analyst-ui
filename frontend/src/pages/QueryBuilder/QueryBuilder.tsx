import axios, { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Row, Tab } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouterProps } from 'react-router';
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
type QueryBuilderProps = ActionProps & ReduxState & RouterProps;

const StyledIcon = styled.i`cursor: pointer;`;
const StyledCardBody = styled(Card.Body)`
  &.card-body {
    padding-right: 15px;
    padding-left: 15px;
  }
`;

class QueryBuilder extends React.Component<QueryBuilderProps> {
  render() {
    const sources = this.props.sources.get('sources') as List<SourceMap>;
    const loading = this.props.sources.get('loading') as boolean;
    const activeSource = this.props.page.get('activeSource') as SourceMap | undefined;
    const activeStep = this.props.page.get('activeStep') as OperationStepMap | undefined;
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const operation = this.props.page.get('operation') as OperationMap | undefined;
    const processing = this.props.page.get('processing') as boolean;
    const editingStep = this.props.page.get('editingStep') as boolean;

    return (
      <Row>
        <Col lg={ 4 }>
          <Tab.Container defaultActiveKey="operation">
            <Card className="source-details">
              <Card.Header className="card-header-text card-header-danger">
                <Card.Text>Operation</Card.Text>
              </Card.Header>
              <StyledCardBody>

                <OperationForm
                  operation={ operation }
                  valid={ steps.count() > 0 }
                  onUpdateOperation={ this.onUpdateOperation }
                  onSuccess={ this.onSaveOperation }
                  processing={ processing }
                >
                  <OperationSteps
                    sources={ sources }
                    isFetchingSources={ loading }
                    steps={ steps }
                    fetchSources={ this.props.actions.fetchSources }
                    onSelectSource={ this.props.actions.setActiveSource }
                    onAddStep={ this.props.actions.updateActiveStep }
                    activeSource={ activeSource }
                    activeStep={ activeStep }
                    onClickStep={ (step) => this.props.actions.updateActiveStep(step, true) }
                  />
                </OperationForm>

              </StyledCardBody>
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
                { this.renderOperationStepForm(activeSource, activeStep, editingStep) }
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  private renderOperationStepForm(source?: SourceMap, step?: OperationStepMap, editing = false) {
    if (step && source) {
      return (
        <OperationStepForm
          source={ source }
          step={ step }
          onUpdateStep={ this.props.actions.updateActiveStep }
          onSuccess={ this.onAddOperationStep }
          onDeleteStep={ this.onDeleteOperationStep }
          editing={ editing }
        />
      );
    }

    return null;
  }

  private resetAction = () => {
    this.props.actions.updateActiveStep(undefined);
  }

  private onAddOperationStep = (step: OperationStepMap) => {
    if (this.props.page.get('editingStep')) {
      this.props.actions.editOperationStep(step);
    } else {
      this.props.actions.addOperationStep(step);
    }
    this.props.actions.updateActiveStep(undefined);
  }

  private onUpdateOperation = (operation: OperationMap) => {
    this.props.actions.setOperation(operation, true);
  }

  private onSaveOperation = (preview = false) => {
    this.props.actions.savingOperation();
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const operation = this.props.page.get('operation') as OperationMap;
    const id = operation.get('id');
    const url = id ? `${api.routes.OPERATIONS}${id}/` : api.routes.OPERATIONS;

    const data: Operation = { ...operation.toJS() as Operation, operation_steps: steps.toJS() };
    if (this.props.token) {
      axios.request({
        url,
        method: id ? 'put' : 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.props.token}`
        },
        data
      })
      .then((response: AxiosResponse<Operation>) => {
        if (response.status === 200 || response.status === 201) {
          this.props.actions.operationSaved(true);
          if (preview) {
            this.props.history.push(`/queries/data/${response.data.id}/`);
          } else {
            this.props.history.push('/');
          }
        }
      })
      .catch(() => {
        this.props.actions.operationSaved(false);
      });
    }
  }

  private onDeleteOperationStep = (step: OperationStepMap) => {
    this.props.actions.updateActiveStep(undefined);
    this.props.actions.deleteOperationStep(step);
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
