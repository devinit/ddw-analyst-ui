import React, { FunctionComponent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

interface SelectColumnProps {
  id: string;
}

const Column = styled.div`
  border-style: solid;
  width: 400px;
  margin: 2px;
  cursor: grab;
  padding: 5px;
  border-color: grey;
`;

const SelectColumn: FunctionComponent<SelectColumnProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition?.toString(),
  };

  return (
    <Column style={style} ref={setNodeRef} {...attributes} {...listeners}>
      {props.id}
    </Column>
  );
};

export { SelectColumn };
