import { List, Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns } from '../../utils';
import { BasicTextarea } from '../BasicTextarea';
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

  const onTextareaChange = (options: string) => {
    const columns = source.get('columns') as ColumnList;
    const selectableColumns = getStepSelectableColumns(step, steps, columns) as Set<string>;
    const queryObject = parseTextFilterString(options, selectableColumns);
    console.log(`onTextareaChange: ${JSON.stringify(queryObject['filterJSON'])}`);
    onUpdateTextarea(JSON.stringify(queryObject));
  };

  const textareaLabel = 'Fill in your query below:';

  return (
    <>
      <BasicTextarea
        label={textareaLabel}
        onChange={onTextareaChange}
        alerts={alerts}
        defaultValue={defaultValue}
      />
    </>
  );
};
