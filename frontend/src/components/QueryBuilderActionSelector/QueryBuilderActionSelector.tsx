import React, { FunctionComponent, useState } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../types/operations';
import { actions, getSelectOptionsFromActions, getSupportedActions } from './utils';

interface ComponentProps {
  onSelectAction?: (action: AdvancedQueryBuilderAction) => void;
  config?: AdvancedQueryOptions;
  defaultAction?: AdvancedQueryBuilderAction;
}
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const QueryBuilderActionSelector: FunctionComponent<ComponentProps> = (props) => {
  const [supportedActions, setSupportedActions] = useState(actions);
  const [selectedAction, setSelectedAction] = useState(props.defaultAction);
  const onSelectAction = (_event: SelectEvent, data: DropdownProps) => {
    setSelectedAction(data.value as AdvancedQueryBuilderAction);
    setSupportedActions(getSupportedActions(actions, data.value as AdvancedQueryBuilderAction));
    if (props.onSelectAction) {
      props.onSelectAction(data.value as AdvancedQueryBuilderAction);
    }
  };

  return (
    <div className="mb-3">
      <label>Action</label>
      <Dropdown
        className="col-lg-4"
        placeholder="Select Action"
        fluid
        selection
        search
        options={getSelectOptionsFromActions(actions, supportedActions)}
        loading={false}
        onChange={onSelectAction}
        value={selectedAction}
        data-testid="a-qb-action-selector"
        selectOnBlur={false}
      />
    </div>
  );
};

export { QueryBuilderActionSelector };
