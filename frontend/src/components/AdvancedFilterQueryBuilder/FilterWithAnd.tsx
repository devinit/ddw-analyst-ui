import React, { FunctionComponent, useContext, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';
import { validateFilter } from './utils';
import { handleAnd } from './utils/actions';

interface ComponentProps {
  show?: boolean;
}
const defaultOptions = {
  $and: [],
};

const FilterWithAnd: FunctionComponent<ComponentProps> = ({ show }) => {
  const { options, editor } = useContext(AdvancedQueryContext);
  const [showEditor, setShowEditor] = useState(true);
  const [editorContent, setEditorContent] = useState<Record<string, unknown>>(defaultOptions);
  const onInsertAnd = () => {
    if (editor) {
      const validationResponse = validateFilter({ action: '$and', options, editor });
      handleAnd(validationResponse);
      setEditorContent(defaultOptions);
      setShowEditor(true);
    }
  };

  if (show) {
    return (
      <>
        {showEditor ? (
          <CodeMirrorReact
            className="mt-2"
            config={{
              mode: jsonMode,
              value: JSON.stringify(editorContent, null, 2),
              lineNumbers: true,
              theme: 'material',
            }}
          />
        ) : null}
        <ButtonGroup className="mr-2">
          <Button
            variant="danger"
            size="sm"
            data-toggle="tooltip"
            data-placement="top"
            data-html="true"
            title={`<i>Inserts</i> config for creating an <strong>AND</strong> filter.</br><strong>NB:</strong> if a filter property already exists, this will be inserted in the current cursor position`}
            onClick={onInsertAnd}
          >
            Insert AND
          </Button>
        </ButtonGroup>
      </>
    );
  }

  return null;
};

FilterWithAnd.defaultProps = { show: false };

export { FilterWithAnd };
