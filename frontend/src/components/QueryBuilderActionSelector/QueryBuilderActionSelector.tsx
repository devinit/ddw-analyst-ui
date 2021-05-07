import React, { FunctionComponent } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../types/operations';
import { actions } from './utils';

interface ComponentProps {
  onSelectAction?: (action: AdvancedQueryBuilderAction) => void;
  config?: AdvancedQueryOptions;
  defaultAction?: AdvancedQueryBuilderAction;
}
type SelectEvent = React.SyntheticEvent<HTMLElement, Event>;

const QueryBuilderActionSelector: FunctionComponent<ComponentProps> = () => {
  const onSelectAction = (_event: SelectEvent, data: DropdownProps) => {
    console.log(data);
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
        options={actions}
        loading={false}
        onChange={onSelectAction}
        data-testid="a-qb-action-selector"
      />
    </div>
  );
};

export { QueryBuilderActionSelector };
