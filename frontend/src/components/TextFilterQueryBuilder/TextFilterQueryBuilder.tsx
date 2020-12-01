import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ChangeEvent } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import styled from 'styled-components';
import { FormControlElement } from '../../types/bootstrap';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns } from '../../utils';
import { BasicModal } from '../BasicModal';
import { getTextFilterString, parseTextFilterString } from './utils';
import { TextFilterColumnRows } from './TextFilterColumnRows';

interface TextFilterQueryBuilder {
  alerts: { [key: string]: string } | undefined;
  source: SourceMap;
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdateTextarea: (textFilters: string) => void;
}

const StyledIcon = styled.i`
  font-size: 18px;
`;

export const TextFilterQueryBuilder: FunctionComponent<TextFilterQueryBuilder> = ({
  alerts,
  onUpdateTextarea,
  source,
  step,
  steps,
}) => {
  const [defaultValue, setDefaultValue] = useState('');
  const [info, setInfo] = useState('');
  const onModalHide = () => setInfo('');
  const columns = source.get('columns') as ColumnList;
  const selectableColumns = getStepSelectableColumns(step, steps, columns) as Set<string>;
  useEffect(() => {
    const options = step.get('query_kwargs') as string;
    const { filters } = options ? JSON.parse(options) : { filters: [] };
    setDefaultValue(getTextFilterString('normal', filters ? filters : [], ''));
  });

  const onTextareaChange = (event: ChangeEvent<FormControlElement>) => {
    const queryObject = parseTextFilterString(event.currentTarget.value, selectableColumns);
    onUpdateTextarea(JSON.stringify(queryObject));
  };

  const onClickInfo = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setInfo('show');
  };

  return (
    <>
      <BasicModal show={!!info} onHide={onModalHide} className="query-modal">
        <Table responsive className="overflow-visible">
          <thead>
            <tr>
              <th>Column Name</th>
              <th>-</th>
            </tr>
          </thead>

          <tbody>
            {selectableColumns.map((column, index) => (
              <TextFilterColumnRows column={column} key={index} />
            ))}
          </tbody>
        </Table>
      </BasicModal>
      <Form.Group>
        <Form.Label className="bmd-label-floating">{'Fill in your query below:'}</Form.Label>
        <Form.Control
          name="description"
          as="textarea"
          onChange={onTextareaChange}
          defaultValue={defaultValue}
        />
        <Form.Control.Feedback type="invalid" className="d-block invalid-feedback">
          {alerts && alerts.error}
        </Form.Control.Feedback>
      </Form.Group>
      <Button variant="outline-secondary" size="sm" onClick={onClickInfo}>
        <StyledIcon className="material-icons mr-1" data-testid="step-info-trigger">
          info
        </StyledIcon>
        Copy columns
      </Button>
    </>
  );
};
