import classNames from 'classnames';
import { fromJS, List } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, ListGroup, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { useSources } from '../../hooks';
import { QueryBuilderAction } from '../../pages/QueryBuilder/reducers';
import { OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { sortObjectArrayByProperty, sortSteps } from '../../utils';
import OperationStep from '../OperationStepView';
import { OperationStepsOrder } from '../OperationStepsOrder';

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
`;
export const StyledStepContainer = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
`;

const OperationSteps: FunctionComponent<OperationStepsProps> = (props) => {
  const { activeSource, activeStep, editable, steps } = props;
  const [isOrderingSteps, setIsOrderingSteps] = useState(false);
  const [createdSteps, setCreatedSteps] = useState<Step[]>([]);
  const sources = useSources({ limit: 200, offset: 0 });

  useEffect(() => {
    setCreatedSteps(
      steps.toArray().map((step) => ({
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
        .sort(sortObjectArrayByProperty('text').sort);
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
    props.onAddStep(fromJS({ step_id: props.steps.count() + 1 }));
  };

  const onClickStep = (step: OperationStepMap) => () => {
    props.onClickStep(step);
  };

  const handleStepOrderClick = () => {
    setIsOrderingSteps(!isOrderingSteps);
  };

  const onUpdateSteps = (orderedSteps: string) => {
    const orderedStepsArray: string[] = JSON.parse(orderedSteps);
    setCreatedSteps(() => {
      const result: Step[] = [];
      const unorderedStepsArray = steps.valueSeq().toArray();

      orderedStepsArray.forEach((orderedStep, orderedIndex) => {
        unorderedStepsArray.forEach((unorderedStep) => {
          if (unorderedStep.get('step_id') === orderedStep) {
            const updatedStep = unorderedStep.update('step_id', () => orderedIndex + 1);
            props.onReorderSteps(updatedStep);
            result.push({
              step_id: unorderedStep.get('step_id') as string,
              name: unorderedStep.get('name') as string,
              query_func: unorderedStep.get('query_func') as string,
            });
          }
        });
      });

      return orderedStepsArray.length > 0 ? result : createdSteps;
    });
  };

  return (
    <React.Fragment>
      <div className="mb-3">
        <label>Active Data Source</label>
        <Dropdown
          placeholder="Select Data Source"
          fluid
          selection
          search
          options={getSelectOptionsFromSources(sources)}
          loading={sources.count() === 0}
          onChange={onSelectSource}
          value={activeSource ? (activeSource.get('id') as string) : undefined}
          disabled={!editable || props.disabled}
          data-testid="active-data-source"
        />
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
          variant="danger"
          size="sm"
          onClick={handleStepOrderClick}
          disabled={!!activeStep || props.disabled}
          data-testid="qb-add-step-button"
        >
          {!isOrderingSteps ? (
            <i className="material-icons mr-1">reorder</i>
          ) : (
            <i className="material-icons mr-1">view_list</i>
          )}
          {!isOrderingSteps ? 'Order Steps' : 'View Steps'}
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
