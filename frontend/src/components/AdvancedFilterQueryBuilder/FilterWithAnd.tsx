import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import {
  AdvancedQueryFilter,
  AdvancedQueryFilterComparator,
  AdvancedQueryOptions,
} from '../../types/operations';
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
  const { options, editor, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [showEditor, setShowEditor] = useState(true);
  const [editorContent, setEditorContent] = useState<EditorContent>(defaultOptions);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  });

  useEffect(() => {
    if (options.filter && options.filter.$and) {
      setCanEdit(true);
    }
  }, []);

  const onReplace = () => {
    if (editor && updateOptions) {
      validateFilter({ action: '$and', options, editor }); // TODO: actually validate filter before action
      options.filter = editorContent;
      updateOptions(options as AdvancedQueryOptions);
    }
    setIsEditingExisting(false);
  };

  const onInsert = () => {
    if (editor) {
      const validationResponse = validateFilter({ action: '$and', options, editor });
      handleAnd(validationResponse);
      setEditorContent(defaultOptions);
      setShowEditor(true);
    }
    setIsEditingExisting(false);
  };

  const onEditExisting = () => {
    if (options.filter && options.filter.$and) {
      setEditorContent({ $and: options.filter.$and });
      setIsEditingExisting(true);
    }
  };

  const onChange = (value: string) => {
    const parsedValue = JSON.parse(value);
    setEditorContent(parsedValue);
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
            onChange={onChange}
          />
        ) : null}
        <ButtonGroup className="mr-2">
          {canEdit ? (
            <Button
              variant={isEditingExisting ? 'dark' : 'danger'}
              size="sm"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title={`<i>Edits</i> existing $and config in the filter property`}
              onClick={onEditExisting}
            >
              Edit Existing
            </Button>
          ) : null}
          <Button
            variant="danger"
            size="sm"
            data-toggle="tooltip"
            data-placement="bottom"
            data-html="true"
            title={`<i>Replaces</i> existing filter config`}
            onClick={onReplace}
          >
            Replace
          </Button>
          <Button
            variant="danger"
            size="sm"
            data-toggle="tooltip"
            data-placement="bottom"
            data-html="true"
            title={`<i>Inserts</i> config to current cursor position on the main editor. </br> <strong>NB:</strong> valid JSON will auto-format`}
            onClick={onInsert}
          >
            Insert
          </Button>
        </ButtonGroup>
      </>
    );
  }

  return null;
};

FilterWithAnd.defaultProps = { show: false };

export { FilterWithAnd };
