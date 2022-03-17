import classNames from 'classnames';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { AdvancedQueryBuilderAction, AdvancedQueryOptions } from '../../types/operations';
import { ICheckData, IRadio } from '../IRadio';
import { actions } from './utils';

interface ComponentProps {
  onSelectAction?: (action?: AdvancedQueryBuilderAction) => void;
  config?: AdvancedQueryOptions;
  defaultAction?: AdvancedQueryBuilderAction;
  className?: string;
}

const QueryBuilderActionSelector: FunctionComponent<ComponentProps> = (props) => {
  const [selectedAction, setSelectedAction] = useState(props.defaultAction);

  useEffect(() => {
    if (props.onSelectAction && props.defaultAction) {
      props.onSelectAction(props.defaultAction);
    }
  }, []);

  const onSelectAction = (data: ICheckData) => {
    if (data.value !== 'hide') {
      setSelectedAction(data.value as AdvancedQueryBuilderAction);
      if (props.onSelectAction) props.onSelectAction(data.value as AdvancedQueryBuilderAction);
    } else {
      setSelectedAction(undefined);
      if (props.onSelectAction) props.onSelectAction();
    }
  };

  return (
    <div className={classNames(props.className)}>
      <label>Active Clause</label>
      <div>
        {actions
          .map((action) => (
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
          ))
          .concat([
            <IRadio
              key="hide"
              variant="danger"
              id="hide"
              name="hide"
              label="Hide Helpers"
              onChange={onSelectAction}
              inline
              checked={!selectedAction}
            />,
          ])}
      </div>
    </div>
  );
};

export { QueryBuilderActionSelector };
