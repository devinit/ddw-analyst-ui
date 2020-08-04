import axios, { AxiosResponse } from 'axios';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Row, Tab } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { deleteOperation, fetchOperation, setOperation } from '../../actions/operations';
import * as sourcesActions from '../../actions/sources';
import { OperationForm } from '../../components/OperationForm';
import { OperationStepForm } from '../../components/OperationStepForm';
import OperationSteps from '../../components/OperationSteps';
import { SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import { Operation, OperationMap, OperationStepMap, OperationData } from '../../types/operations';
import { SourceMap, ColumnList } from '../../types/sources';
import { api, getSourceIDFromOperation } from '../../utils';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { QueryBuilderState, queryBuilderReducerId, QueryBuilderAction } from './reducers';
import { OperationDataPreviewTable } from '../../components/OperationDataPreviewTable';
import { BasicCard } from '../../components/BasicCard';

interface ActionProps {
  actions: typeof sourcesActions &
    typeof pageActions & {
      fetchOperation: typeof fetchOperation;
      setActiveOperation: typeof setOperation;
      deleteOperation: typeof deleteOperation;
    };
}
interface ReduxState {
  sources: SourcesState;
  source?: SourceMap;
  operations: List<OperationMap>;
  activeOperation?: OperationMap;
  activeSource?: SourceMap;
  token: TokenState;
  page: QueryBuilderState;
  user: UserState;
}
interface RouterParams {
  id?: string;
}
interface QueryState {
  previewData: OperationData[];
  previewShow: boolean;
  loadingPreview: boolean;
}
type QueryBuilderProps = ActionProps & ReduxState & RouteComponentProps<RouterParams>;

const StyledCardBody = styled(Card.Body)`
  &.card-body {
    padding-right: 15px;
    padding-left: 15px;
  }
`;

class QueryBuilder extends React.Component<QueryBuilderProps, QueryState> {
  constructor(props: QueryBuilderProps) {
    super(props);
    this.state = {
      previewShow: false,
      previewData: [],
      loadingPreview: false,
    };
  }

  render() {
    const { activeSource, page } = this.props;
    const activeStep = page.get('activeStep') as OperationStepMap | undefined;

    return (
      <Row>
        <Col md={12} lg={4}>
          <Tab.Container defaultActiveKey="operation">
            <Card className="source-details">
              <Card.Header className="card-header-text card-header-danger">
                <Card.Text>Dataset</Card.Text>
              </Card.Header>
              <StyledCardBody>{this.renderOperationForm()}</StyledCardBody>
            </Card>
          </Tab.Container>
        </Col>

        <Col md={12} lg={8}>
          {this.renderStepFormOrDatasetPreview(activeStep, activeSource, page)}
        </Col>
      </Row>
    );
  }

  private renderStepFormOrDatasetPreview(
    activeStep: OperationStepMap | undefined,
    activeSource: SourceMap | undefined,
    page: QueryBuilderState | undefined,
  ) {
    return this.state.previewShow ? (
      <BasicCard
        title="Preview Dataset"
        onClose={() =>
          this.setState((state) => {
            return { ...state, previewShow: false };
          })
        }
        activeStep={true}
      >
        {this.renderTable()}
      </BasicCard>
    ) : (
      <BasicCard title="Create Query Step" onClose={this.resetAction} activeStep={activeStep}>
        {this.renderOperationStepForm(
          activeSource,
          activeStep,
          page ? (page.get('editingStep') as boolean) : false,
        )}
      </BasicCard>
    );
  }

  componentDidMount() {
    const { activeOperation } = this.props;
    const { id } = this.props.match.params;
    if (id && !activeOperation) {
      this.setActiveOperationByID(id);
    }
    if (!id && activeOperation) {
      this.fetchActiveSourceByOperation(activeOperation);
    }
  }

  componentWillUnmount() {
    this.props.actions.setActiveOperation();
    this.props.actions.resetQueryBuilderState();
  }

  private renderOperationForm() {
    const { activeOperation: operation } = this.props;
    const { id } = this.props.match.params;

    if (id && !operation) {
      return 'Loading ...';
    }

    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const activeStep = this.props.page.get('activeStep') as OperationStepMap | undefined;
    const editable = this.isEditable(operation);

    return (
      <>
        <OperationForm
          operation={operation}
          editable={editable}
          valid={steps.count() > 0}
          onUpdateOperation={this.onUpdateOperation}
          onDuplicateOperation={this.onDuplicateOperation}
          onSuccess={this.onSaveOperation}
          onPreview={this.onPreviewOperation}
          previewing={this.state.loadingPreview}
          processing={this.props.page.get('processing') as boolean}
          onDeleteOperation={this.onDeleteOperation}
          onReset={!id ? () => this.props.actions.setActiveOperation() : undefined}
        >
          <OperationSteps
            sources={this.props.sources.get('sources') as List<SourceMap>}
            isFetchingSources={this.props.sources.get('loading') as boolean}
            steps={steps}
            fetchSources={this.props.actions.fetchSources}
            onSelectSource={this.props.actions.setActiveSource}
            onAddStep={this.addStep.bind(this)}
            activeSource={this.props.activeSource}
            activeStep={activeStep}
            onClickStep={(step) => {
              this.setState((state) => {
                return { ...state, previewShow: false };
              });
              this.props.actions.updateActiveStep(step, true);
            }}
            editable={editable}
          />
        </OperationForm>
      </>
    );
  }

  private addStep(step?: OperationStepMap | undefined): Partial<QueryBuilderAction> {
    this.setState((state) => {
      return { ...state, previewShow: false };
    });

    return this.props.actions.updateActiveStep(step);
  }

  private renderTable() {
    const columns =
      this.props.source && (this.props.source.get('columns') as ColumnList | undefined);

    return (
      <OperationDataPreviewTable
        list={this.state.previewData}
        columns={columns}
        limit={10}
        offset={0}
      />
    );
  }

  private renderOperationStepForm(source?: SourceMap, step?: OperationStepMap, editing = false) {
    if (step && source) {
      const editable = this.isEditable(this.props.activeOperation);

      return (
        <OperationStepForm
          source={source}
          step={step}
          onUpdateStep={this.props.actions.updateActiveStep}
          onSuccess={this.onAddOperationStep}
          onDeleteStep={this.onDeleteOperationStep}
          editing={editing}
          editable={editable}
        />
      );
    }

    return null;
  }

  private isEditable(operation?: OperationMap) {
    const user = this.props.user.get('username') as string;
    const isSuperUser = this.props.user.get('is_superuser') as boolean;

    return !operation || !operation.get('id') || user === operation.get('user') || isSuperUser;
  }

  private setActiveOperationByID(id: string) {
    const operation = this.props.operations.find((ope) => ope.get('id') === parseInt(id, 10));
    if (operation) {
      this.props.actions.setActiveOperation(operation);
      this.fetchActiveSourceByOperation(operation);
    } else {
      this.props.actions.fetchOperation(id);
    }
  }

  private fetchActiveSourceByOperation(operation: OperationMap) {
    const sourceID = getSourceIDFromOperation(operation);
    if (sourceID) {
      this.props.actions.fetchActiveSource(sourceID);
    }
  }

  private resetAction = () => {
    this.props.actions.updateActiveStep(undefined);
  };

  private onAddOperationStep = (step: OperationStepMap) => {
    if (this.props.page.get('editingStep')) {
      this.props.actions.editOperationStep(step);
    } else {
      this.props.actions.addOperationStep(step);
    }
    this.props.actions.updateActiveStep(undefined);
  };

  private onUpdateOperation = (operation: OperationMap) => {
    this.props.actions.setActiveOperation(operation, true);
  };

  private onDuplicateOperation = (operation: OperationMap) => {
    this.onUpdateOperation(operation);
    this.props.history.push('/queries/build');
  };

  private onDeleteOperation = (operation: OperationMap) => {
    const operationID = operation.get('id') as string | undefined;
    if (operationID) {
      this.props.actions.deleteOperation(operationID, this.props.history);
    }
  };

  private onSaveOperation = (preview = false) => {
    this.props.actions.savingOperation();
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const { activeOperation: operation } = this.props;
    if (!operation) {
      return;
    }
    const id = operation.get('id');
    const url = id ? `${api.routes.SINGLE_DATASET}${id}/` : api.routes.DATASETS;

    const data: Operation = { ...(operation.toJS() as Operation), operation_steps: steps.toJS() };
    if (this.props.token) {
      axios
        .request({
          url,
          method: id ? 'put' : 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${this.props.token}`,
          },
          data,
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
  };

  private onPreviewOperation = () => {
    this.setState((state) => {
      return { ...state, loadingPreview: true };
    });
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const { activeOperation: operation } = this.props;
    if (!operation) {
      return;
    }

    const url = `${api.routes.PREVIEW_SINGLE_DATASET}`;

    const data: Operation = { ...(operation.toJS() as Operation), operation_steps: steps.toJS() };
    if (this.props.token) {
      axios
        .request({
          url,
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${this.props.token}`,
          },
          data,
        })
        .then((response: AxiosResponse) => {
          this.setState({ previewData: response.data.results });
          this.setState((state) => {
            return { ...state, previewShow: true, loadingPreview: false };
          });
        })
        .catch(() => {
          this.setState({ previewData: [] });
          this.setState((state) => {
            return { ...state, previewShow: true, loadingPreview: false };
          });
        });
    }
  };

  private onDeleteOperationStep = (step: OperationStepMap) => {
    this.props.actions.updateActiveStep(undefined);
    this.props.actions.deleteOperationStep(step);
  };
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, Record<string, unknown>> = (
  dispatch,
): ActionProps => ({
  actions: bindActionCreators(
    {
      ...sourcesActions,
      ...pageActions,
      fetchOperation,
      setActiveOperation: setOperation,
      deleteOperation,
    },
    dispatch,
  ),
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    token: reduxStore.get('token') as TokenState,
    sources: reduxStore.get('sources') as SourcesState,
    operations: reduxStore.getIn(['operations', 'operations']),
    activeOperation: reduxStore.getIn(['operations', 'activeOperation']),
    activeSource: reduxStore.getIn(['sources', 'activeSource']),
    page: reduxStore.get(`${queryBuilderReducerId}`),
    user: reduxStore.get('user') as UserState,
    source: reduxStore.getIn(['sources', 'activeSource']),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryBuilder);

export { connector as default };
