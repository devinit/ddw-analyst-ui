import classNames from 'classnames';
import { List, Set } from 'immutable';
import React, { FunctionComponent } from 'react';
import { Alert, Col, Form } from 'react-bootstrap';
import { Dropdown } from 'semantic-ui-react';
import { ColumnList, SourceMap } from '../../types/sources';
import { JoinColumnsMapper } from '../JoinColumnsMapper';
import { QueryBuilderHandler } from '../QueryBuilderHandler';

interface ComponentProps {
  source: SourceMap;
}

const AdvancedJoinQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
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
            // options={this.joinTypes}
            // value={this.props.joinType}
            // onChange={this.onChange}
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
