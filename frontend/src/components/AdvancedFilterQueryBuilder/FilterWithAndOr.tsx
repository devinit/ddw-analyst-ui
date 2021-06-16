/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Map } from 'immutable';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { DropdownItemProps } from 'semantic-ui-react';
import {
  AdvancedQueryFilter,
  AdvancedQueryFilterComparator,
  AdvancedQueryOptions,
  ErroredFilterMap,
  FilterComp,
} from '../../types/operations';
import { SourceMap } from '../../types/sources';
import { CodeMirrorReact } from '../CodeMirrorReact';
import { FilterItem } from '../FilterItem';
import { AdvancedQueryContext, jsonMode, QueryContextProps } from '../QuerySentenceBuilder';
import { FilterWith } from './AdvancedFilterQueryBuilder';
import { validateFilter, validate } from './utils';
import { handleAnd, operations } from './utils/actions';

interface ComponentProps {
  show?: boolean;
  filterWith?: FilterWith;
  source: SourceMap;
  columns: DropdownItemProps[];
}
const defaultOptions = (use: FilterWith): EditorContent => ({
  [use]: [],
});

type FilterComparator = (AdvancedQueryFilterComparator | AdvancedQueryFilter)[];
type EditorContent = Partial<
  {
    [key in FilterWith]: FilterComparator;
  }
>;

const FilterWithAndOr: FunctionComponent<ComponentProps> = ({ show, columns, filterWith }) => {
  const { options, editor, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [editorContent, setEditorContent] = useState<EditorContent>(defaultOptions(filterWith!));
  const [canEdit, setCanEdit] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [activeFilter, setActiveFilter] = useState(Map({}) as ErroredFilterMap);

  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
  });
  useEffect(() => {
    setEditorContent(defaultOptions(filterWith!));
    setCanEdit(!!(options.filter && options.filter[filterWith!]));
  }, [filterWith]);
  useEffect(() => {
    setCanEdit(!!(options.filter && options.filter[filterWith!]));
  }, [options]);

  const onReplace = () => {
    if (filterWith && editor && updateOptions) {
      validateFilter({ action: filterWith, options, editor }); // TODO: actually validate filter before action
      options.filter = editorContent;
      updateOptions(options as AdvancedQueryOptions);
    }
    setIsEditingExisting(false);
  };

  const onInsert = () => {
    if (editor && filterWith) {
      // const validationResponse = validateFilter({ action: filterWith, options, editor });
      // handleAnd(validationResponse);
      editor.replaceSelection(JSON.stringify(editorContent, null, 2));
      validate(editor);
    }
    setIsEditingExisting(false);
  };

  const onEditExisting = () => {
    if (filterWith && options.filter && options.filter[filterWith]) {
      setEditorContent({ [filterWith]: options.filter[filterWith] });
      setIsEditingExisting(true);
    }
  };

  const onChange = (value: string) => {
    const parsedValue = JSON.parse(value);
    setEditorContent(parsedValue);
  };

  const onUpdateFilter = (filter: ErroredFilterMap) => {
    setActiveFilter(filter);
  };

  const onReset = () => {
    setEditorContent(defaultOptions(filterWith!));
  };

  const onAddFilter = (filter: ErroredFilterMap) => {
    if (filterWith && editorContent[filterWith]) {
      setEditorContent({
        ...editorContent,
        [filterWith]: editorContent[filterWith]?.concat({
          column: filter.get('field') as string,
          comp: filter.get('func') as FilterComp,
          value: filter.get('value') as string,
        }),
      });
    }
    setActiveFilter(Map({}) as ErroredFilterMap);
  };

  if (show) {
    return (
      <>
        <FilterItem
          columns={columns}
          operations={operations}
          filter={activeFilter}
          onUpdate={onUpdateFilter}
          onAdd={onAddFilter}
        />
        <CodeMirrorReact
          className="mt-2"
          config={{
            // mode: jsonMode,
            value: JSON.stringify(editorContent, null, 2),
            lineNumbers: true,
            theme: 'material',
            mode: 'application/json',
            gutters: ['CodeMirror-lint-markers'],
          }}
          onChange={onChange}
        />
        <ButtonGroup className="mr-2">
          {canEdit ? (
            <Button
              variant={isEditingExisting ? 'dark' : 'danger'}
              size="sm"
              data-toggle="tooltip"
              data-placement="bottom"
              data-html="true"
              title={`<i>Edits</i> existing ${filterWith} config in the filter property`}
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
          <Button
            variant="dark"
            size="sm"
            data-toggle="tooltip"
            data-placement="bottom"
            data-html="true"
            title={`<i>Resets</i> config to default JSON`}
            onClick={onReset}
          >
            Reset
          </Button>
        </ButtonGroup>
      </>
    );
  }

  return null;
};

FilterWithAndOr.defaultProps = { show: false, filterWith: '$and' };

export { FilterWithAndOr };
