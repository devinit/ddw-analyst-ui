import axios, { AxiosResponse } from 'axios';
import { fromJS, List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Card, Col, Row, Tab } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { deleteOperation, fetchOperation, setOperation } from '../../actions/operations';
import * as sourcesActions from '../../actions/sources';
import { BasicCard } from '../../components/BasicCard';
import { OperationDataTableContainer } from '../../components/OperationDataTableContainer';
import { OperationForm } from '../../components/OperationForm';
import { OperationStepForm } from '../../components/OperationStepForm';
import OperationSteps from '../../components/OperationSteps';
import { SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import {
  Operation,
  OperationDataMap,
  OperationMap,
  OperationStepMap,
} from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { api, getSourceIDFromOperation } from '../../utils';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { QueryBuilderAction, queryBuilderReducerId, QueryBuilderState } from './reducers';

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

type QueryBuilderProps = ActionProps & ReduxState & RouteComponentProps<RouterParams>;

const StyledCardBody = styled(Card.Body)`
  &.card-body {
    padding-right: 15px;
    padding-left: 15px;
  }
`;

const QueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const [previewShow, setPreviewShow] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<List<OperationDataMap>>(List());

  useEffect(() => {
    const { id } = props.match.params;
    if (id && !props.activeOperation) {
      setActiveOperationByID(id);
    }
    if (!id && props.activeOperation) {
      fetchActiveSourceByOperation(props.activeOperation);
    }

    return () => {
      props.actions.setActiveOperation();
      props.actions.resetQueryBuilderState();
    };
  }, []);

  const renderStepFormOrDatasetPreview = (
    activeStep: OperationStepMap | undefined,
    activeSource: SourceMap | undefined,
    page: QueryBuilderState | undefined,
  ) => {
    return previewShow ? (
      <BasicCard title="Preview Dataset" onClose={() => setPreviewShow(false)} activeStep={true}>
        {renderTable()}
      </BasicCard>
    ) : (
      <BasicCard title="Create Query Step" onClose={resetAction} activeStep={activeStep}>
        {renderOperationStepForm(
          activeSource,
          activeStep,
          page ? (page.get('editingStep') as boolean) : false,
        )}
      </BasicCard>
    );
  };

  const renderOperationForm = () => {
    const { activeOperation: operation } = props;
    const { id } = props.match.params;

    if (id && !operation) {
      return 'Loading ...';
    }

    const steps = props.page.get('steps') as List<OperationStepMap>;
    const activeStep = props.page.get('activeStep') as OperationStepMap | undefined;
    const editable = isEditable(operation);

    return (
      <>
        <OperationForm
          operation={operation}
          editable={editable}
          valid={steps.count() > 0}
          onUpdateOperation={onUpdateOperation}
          onDuplicateOperation={onDuplicateOperation}
          onSuccess={onSaveOperation}
          onPreview={onPreviewOperation}
          previewing={loadingPreview}
          processing={props.page.get('processing') as boolean}
          onDeleteOperation={onDeleteOperation}
          onReset={!id ? () => props.actions.setActiveOperation() : undefined}
        >
          <OperationSteps
            sources={props.sources.get('sources') as List<SourceMap>}
            isFetchingSources={props.sources.get('loading') as boolean}
            steps={steps}
            fetchSources={props.actions.fetchSources}
            onSelectSource={props.actions.setActiveSource}
            onAddStep={() => addStep()}
            activeSource={props.activeSource}
            activeStep={activeStep}
            onClickStep={(step) => {
              setPreviewShow(false);
              props.actions.updateActiveStep(step, true);
            }}
            editable={editable}
          />
        </OperationForm>
      </>
    );
  };

  const addStep = (step?: OperationStepMap | undefined): Partial<QueryBuilderAction> => {
    setPreviewShow(false);

    return props.actions.updateActiveStep(step);
  };

  const renderTable = () => {
    const columns = props.source && (props.source.get('columns') as ColumnList | undefined);

    return (
      <OperationDataTableContainer list={previewData} columns={columns} limit={10} offset={0} />
    );
  };

  const renderOperationStepForm = (
    source?: SourceMap,
    step?: OperationStepMap,
    editing = false,
  ) => {
    if (step && source) {
      const editable = isEditable(props.activeOperation);

      return (
        <OperationStepForm
          source={source}
          step={step}
          onUpdateStep={props.actions.updateActiveStep}
          onSuccess={onAddOperationStep}
          onDeleteStep={onDeleteOperationStep}
          editing={editing}
          editable={editable}
        />
      );
    }

    return null;
  };

  const isEditable = (operation?: OperationMap) => {
    const user = props.user.get('username') as string;
    const isSuperUser = props.user.get('is_superuser') as boolean;

    return !operation || !operation.get('id') || user === operation.get('user') || isSuperUser;
  };

  const setActiveOperationByID = (id: string) => {
    const operation = props.operations.find((ope) => ope.get('id') === parseInt(id, 10));
    if (operation) {
      props.actions.setActiveOperation(operation);
      fetchActiveSourceByOperation(operation);
    } else {
      props.actions.fetchOperation(id);
    }
  };

  const fetchActiveSourceByOperation = (operation: OperationMap) => {
    const sourceID = getSourceIDFromOperation(operation);
    if (sourceID) {
      props.actions.fetchActiveSource(sourceID);
    }
  };

  const resetAction = () => {
    props.actions.updateActiveStep(undefined);
  };

  const onAddOperationStep = (step: OperationStepMap) => {
    if (props.page.get('editingStep')) {
      props.actions.editOperationStep(step);
    } else {
      props.actions.addOperationStep(step);
    }
    props.actions.updateActiveStep(undefined);
  };

  const onUpdateOperation = (operation: OperationMap) => {
    props.actions.setActiveOperation(operation, true);
  };

  const onDuplicateOperation = (operation: OperationMap) => {
    onUpdateOperation(operation);
    props.history.push('/queries/build');
  };

  const onDeleteOperation = (operation: OperationMap) => {
    const operationID = operation.get('id') as string | undefined;
    if (operationID) {
      props.actions.deleteOperation(operationID, props.history);
    }
  };

  const onSaveOperation = (preview = false) => {
    props.actions.savingOperation();
    const steps = props.page.get('steps') as List<OperationStepMap>;
    const { activeOperation: operation } = props;
    if (!operation) {
      return;
    }
    const id = operation.get('id');
    const url = id ? `${api.routes.SINGLE_DATASET}${id}/` : api.routes.DATASETS;

    const data: Operation = { ...(operation.toJS() as Operation), operation_steps: steps.toJS() };
    if (props.token) {
      axios
        .request({
          url,
          method: id ? 'put' : 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${props.token}`,
          },
          data,
        })
        .then((response: AxiosResponse<Operation>) => {
          if (response.status === 200 || response.status === 201) {
            props.actions.operationSaved(true);
            if (preview) {
              props.history.push(`/queries/data/${response.data.id}/`);
            } else {
              props.history.push('/');
            }
          }
        })
        .catch(() => {
          props.actions.operationSaved(false);
        });
    }
  };

  const onPreviewOperation = () => {
    setLoadingPreview(true);
    const steps = props.page.get('steps') as List<OperationStepMap>;
    const { activeOperation: operation } = props;
    if (!operation) {
      return;
    }

    const url = `${api.routes.PREVIEW_SINGLE_DATASET}`;

    const data: Operation = { ...(operation.toJS() as Operation), operation_steps: steps.toJS() };
    if (props.token) {
      axios
        .request({
          url,
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${props.token}`,
          },
          data,
        })
        .then((response: AxiosResponse) => {
          setPreviewData(fromJS(response.data.results));
          setPreviewShow(true);
          setLoadingPreview(false);
        })
        .catch(() => {
          setPreviewData(List());
          setPreviewShow(true); // FIXME: why would preview still show when there's been an error?
          setLoadingPreview(false);
        });
    }
  };

  const onDeleteOperationStep = (step: OperationStepMap) => {
    props.actions.updateActiveStep(undefined);
    props.actions.deleteOperationStep(step);
  };

  const { activeSource, page } = props;
  const activeStep = page.get('activeStep') as OperationStepMap | undefined;

  return (
    <Row>
      <Col md={12} lg={4}>
        <Tab.Container defaultActiveKey="operation">
          <Card className="source-details">
            <Card.Header className="card-header-text card-header-danger">
              <Card.Text>Dataset</Card.Text>
            </Card.Header>
            <StyledCardBody>{renderOperationForm()}</StyledCardBody>
          </Card>
        </Tab.Container>
      </Col>

      <Col md={12} lg={8}>
        {renderStepFormOrDatasetPreview(activeStep, activeSource, page)}
      </Col>
    </Row>
  );
};

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
