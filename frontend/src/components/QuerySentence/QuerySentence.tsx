import React, { FunctionComponent, useEffect, useState } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import { format } from 'sql-formatter';
import styled from 'styled-components';
import { OperationMap } from '../../types/operations';
import { useOperationQuery } from '../../utils/hooks';
import { CodeMirrorReact } from '../CodeMirrorReact';

interface QuerySentenceProps {
  operation: OperationMap;
}

const StyledDiv = styled.div`
  position: relative;
  min-height: 300px;
`;

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
        <Dimmer inverted active>
          <Loader content="Loading" />
        </Dimmer>
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
      <Dimmer inverted active>
        <Loader content="waiting for a valid config" />
      </Dimmer>
    );
  };

  return <StyledDiv className="mt-2">{renderContent()}</StyledDiv>;
};

export { QuerySentence };
