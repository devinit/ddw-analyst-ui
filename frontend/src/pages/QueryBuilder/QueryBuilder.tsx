import axios, { AxiosResponse } from 'axios';
import classNames from 'classnames';
import { fromJS, List, Map } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { deleteOperation, fetchOperation, setOperation } from '../../actions/operations';
import * as sourcesActions from '../../actions/sources';
import { OperationPreview } from '../../components/OperationPreview';
import { OperationStepForm } from '../../components/OperationStepForm';
import OperationSteps from '../../components/OperationSteps';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { TokenState } from '../../reducers/token';
import { UserState } from '../../reducers/user';
import { ReduxStore } from '../../store';
import {
  AliasCreationStatus,
  Operation,
  OperationData,
  OperationDataMap,
  OperationMap,
  OperationStep,
  OperationStepMap,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { api, getSourceIDFromOperation } from '../../utils';
import { useSourceFromOperation } from '../../utils/hooks';
import { fetchOperationDataPreview } from '../../utils/hooks/operations';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { queryBuilderReducerId, QueryBuilderState } from './reducers';

interface ActionProps {
  actions: typeof sourcesActions &
    typeof pageActions & {
      fetchOperation: typeof fetchOperation;
      setActiveOperation: typeof setOperation;
      deleteOperation: typeof deleteOperation;
    };
}
interface ReduxState {
  source?: SourceMap;
  operations: List<OperationMap>;
  activeOperation?: OperationMap;
  token: TokenState;
  page: QueryBuilderState;
  user: UserState;
}
interface RouterParams {
  id?: string;
}

type QueryBuilderProps = ActionProps & ReduxState & RouteComponentProps<RouterParams>;

const OBSOLETE_COLUMNS_LOG_MESSAGE = 'Obsolete Columns'; // eslint-disable-line @typescript-eslint/naming-convention

const QueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<OperationData[]>([]);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);
  const [activeSource, setActiveSource] = useState<SourceMap | undefined>();
  const { source: operationSource } = useSourceFromOperation(props.activeOperation);

  useEffect(() => {
    if (operationSource) {
      setActiveSource(operationSource);
    }
  }, [operationSource]);

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
  useEffect(() => {
    if (props.activeOperation) {
      handleOperationLogs(props.activeOperation);
    }
  }, [props.activeOperation]);

  const updatePreviewState = (data: OperationData[], show: boolean, loading: boolean): void => {
    setPreviewData(data);
    setShowPreview(show);
    setLoadingPreview(loading);
  };

  const isEditable = (operation?: OperationMap) => {
    const user = props.user.get('username') as string;
    const isSuperUser = props.user.get('is_superuser') as boolean;

    return !operation || !operation.get('id') || user === operation.get('user') || isSuperUser;
  };

  const handleOperationLogs = (operation: OperationMap) => {
    const logs = operation.get('logs') as Map<string, string | number | []> | null;
    const aliasCreationStatus = operation.get(
      'alias_creation_status',
    ) as AliasCreationStatus | null;
    const aliases = operation.get('aliases') as Map<string, Map<string, string | number>>;

    if (logs?.get('type') || logs?.get('message')) {
      if (logs.get('message') === OBSOLETE_COLUMNS_LOG_MESSAGE) {
        const columnAliases = aliases.size
          ? aliases.map((alias) => alias.get('column_alias'))
          : (logs.get('columns') as string[]);
        const steps = logs.get('steps') as number[];
        setAlertMessages([
          `Columns ${columnAliases.join(', ')} used in steps ${steps.join(', ')} are obsolete.`,
          'NB: This warning will be cleared on save',
        ]);
      }
    } else if (aliasCreationStatus && aliasCreationStatus.toLowerCase() !== 'd') {
      setAlertMessages([
        'There was interruption while creating column aliases for this dataset. Please save the dataset again',
      ]);
    }
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
    if (showPreview) {
      setShowPreview(false);
    }
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

  const onReorderSteps = (step: OperationStepMap) => {
    props.actions.editOperationStep(step);
  };

  const onDeleteOperation = (operation: OperationMap) => {
    const operationID = operation.get('id') as string | undefined;
    if (operationID) {
      props.actions.deleteOperation(operationID, props.history);
    } else {
      props.actions.setActiveOperation();
    }
  };

  const resetOperationLogs = (
    operation: OperationMap,
    steps: List<OperationStepMap>,
  ): [OperationMap, List<OperationStepMap>] => {
    const updatedOperation = operation.set('logs', {});
    const updatedSteps = steps.map((step) => step.set('logs', {}));

    return [updatedOperation, updatedSteps];
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
    const [updatedOperation, updatedSteps] = resetOperationLogs(operation, steps);

    const data: Operation = {
      ...(updatedOperation.toJS() as unknown as Operation),
      operation_steps: updatedSteps.toJS() as unknown as List<OperationStepMap>,
    };
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
        .catch((error) => {
          props.actions.operationSaved(false);
          if (error.response.data.error_code === 'e') {
            setAlertMessages([
              'An error occured while creating column aliases for this dataset. Please contact your administrator',
            ]);

            return;
          }
          setAlertMessages(['An unknown error occured - please contact your administrator']);
        });
    }
  };

  const onClickStep = (step: OperationStepMap) => {
    if (loadingPreview) setLoadingPreview(false);
    if (showPreview) setShowPreview(false);
    props.actions.updateActiveStep(step, true);
  };

  const onTogglePreview = () => {
    if (showPreview) {
      updatePreviewState([], false, false);

      return;
    }

    setLoadingPreview(true);
    const steps = props.page.get('steps') as List<OperationStepMap>;
    const { activeOperation: operation } = props;
    if (!operation) return;

    fetchOperationDataPreview(
      operation.toJS() as unknown as Operation,
      steps.toJS() as unknown as OperationStep[],
    ).then((results) => {
      setLoadingPreview(false);
      if (results.error) {
        setAlertMessages([`Error: ${results.error}`]);
      } else {
        updatePreviewState(results.data || [], true, false);
      }
    });
  };

  const onDeleteOperationStep = (step: OperationStepMap) => {
    props.actions.updateActiveStep(undefined);
    props.actions.deleteOperationStep(step);
  };

  const onDuplicateStep = (step: OperationStepMap) => {
    const steps = props.page.get('steps') as List<OperationStepMap>;
    if (step) {
      const duplicateStep = step.withMutations((step) =>
        step
          .delete('id')
          .set('step_id', steps.count() + 1)
          .set('name', `Copy of ${step.get('name')}`),
      );
      props.actions.updateActiveStep(duplicateStep, false);
    }
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
          onClose={resetAction}
          editing={editing}
          editable={editable}
        />
      );
    }

    return null;
  };

  const renderOperationTab = () => {
    const { activeOperation: operation } = props;
    const { id } = props.match.params;

    if (id && !operation) {
      return 'Loading ...';
    }

    const steps = props.page.get('steps') as List<OperationStepMap>;
    const activeStep = props.page.get('activeStep') as OperationStepMap | undefined;
    const editable = isEditable(operation);

    return (
      <OperationTabContainer
        alertMessages={alertMessages}
        operation={operation}
        editable={editable}
        valid={steps.count() > 0}
        onUpdate={onUpdateOperation}
        onSave={onSaveOperation}
        onPreview={onTogglePreview}
        previewing={showPreview}
        processing={props.page.get('processing') as boolean}
        onDelete={onDeleteOperation}
        onReset={!id ? () => props.actions.setActiveOperation() : undefined}
      >
        <OperationSteps
          steps={steps}
          onSelectSource={(source) => setActiveSource(source)}
          onAddStep={props.actions.updateActiveStep}
          activeSource={activeSource}
          activeStep={activeStep}
          onClickStep={onClickStep}
          editable={editable}
          disabled={showPreview}
          onDuplicateStep={onDuplicateStep}
          onReorderSteps={onReorderSteps}
        />
      </OperationTabContainer>
    );
  };

  const { page } = props;
  const activeStep = page.get('activeStep') as OperationStepMap | undefined;

  return (
    <Row>
      <Col
        md={12}
        lg={9}
        className={classNames('ml-auto mr-auto', {
          'd-none': activeStep || showPreview || loadingPreview,
        })}
      >
        {renderOperationTab()}
      </Col>

      <Col
        md={12}
        lg={12}
        className={classNames({ 'd-none': !activeStep && !(showPreview || loadingPreview) })}
      >
        <OperationPreview
          show={showPreview}
          loading={loadingPreview}
          title="Create Query Step"
          onClose={resetAction}
          data={fromJS(previewData) as List<OperationDataMap>}
        >
          {renderOperationStepForm(activeSource, activeStep, page.get('editingStep') as boolean)}
        </OperationPreview>
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
    operations: reduxStore.getIn(['operations', 'operations']) as List<OperationMap>,
    activeOperation: reduxStore.getIn(['operations', 'activeOperation']) as OperationMap,
    page: reduxStore.get(`${queryBuilderReducerId}`),
    user: reduxStore.get('user') as UserState,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryBuilder);

export { connector as default };
