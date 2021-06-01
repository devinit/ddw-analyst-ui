/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames';
import { List } from 'immutable';
import React, { FunctionComponent, SyntheticEvent, useContext, useEffect, useState } from 'react';
import { Alert, Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { SourcesContext } from '../../context';
import { AdvancedQueryJoin, JoinType } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';
import { AdvancedJoinColumnsMapper } from '../AdvancedJoinColumnsMapper';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { getSourceColumns, hasJoinConfig, joinTypes } from './utils';

interface ComponentProps {
  source: SourceMap;
}

const AdvancedJoinQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [joinType, setJoinType] = useState<JoinType>('inner');
  const { sources } = useContext(SourcesContext);
  const [joinColumns, setJoinColumns] = useState<ColumnList>(List());

  useEffect(() => {
    if (!hasJoinConfig(options)) {
      updateOptions!({ join: { type: joinType } as AdvancedQueryJoin });
    }
  }, []);

  const onChangeJoinType = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const value = data.value as JoinType;
    setJoinType(value);
    updateOptions!({ join: { ...options.join, type: value } as AdvancedQueryJoin });
  };

  const onSelectSource = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    updateOptions!({
      join: { ...options.join, source: data.value as number } as AdvancedQueryJoin,
    });
    const joinSource = sources.find((_source) => _source.get('id') === data.value);
    if (joinSource) {
      setJoinColumns(getSourceColumns(joinSource) as ColumnList);
    }
  };

  const onAddMapping = (columnMapping: [string, string]) => {
    if (columnMapping.every((column) => !!column)) {
      updateOptions!({
        join: {
          ...options.join,
          mapping:
            options.join && options.join.mapping
              ? options.join.mapping.concat([columnMapping])
              : [columnMapping],
        } as AdvancedQueryJoin,
      });
    }
  };

  // parse source columns into format consumable by FilterItem
  const columnItems = getSourceColumns(source, true) as DropdownItemProps[];

  return (
    <>
      <Col md={6} className="mt-2 pl-0">
        <Form.Group>
          <Form.Label className="bmd-label-floating">Join Type</Form.Label>
          <Dropdown
            name="join_how"
            placeholder="Join Type"
            fluid
            search
            selection
            options={joinTypes}
            value={joinType}
            onChange={onChangeJoinType}
            data-testid="qb-join-type"
          />
          <Form.Control.Feedback type="invalid" className={classNames({ 'd-block': false })}>
            Alert Goes Here
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6} className="mt-2 pl-0">
        <Form.Group>
          <Form.Label className="bmd-label-floating">Data Source to Join With</Form.Label>
          <Dropdown
            name="source"
            placeholder="Select Data Source"
            fluid
            search
            selection
            options={getSelectOptionsFromSources(sources, source)}
            onChange={onSelectSource}
            data-testid="qb-join-dataset-select"
          />
          <Form.Control.Feedback type="invalid" className={classNames({ 'd-block': false })}>
            Alert Goes Here
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      {joinType && joinColumns.count() ? (
        <Col md={10} className={classNames('mt-2 pl-0', { 'd-none': false })}>
          <Alert variant="danger" hidden={true}>
            Alert Goes Here
          </Alert>
          <AdvancedJoinColumnsMapper
            primaryColumns={columnItems}
            secondaryColumns={joinColumns}
            onAdd={onAddMapping}
          />
        </Col>
      ) : null}
    </>
  );
};

export { AdvancedJoinQueryBuilder };
