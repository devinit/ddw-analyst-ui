import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../types/operations';
import { ICheckData, IRadio } from '../IRadio';
import { actions } from './utils';

interface ComponentProps {
  onSelectAction?: (action: AdvancedQueryBuilderAction) => void;
  config?: AdvancedQueryOptions;
  defaultAction?: AdvancedQueryBuilderAction;
}

const QueryBuilderActionSelector: FunctionComponent<ComponentProps> = (props) => {
  const [selectedAction, setSelectedAction] = useState(props.defaultAction);

  useEffect(() => {
    if (props.onSelectAction && props.defaultAction) {
      props.onSelectAction(props.defaultAction);
    }
  }, []);

  const onSelectAction = (data: ICheckData) => {
    setSelectedAction(data.value as AdvancedQueryBuilderAction);
    if (props.onSelectAction) {
      props.onSelectAction(data.value as AdvancedQueryBuilderAction);
    }
  };

  return (
    <div className="mb-3">
      <label>Active Clause</label>
      <div>
        {actions.map((action) => (
          <IRadio
            key={action.name}
            variant="danger"
            id={action.name}
            name={action.name}
            label={action.caption}
            onChange={onSelectAction}
            inline
            checked={selectedAction === action.name}
          />
        ))}
      </div>
    </div>
  );
};

export { QueryBuilderActionSelector };
