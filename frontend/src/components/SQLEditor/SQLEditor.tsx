import { PostgreSQL, sql } from '@codemirror/lang-sql';
import React, { FC, useEffect, useState } from 'react';
import { format } from 'sql-formatter';
import { OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { getSourceIDFromOperation } from '../../utils';
import { CodeMirrorNext } from '../CodeMirrorNext';

interface ComponentProps {
  source?: SourceMap;
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
}

const SQLEditor: FC<ComponentProps> = ({ source, operation }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (source && !operation) {
      setValue(
        format(`SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`),
      );
    }
    if (operation && source) {
      const operationSource = getSourceIDFromOperation(operation);
      // check if the source has been changed
      if (operationSource !== source.get('id')) {
        setValue(
          format(`SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`),
        );
      } else {
        setValue(format(operation.get('operation_query') as string));
      }
    }
  }, [source, operation]);

  return (
    <CodeMirrorNext
      value={value}
      extensions={[sql({ dialect: PostgreSQL, upperCaseKeywords: true })]}
    />
  );
};

export { SQLEditor };
