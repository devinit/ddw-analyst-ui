import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';
import { FormControlElement } from '../../types/bootstrap';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns } from '../../utils';
import { getTextFilterString, parseTextFilterString } from './utils';

interface TextFilterQueryBuilder {
  alerts: { [key: string]: string } | undefined;
  source: SourceMap;
  editable?: boolean;
  step: OperationStepMap;
  steps: List<OperationStepMap>;
  onUpdateTextarea: (textFilters: string) => void;
}

export const TextFilterQueryBuilder: FunctionComponent<TextFilterQueryBuilder> = ({
  alerts,
  onUpdateTextarea,
  source,
  step,
  steps,
}) => {
  const [defaultValue, setDefaultValue] = useState('');
  useEffect(() => {
    const options = step.get('query_kwargs') as string;
    const { filters } = options ? JSON.parse(options) : { filters: [] };
    setDefaultValue(getTextFilterString('normal', filters ? filters : [], ''));
  });

  const onTextareaChange = (event: ChangeEvent<FormControlElement>) => {
    const columns = source.get('columns') as ColumnList;
    const selectableColumns = getStepSelectableColumns(step, steps, columns) as Set<string>;
    const queryObject = parseTextFilterString(event.currentTarget.value, selectableColumns);
    onUpdateTextarea(JSON.stringify(queryObject));
  };

  return (
    <>
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
    </>
  );
};
