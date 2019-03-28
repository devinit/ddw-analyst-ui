import classNames from 'classnames';
import { List, fromJS } from 'immutable';
import * as React from 'react';
import { Button, ListGroup, Row } from 'react-bootstrap';
import { Action } from 'redux';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { QueryBuilderAction } from '../../pages/QueryBuilder/reducers';
import { OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import OperationStep from '../OperationStepView';

interface OperationStepsProps {
  sources: List<SourceMap>;
  isFetchingSources: boolean;
  steps: List<OperationStepMap>;
  activeSource?: SourceMap;
  activeStep?: OperationStepMap;
  fetchSources: () => Action;
  onSelectSource: (source: SourceMap) => Partial<QueryBuilderAction>;
  onAddStep: (step?: OperationStepMap) => Partial<QueryBuilderAction>;
  onClickStep: (step?: OperationStepMap) => void;
}

const StyledListItem = styled(ListGroup.Item)`
  border-bottom: 1px solid rgba(0,0,0,.125);
  cursor: ${props => props.disabled ? 'default' : 'pointer' };
`;

class OperationSteps extends React.Component<OperationStepsProps> {
  render() {
    const { activeSource, activeStep, isFetchingSources, sources, steps } = this.props;

    return (
      <React.Fragment>
        <div className="mb-3">
          <label>Active Data Set</label>
          <Dropdown
            placeholder="Select Data Set"
            fluid
            selection
            search
            options={ this.getSelectOptionsFromSources(sources) }
            loading={ isFetchingSources }
            onClick={ this.fetchSources }
            onChange={ this.onSelectSource }
            defaultValue={ activeSource ? activeSource.get('id') as string : undefined }
          />
        </div>

        <div className={ classNames('mb-3', { 'd-none': !activeSource }) }>
          <Button
            variant="danger"
            size="sm"
            onClick={ this.onAddStep }
            disabled={ !!activeStep }
          >
            <i className="material-icons mr-1">add</i>
            Add Operation
          </Button>
        </div>

        { this.renderOperationSteps(steps, activeStep) }
      </React.Fragment>
    );
  }

  private renderOperationSteps(steps: List<OperationStepMap>, activeStep?: OperationStepMap) {
    if (steps.count()) {
      return (
        <Row>
          <ListGroup variant="flush" className="w-100">
            {
              steps.map((step, index) => {
                const isActiveStep = activeStep && activeStep.get('step_id') === step.get('step_id');

                return (
                  <StyledListItem
                    className="py-2"
                    key={ index }
                    onClick={ !activeStep && this.onClickStep(step) }
                    disabled={ activeStep && !isActiveStep }
                    variant={ isActiveStep ? 'danger' : undefined }
                  >
                    <OperationStep step={ step }/>
                  </StyledListItem>
                );
              })
            }
          </ListGroup>
        </Row>
      );
    }

    return null;
  }

  private getSelectOptionsFromSources(sources: List<SourceMap>): DropdownItemProps[] {
    if (sources.count()) {
      return sources.map(source => ({
        key: source.get('id'),
        text: source.get('indicator'),
        value: source.get('id')
      })).toJS();
    }

    return [];
  }

  private fetchSources = () => {
    if (!this.props.sources.count() && !this.props.isFetchingSources) {
      this.props.fetchSources();
    }
  }

  private onSelectSource = (_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const selectedSource = this.props.sources.find(source => source.get('id') === data.value);
    if (selectedSource) {
      this.props.onSelectSource(selectedSource);
    }
  }

  private onAddStep = () => {
    this.props.onAddStep(fromJS({ step_id: this.props.steps.count() + 1 }));
  }

  private onClickStep = (step: OperationStepMap) => () => {
    this.props.onClickStep(step);
  }
}

export default OperationSteps;
