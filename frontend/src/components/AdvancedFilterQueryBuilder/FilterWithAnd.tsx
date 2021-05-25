import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryFilterComparator, AdvancedQueryFilter } from '../../types/operations';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { AdvancedQueryContext, jsonMode, QueryContextProps } from '../QuerySentenceBuilder';
import { validateFilter } from './utils';
import { handleAnd } from './utils/actions';

interface ComponentProps {
  show?: boolean;
}
const defaultOptions = {
  $and: [],
};

type FilterComparator = (AdvancedQueryFilterComparator | AdvancedQueryFilter)[];
type EditorContent = {
  $and: FilterComparator;
};

const FilterWithAnd: FunctionComponent<ComponentProps> = ({ show }) => {
  const { options, editor } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [showEditor, setShowEditor] = useState(true);
  const [editorContent, setEditorContent] = useState<EditorContent>(defaultOptions);
  useEffect(() => {
    if (options.filter && options.filter.$and) {
      setEditorContent({ $and: options.filter.$and });
    }
  }, []);
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
