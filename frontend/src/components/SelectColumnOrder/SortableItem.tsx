import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { FunctionComponent } from 'react';
import StyledItem from './StyledItem';

interface SelectColumnProps {
  id: string;
  count?: number;
}

const SortableItem: FunctionComponent<SelectColumnProps> = ({ count, id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition?.toString(),
  };

  return (
    <StyledItem
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-testid="qb-select-column-order"
    >
      {count ? `${count}. ${id}` : id}
    </StyledItem>
  );
};

export { SortableItem };
