import classNames from 'classnames';
import { fromJS, List } from 'immutable';
import React, { FunctionComponent, useEffect } from 'react';
import { Button, ListGroup, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { QueryBuilderAction } from '../../pages/QueryBuilder/reducers';
import { SourcesAction } from '../../reducers/sources';
import { FetchOptions } from '../../types/api';
import { OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { sortObjectArrayByProperty, sortSteps } from '../../utils';
import OperationStep from '../OperationStepView';

interface OperationStepsProps {
  sources: List<SourceMap>;
  editable?: boolean;
  isFetchingSources: boolean;
  steps: List<OperationStepMap>;
  activeSource?: SourceMap;
  activeStep?: OperationStepMap;
  disabled?: boolean;
  fetchSources: (options: FetchOptions) => Partial<SourcesAction>;
  onSelectSource: (source: SourceMap) => Partial<QueryBuilderAction>;
  onAddStep: (step?: OperationStepMap) => Partial<QueryBuilderAction>;
  onClickStep: (step?: OperationStepMap) => void;
}

const StyledListItem = styled(ListGroup.Item)`
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  border-color: ${(props) => (props.active ? '#737373 !important' : 'default')};
  background-color: ${(props) => (props.active ? '#EEEEEE' : '#FFFFFF')};
`;

const OperationSteps: FunctionComponent<OperationStepsProps> = (props) => {
  const { activeSource, activeStep, editable, isFetchingSources, sources, steps } = props;
  useEffect(() => {
    if (props.activeSource && props.sources && props.sources.count() === 0) {
      fetchSources();
    }
  });

  const renderOperationSteps = (steps: List<OperationStepMap>, activeStep?: OperationStepMap) => {
    if (steps.count()) {
      return (
        <Row>
          <ListGroup variant="flush" className="w-100">
            {steps.sort(sortSteps).map((step, index) => {
              const isActiveStep = activeStep && activeStep.get('step_id') === step.get('step_id');

              return (
                <StyledListItem
                  className="py-2"
                  key={index}
                  onClick={!activeStep && onClickStep(step)}
                  disabled={(activeStep && !isActiveStep) || props.disabled}
                  isActive={isActiveStep}
                >
                  <OperationStep step={step} />
                </StyledListItem>
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

  const fetchSources = () => {
    if (!props.isFetchingSources) {
      props.fetchSources({ limit: 100 });
    }
  };

  const onSelectSource = (
    _event: React.SyntheticEvent<HTMLElement, Event>, // eslint-disable-line @typescript-eslint/naming-convention
    data: DropdownProps,
  ) => {
    const selectedSource = props.sources.find((source) => source.get('id') === data.value);
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
          loading={isFetchingSources}
          onClick={fetchSources}
          onChange={onSelectSource}
          value={activeSource ? (activeSource.get('id') as string) : undefined}
          disabled={!editable || props.disabled}
        />
      </div>

      <div className={classNames('mb-3', { 'd-none': !activeSource })}>
        <Button
          variant="danger"
          size="sm"
          onClick={onAddStep}
          disabled={!!activeStep || props.disabled}
          hidden={!editable}
        >
          <i className="material-icons mr-1">add</i>
          Add Step
        </Button>
      </div>

      {renderOperationSteps(steps, activeStep)}
    </React.Fragment>
  );
};

OperationSteps.defaultProps = { editable: true, disabled: false };

export default OperationSteps;
