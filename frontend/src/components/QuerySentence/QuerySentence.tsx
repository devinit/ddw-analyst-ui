import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { format } from 'sql-formatter';
import styled from 'styled-components';
import { OperationMap } from '../../types/operations';
import { useOperationQuery } from '../../utils/hooks';
import { CodeMirrorNext } from '../CodeMirrorNext';

interface QuerySentenceProps {
  operation: OperationMap;
}

const StyledDiv = styled.div`
  position: relative;
  min-height: 300px;
`;

const QuerySentence: FunctionComponent<QuerySentenceProps> = ({ operation }) => {
  const { loading, query, error } = useOperationQuery(operation);
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
      return <CodeMirrorNext value={sentence} readOnly />;
    }

    return (
      <Dimmer inverted active>
        <Loader content="waiting for a valid config" />
      </Dimmer>
    );
  };

  return (
    <div className="mt-2">
      <Alert show={!!error} variant="warning">
        {error}
      </Alert>
      <StyledDiv>{renderContent()}</StyledDiv>
    </div>
  );
};

export { QuerySentence };
