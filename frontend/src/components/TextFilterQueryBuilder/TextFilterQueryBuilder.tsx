import { List, Set } from 'immutable';
import React, { FunctionComponent } from 'react';
import { OperationStepMap } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getStepSelectableColumns } from '../../utils';
import { BasicTextarea } from '../BasicTextarea';
import { parseTextFilterString } from '../QueryBuilderHandler/utils';

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
  const textareaLabel = 'Fill in your query below:';
  const columns = source.get('columns') as ColumnList;
  const selectableColumns = getStepSelectableColumns(step, steps, columns) as Set<string>;

  const onTextareaChange = (options: string) => {
    const queryObject = parseTextFilterString(options, selectableColumns);
    console.log(`onTextareaChange: ${JSON.stringify(queryObject['filterJSON'])}`);
    onUpdateTextarea(JSON.stringify(queryObject));
  };

  return (
    <>
      <BasicTextarea label={textareaLabel} onChange={onTextareaChange} alerts={alerts} />
    </>
  );
};
