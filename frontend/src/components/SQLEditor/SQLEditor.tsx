import { PostgreSQL, sql } from '@codemirror/lang-sql';
import React, { FC } from 'react';
import { CodeMirrorNext } from '../CodeMirrorNext';

const SQLEditor: FC = () => {
  return <CodeMirrorNext extensions={[sql({ dialect: PostgreSQL })]} />;
};

export { SQLEditor };
