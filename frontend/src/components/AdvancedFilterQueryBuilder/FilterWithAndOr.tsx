/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Map } from 'immutable';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup } from 'react-bootstrap';
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
import { isEditorContentEmpty, validateFilter } from './utils';
import { operations } from './utils/actions';

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
export type EditorContent = Partial<
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
  const [errors, setErrors] = useState<string[]>([]);

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

  const onUpdate = (updateAction: 'replace' | 'insert') => {
    if (filterWith && editor) {
      if (!isEditorContentEmpty(editorContent)) {
        const validationErrors = validateFilter(editorContent, columns);
        if (validationErrors.length) {
          setErrors(validationErrors);

          return;
        }
        // clear any existing errors
        if (errors.length) setErrors([]);

        options.filter = editorContent;
        if (updateAction === 'replace' && updateOptions) {
          updateOptions(options as AdvancedQueryOptions);
        }
        if (updateAction === 'insert') {
          editor.replaceSelection(JSON.stringify(editorContent, null, 2));
        }
      } else {
        setErrors(['Please add at least one condition to filter']);
      }
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
    try {
      const parsedValue = JSON.parse(value);
      setEditorContent(parsedValue);
      setErrors([]);
    } catch (e) {
      setErrors([...errors, e.message]);
    }
  };

  const onUpdateFilter = (filter: ErroredFilterMap) => setActiveFilter(filter);

  const onReset = () => setEditorContent(defaultOptions(filterWith!));

  const onAddFilter = (filter: ErroredFilterMap) => {
    if (filter.size === 3 && filterWith && editorContent[filterWith]) {
      setEditorContent({
        ...editorContent,
        [filterWith]: editorContent[filterWith]?.concat({
          column: filter.get('field') as string,
          comp: filter.get('func') as FilterComp,
          value: filter.get('value') as string,
        }),
      });
      setActiveFilter(filter.delete('value'));
    }
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
        <Alert variant="danger" hidden={!errors.length}>
          <ul className="ui list">
            {errors.map((error, i) => (
              <div key={i} className="item">
                {error}
              </div>
            ))}
          </ul>
        </Alert>
        <CodeMirrorReact
          className="mt-2"
          config={{
            mode: jsonMode,
            value: JSON.stringify(editorContent, null, 2),
            lineNumbers: true,
            theme: 'material',
          }}
          onChange={onChange}
          validateWith="jshint"
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
            onClick={() => onUpdate('replace')}
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
            onClick={() => onUpdate('insert')}
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
