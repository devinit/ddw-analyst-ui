import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { fromJS } from 'immutable';
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

const SQLEditor: FC<ComponentProps> = ({ source, operation, onUpdateOperation }) => {
  const [value, setValue] = useState('');
  console.log(operation?.toJS());

  useEffect(() => {
    if (source && !operation) {
      setValue(
        format(`SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`),
      );
      onUpdateOperation(fromJS({ is_raw: true }) as OperationMap);
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
      if (!operation.get('is_raw')) {
        onUpdateOperation(operation.set('is_raw', true));
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
