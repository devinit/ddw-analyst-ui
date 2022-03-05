import { PostgreSQL, sql } from '@codemirror/lang-sql';
import React, { FC } from 'react';
import { OperationMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { CodeMirrorNext } from '../CodeMirrorNext';

interface ComponentProps {
  source?: SourceMap;
  operation?: OperationMap;
  onUpdateOperation: (operation: OperationMap) => void;
}

const SQLEditor: FC<ComponentProps> = ({ source }) => {
  console.log(source?.toJS());

  return <CodeMirrorNext extensions={[sql({ dialect: PostgreSQL, upperCaseKeywords: true })]} />;
};

export { SQLEditor };
