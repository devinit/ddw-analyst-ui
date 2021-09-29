import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
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

  const renderContent = () => {
    if (loading) {
      return (
        <Alert show variant="dark">
          Loading ...
        </Alert>
      );
    }

    if (sentence) {
      return (
        <CodeMirrorReact
          config={{
            mode: 'text',
            value: sentence,
            readOnly: true,
          }}
        />
      );
    }

    return (
      <Alert show variant="dark">
        Waiting for a valid config ...
      </Alert>
    );
  };

  return <div className="mt-2">{renderContent()}</div>;
};

export { QuerySentence };
