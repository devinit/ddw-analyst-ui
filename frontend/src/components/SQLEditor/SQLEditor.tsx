import { PostgreSQL, sql } from '@codemirror/lang-sql';
import React, { FC, useEffect, useState } from 'react';
import { OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { CodeMirrorNext } from '../CodeMirrorNext';

interface ComponentProps {
  source?: SourceMap;
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
}

const SQLEditor: FC<ComponentProps> = ({ source }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (source) {
      setValue(`SELECT * FROM "${source.get('schema')}"."${source.get('active_mirror_name')}";`);
    }
  }, [source]);

  return (
    <CodeMirrorNext
      value={value}
      extensions={[sql({ dialect: PostgreSQL, upperCaseKeywords: true })]}
    />
  );
};

export { SQLEditor };
