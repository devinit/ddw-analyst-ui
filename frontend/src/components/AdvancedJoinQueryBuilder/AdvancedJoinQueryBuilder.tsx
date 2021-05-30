import classNames from 'classnames';
import { List, Set } from 'immutable';
import React, { FunctionComponent, SyntheticEvent, useContext, useEffect, useState } from 'react';
import { Alert, Col, Form } from 'react-bootstrap';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { AdvancedQueryJoin, JoinType } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { JoinColumnsMapper } from '../JoinColumnsMapper';
import { QueryBuilderHandler } from '../QueryBuilderHandler';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { hasJoinConfig, joinTypes } from './utils';

interface ComponentProps {
  source: SourceMap;
}

const AdvancedJoinQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [joinType, setJoinType] = useState<JoinType>('inner');

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

  // parse source columns into format consumable by FilterItem
  const columns = source.get('columns') as ColumnList;
  const columnSet = Set(columns.map((column) => column.get('name') as string));
  const columnItems = QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columns);

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
            // disabled={!this.props.editable}
            data-testid="qb-join-type"
          />
          <Form.Control.Feedback type="invalid" className={classNames({ 'd-block': false })}>
            Alert Goes Here
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6} className="mt-2 pl-0">
        <Form.Group>
          <Form.Label className="bmd-label-floating">Data set to join with</Form.Label>
          <Dropdown
            name="source"
            placeholder="Select Data Set"
            fluid
            search
            selection
            // options={this.getSelectOptionsFromSources(this.props.sources, this.props.source).sort(
            //   sortObjectArrayByProperty('text').sort,
            // )}
            // loading={this.props.isFetchingSources}
            // value={sourceID as string | undefined}
            // onChange={this.onChange}
            // disabled={!this.props.editable}
            data-testid="qb-join-dataset-select"
          />
          <Form.Control.Feedback type="invalid" className={classNames({ 'd-block': false })}>
            Alert Goes Here
          </Form.Control.Feedback>
        </Form.Group>
      </Col>

      <Col md={12} className={classNames('mt-2 pl-0', { 'd-none': false })}>
        <Alert variant="danger" hidden={true}>
          Alert Goes Here
        </Alert>
        <JoinColumnsMapper
          // editable={this.props.editable}
          primaryColumns={columnItems}
          secondaryColumns={List()}
          primaryColumn={''}
          secondaryColumn={''}
          columnMapping={{}}
          // onUpdate={this.onChangeMapping}
        />
      </Col>
    </>
  );
};

export { AdvancedJoinQueryBuilder };
