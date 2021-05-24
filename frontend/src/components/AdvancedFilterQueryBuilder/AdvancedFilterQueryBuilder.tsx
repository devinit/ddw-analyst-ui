import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { SourceMap } from '../../types/sources';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { AdvancedQueryContext, jsonMode } from '../QuerySentenceBuilder';
import { validateFilter } from './utils';
import { handleAnd } from './utils/actions';

interface ComponentProps {
  source: SourceMap;
}
const defaultOptions = {
  $and: [
    { column: 'donor_name', comp: '$eq', value: 'United States' },
    { column: 'agency_name', comp: '$eq', value: 'Department of Agriculture' },
    {
      $or: [
        { column: 'agency_name', comp: '$eq', value: 'Department of Agriculture' },
        { column: 'agency_name', comp: '$eq', value: 'Miscellaneous' },
      ],
    },
  ],
};

const AdvancedFilterQueryBuilder: FunctionComponent<ComponentProps> = () => {
  const { options, editor } = useContext(AdvancedQueryContext);
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState<Record<string, unknown>>({});
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  }, []);

  const onInsertAnd = () => {
    if (editor) {
      const validationResponse = validateFilter({ action: '$and', options, editor });
      handleAnd(validationResponse);
      setEditorContent(defaultOptions);
      setShowEditor(true);
    }
  };

  return (
    <div className="mb-3">
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
        <Button variant="danger" size="sm" className="d-one">
          Insert OR
        </Button>
      </ButtonGroup>
      {showEditor ? (
        <CodeMirrorReact
          config={{
            mode: jsonMode,
            value: JSON.stringify(editorContent, null, 2),
            lineNumbers: true,
            theme: 'material',
          }}
        />
      ) : null}
    </div>
  );
};

export { AdvancedFilterQueryBuilder };
