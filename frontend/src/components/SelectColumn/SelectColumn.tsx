import React, { FunctionComponent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';

interface SelectColumnProps {
  id: string;
}

const Column = styled.div`
  margin-top: 4px;
  margin-bottom: 4px;
  cursor: grab;
  word-wrap: break-word;
  line-height: 1em;
  white-space: normal;
  padding: 0.78571429em 2.1em 0.78571429em 1em;
  color: rgba(0, 0, 0, 0.87);
  border: 1px solid rgba(34, 36, 38, 0.15);
  border-radius: 0.28571429rem;
  min-height: 2.71428571em;
  max-width: 500px;
  min-width: 300px;
  width: fit-content;
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
