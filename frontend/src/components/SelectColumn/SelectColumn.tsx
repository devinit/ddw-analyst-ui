import React, { FunctionComponent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SelectColumnProps {
  id: string;
}
export const SelectColumn: FunctionComponent<SelectColumnProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });
  const style = {
    borderStyle: 'solid',
    width: '400px',
    margin: '2px',
    cursor: 'grab',
    transform: CSS.Translate.toString(transform),
    transition: transition?.toString(),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.id}
    </div>
  );
};
