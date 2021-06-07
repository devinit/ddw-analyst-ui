import React, { FunctionComponent, useEffect, useState } from 'react';
import { format } from 'sql-formatter';
import { OperationMap } from '../../types/operations';
import { useOperationQuery } from '../../utils/hooks';
import { CodeMirrorReact } from '../CodeMirrorReact';

interface QuerySentenceProps {
  operation: OperationMap;
}

const QuerySentence: FunctionComponent<QuerySentenceProps> = ({ operation }) => {
  const { loading, query } = useOperationQuery(operation);
  const [sentence, setSentence] = useState('');
  useEffect(() => {
    if (!loading && query) {
      setSentence(format(query));
    }
  }, [loading, query]);

  return (
    <div className="mt-2">
      <CodeMirrorReact
        config={{
          mode: 'text',
          value: sentence,
          // lineNumbers: true,
          // theme: 'material',
          readOnly: true,
        }}
      />
    </div>
  );
};

export { QuerySentence };
