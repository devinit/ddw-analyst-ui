import classNames from 'classnames';
import { fromJS, List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ListGroup, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { QueryBuilderAction } from '../../pages/QueryBuilder/reducers';
import { OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { sortObjectArrayByProperty, sortSteps } from '../../utils';
import { useSources } from '../../utils/hooks';
import OperationStep from '../OperationStepView';
import { OperationStepsOrder } from '../OperationStepsOrder';
import { DataSourceSelectorToggle } from '../DataSourceSelector/DataSourceSelectorToggle';

interface OperationStepsProps {
  editable?: boolean;
  steps: List<OperationStepMap>;
  activeSource?: SourceMap;
  activeStep?: OperationStepMap;
  disabled?: boolean;
  onSelectSource: (source: SourceMap) => void;
  onAddStep: (step?: OperationStepMap) => Partial<QueryBuilderAction>;
  onClickStep: (step?: OperationStepMap) => void;
  onDuplicateStep: (step?: OperationStepMap) => void;
  onReorderSteps: (step?: OperationStepMap) => void;
}

export interface Step {
  name: string;
  query_func: string;
  step_id: string | number;
}

export const StyledListItem = styled(ListGroup.Item)`
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  border-color: ${(props) => (props.active ? '#737373 !important' : 'default')};
  background-color: ${(props) => (props.active ? '#EEEEEE' : '#FFFFFF')};
  user-select: none;
`;
export const StyledStepContainer = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
`;

const OperationSteps: FunctionComponent<OperationStepsProps> = (props) => {
  const { activeSource, activeStep, editable, steps } = props;
  const [isOrderingSteps, setIsOrderingSteps] = useState(false);
  const [createdSteps, setCreatedSteps] = useState<Step[]>([]);
  const sources = useSources({ limit: 200, offset: 0 });
  const [selectedDataSource, setSelectedDataSource] = useState<List<SourceMap>>(List());

  useEffect(() => {
    (window as any).$('[data-toggle="sort-tooltip"]').tooltip(); // eslint-disable-line
  }, []);

  useEffect(() => {
    setSelectedDataSource(sources.filter((item) => item.get('schema') === 'repo'));
  }, [sources]);

  useEffect(() => {
    setCreatedSteps(
      steps
        .sort(sortSteps)
        .toArray()
        .map((step) => ({
          step_id: step.get('step_id') as string,
          name: step.get('name') as string,
          query_func: step.get('query_func') as string,
        })),
    );
  }, [steps]);

  const renderOperationSteps = (steps: List<OperationStepMap>, activeStep?: OperationStepMap) => {
    if (steps.count()) {
      return (
        <Row>
          <ListGroup variant="flush" className="w-100">
            {steps.sort(sortSteps).map((step, index) => {
              const isActiveStep = activeStep && activeStep.get('step_id') === step.get('step_id');

              return (
                <StyledStepContainer key={index}>
                  <StyledListItem
                    data-testid="qb-step-wrapper"
                    className="py-2"
                    onClick={!activeStep && onClickStep(step)}
                    disabled={(activeStep && !isActiveStep) || props.disabled}
                    active={isActiveStep}
                  >
                    <OperationStep step={step} onDuplicateStep={props.onDuplicateStep} />
                  </StyledListItem>
                </StyledStepContainer>
              );
            })}
          </ListGroup>
        </Row>
      );
    }

    return null;
  };

  const getSelectOptionsFromSources = (sources: List<SourceMap>): DropdownItemProps[] => {
    if (sources.count()) {
      return sources
        .map((source) => ({
          key: source.get('id'),
          text: source.get('indicator'),
          value: source.get('id'),
        }))
        .toJS()
        .sort(sortObjectArrayByProperty('text').sort) as DropdownItemProps[];
    }

    return [];
  };

  const onSelectSource = (
    _event: React.SyntheticEvent<HTMLElement, Event>, // eslint-disable-line @typescript-eslint/naming-convention
    data: DropdownProps,
  ) => {
    const selectedSource = sources.find((source) => source.get('id') === data.value);
    if (selectedSource) {
      props.onSelectSource(selectedSource);
    }
  };

  const onAddStep = () => {
    props.onAddStep(fromJS({ step_id: props.steps.count() + 1 }) as OperationStepMap);
  };

  const onClickStep = (step: OperationStepMap) => () => {
    props.onClickStep(step);
  };

  const handleStepOrderClick = () => {
    setIsOrderingSteps(!isOrderingSteps);
  };

  const onUpdateSteps = (orderedSteps: string) => {
    if (isOrderingSteps) {
      const orderedStepsArray: string[] = JSON.parse(orderedSteps);
      const unorderedStepsArray = steps.valueSeq().toArray();
      orderedStepsArray.forEach((orderedStep, orderedIndex) => {
        unorderedStepsArray.forEach((unorderedStep) => {
          if (unorderedStep.get('step_id') === orderedStep) {
            const updatedStep = unorderedStep.update('step_id', () => orderedIndex + 1);
            props.onReorderSteps(updatedStep);
          }
        });
      });
    }
  };

  const onDatasourceToggle = (data: string) => {
    if (data === 'non-frozen') {
      setSelectedDataSource(sources.filter((item) => item.get('schema') === 'repo'));
    } else {
      setSelectedDataSource(sources.filter((item) => item.get('schema') !== 'repo'));
    }
  };

  return (
    <React.Fragment>
      <div className="row mb-3">
        <DataSourceSelectorToggle
          onSelect={onDatasourceToggle}
          defaultSource={
            activeSource
              ? activeSource.get('schema') === 'repo'
                ? 'non-frozen'
                : 'frozen'
              : 'non-frozen'
          }
          className={'col-lg-4'}
        />
        <div className={'col-lg-8'}>
          <label>Data Source</label>
          <Dropdown
            placeholder="Select Data Source"
            fluid
            selection
            search
            options={getSelectOptionsFromSources(selectedDataSource)}
            loading={selectedDataSource.count() === 0}
            onChange={onSelectSource}
            value={activeSource ? (activeSource.get('id') as string) : undefined}
            disabled={!editable || props.disabled}
            data-testid="active-data-source"
          />
        </div>
      </div>

      <div className={classNames('mb-3', { 'd-none': !activeSource })}>
        <Button
          variant="danger"
          size="sm"
          onClick={onAddStep}
          disabled={!!activeStep || props.disabled}
          data-testid="qb-add-step-button"
        >
          <i className="material-icons mr-1">add</i>
          Add Step
        </Button>
        <Button
          variant={isOrderingSteps ? 'dark' : 'danger'}
          size="sm"
          onClick={handleStepOrderClick}
          disabled={!!activeStep || props.disabled}
          data-testid="qb-order-step-button"
          hidden={steps.size <= 1}
          className="pl-2 pr-2"
          data-toggle="sort-tooltip"
          data-placement="right"
          title="Toggle Sort Steps"
        >
          <i className="material-icons">reorder</i>
        </Button>
      </div>

      {isOrderingSteps ? (
        <OperationStepsOrder
          createdSteps={createdSteps}
          onUpdateSteps={onUpdateSteps}
          steps={steps}
          activeStep={activeStep}
          onClickStep={props.onClickStep}
          onDuplicateStep={props.onDuplicateStep}
          disabled={props.disabled}
        />
      ) : (
        renderOperationSteps(steps, activeStep)
      )}
    </React.Fragment>
  );
};

OperationSteps.defaultProps = { editable: true, disabled: false };

export default OperationSteps;
