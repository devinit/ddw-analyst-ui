/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames';
import React, { FunctionComponent, SyntheticEvent, useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { SourcesContext } from '../../context';
import {
  AdvancedQueryColumn,
  AdvancedQueryJoin,
  AdvancedQueryOptions,
  JoinType,
} from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';
import { AdvancedJoinColumnsMapper } from '../AdvancedJoinColumnsMapper';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { StyledListItem, StyledStepContainer } from '../OperationSteps';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { checkIfMappingExists, getSourceColumns, hasJoinConfig, joinTypes } from './utils';

interface ComponentProps {
  source: SourceMap;
}

const AdvancedJoinQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [joinType, setJoinType] = useState<JoinType>('inner');
  const [joinSource, setJoinSource] = useState<SourceMap>();
  const { sources } = useContext(SourcesContext);

  const [show, setShow] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [joinList, setJoinList] = useState<AdvancedQueryJoin[]>(
    options.join && options.join.length ? options.join : [],
  );
  const [activeJoin, setActiveJoin] = useState<AdvancedQueryJoin>({
    type: 'inner',
  } as AdvancedQueryJoin);
  const [activeJoinIndex, setActiveJoinIndex] = useState<number>(0);
  const [selectedColumns, setSelectedColumns] = useState<AdvancedQueryColumn[]>(
    joinList.length &&
      joinList[activeJoinIndex] &&
      joinList[activeJoinIndex].columns &&
      joinList[activeJoinIndex].columns!.length
      ? joinList[activeJoinIndex].columns!
      : [],
  );

  useEffect(() => {
    if (!hasJoinConfig(options)) {
      updateOptions!({ join: [] as AdvancedQueryJoin[] });
    }
    if (options.join && options.join.length && options.join![activeJoinIndex].source) {
      const joinSource = sources.find((_source) => {
        if (options.join) {
          return _source.get('id') === options.join[activeJoinIndex].source;
        } else {
          return false;
        }
      });
      if (joinSource) setJoinSource(joinSource);
    }
  }, []);

  useEffect(() => {
    setSelectedColumns(
      joinList[activeJoinIndex] && joinList[activeJoinIndex].columns
        ? (joinList[activeJoinIndex].columns as AdvancedQueryColumn[])
        : [],
    );
    updateOptions!({
      join: joinList,
    });
  }, [joinList]);

  const onChangeJoinType = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const value = data.value as JoinType;
    setJoinType(value);
    setActiveJoin({ ...activeJoin, type: value } as AdvancedQueryJoin);
    updateJoinList({
      type: value,
    });
  };

  const onSelectSource = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (activeJoin && activeJoin.columns) delete activeJoin.columns;
    setActiveJoin({
      ...activeJoin,
      source: data.value as number,
      mapping: [],
    } as AdvancedQueryJoin);
    updateJoinList({
      source: data.value as number,
      mapping: [],
    });
    const joinSource = sources.find((_source) => _source.get('id') === data.value);
    if (joinSource) setJoinSource(joinSource);
  };

  const onUpdateMapping = (columnMapping: [string, string], index: number) => {
    if (!checkIfMappingExists(activeJoin.mapping, columnMapping).length) {
      activeJoin.mapping.splice(index, 1, columnMapping);
      joinList[activeJoinIndex].mapping.splice(index, 1, columnMapping);
      setActiveJoin({
        ...activeJoin,
        mapping: [...activeJoin.mapping],
      } as AdvancedQueryJoin);
    }
    updateJoinList({
      mapping: [...joinList[activeJoinIndex].mapping],
    });
  };

  const onRemoveMapping = (columnMapping: [string, string]) => {
    // should only attempt to remove when there's something to remove
    if (activeJoin && activeJoin.mapping && activeJoin.mapping.length) {
      const updatedMapping = activeJoin.mapping.filter(
        (mapping) => !(mapping[0] === columnMapping[0] && mapping[1] === columnMapping[1]),
      );
      setActiveJoin({ ...activeJoin, mapping: [...updatedMapping] } as AdvancedQueryJoin);
      updateJoinList({ mapping: [...updatedMapping] });
    }
  };

  const onSelectColumns = (columns: Partial<AdvancedQueryOptions>) => {
    setActiveJoin({ ...activeJoin, ...columns });
    updateJoinList(columns);
    setSelectedColumns(columns.columns ? columns.columns : []);
  };

  const updateJoinList = (updatedData: any) => {
    if (!isEditing) {
      joinList[activeJoinIndex] = { ...activeJoin, ...updatedData };
    } else {
      joinList[activeJoinIndex] = { ...joinList[activeJoinIndex], ...updatedData };
    }
    setJoinList([...joinList]);
  };

  const onClickJoin = (activeJoinIndex: number) => {
    setActiveJoinIndex(activeJoinIndex);
    setJoinType(joinList[activeJoinIndex].type);
    const joinSource = sources.find(
      (_source) => _source.get('id') === joinList[activeJoinIndex].source,
    );
    if (joinSource) setJoinSource(joinSource);
    setActiveJoin(joinList[activeJoinIndex]);
    setShow(!show);
    setIsEditing(true);
  };

  const onDelete = () => {
    joinList.splice(activeJoinIndex, 1);
    setJoinList([...joinList]);
    setShow(!show);
    setIsEditing(false);
  };

  // parse source columns into format consumable by FilterItem
  const columnItems = getSourceColumns(source, true) as DropdownItemProps[];

  return (
    <>
      <Row>
        <Col>
          <Button
            variant="danger"
            size="sm"
            data-testid="qb-add-join-button"
            onClick={() => {
              setShow(!show);
              setIsEditing(false);
              setActiveJoin({
                type: 'inner',
              } as AdvancedQueryJoin);
              setActiveJoinIndex(joinList.length ? joinList.length : 0);
            }}
          >
            {show ? <span>Add Join</span> : <span>View Joins</span>}
          </Button>
          <Button
            variant="dark"
            size="sm"
            data-placement="top"
            data-html="true"
            title={'Deletes a join'}
            onClick={() => onDelete()}
            hidden={!isEditing}
          >
            {'Delete'}
          </Button>
        </Col>
      </Row>
      {show ? (
        <Row>
          <Col className="mb-3 w-100">
            <ListGroup variant="flush" className="">
              {joinList.map((join, index) => (
                <StyledStepContainer key={index}>
                  <StyledListItem
                    onClick={() => {
                      onClickJoin(index);
                    }}
                  >
                    <Badge variant="secondary">{join.type}</Badge>
                    <div>
                      {sources
                        .find((_source) => _source.get('id') === join.source)
                        ?.get('indicator')}
                    </div>
                  </StyledListItem>
                </StyledStepContainer>
              ))}
            </ListGroup>
          </Col>
        </Row>
      ) : (
        <Card className="mt-2">
          <Card.Body>
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
                  options={getSelectOptionsFromSources(sources)}
                  onChange={onSelectSource}
                  data-testid="qb-join-dataset-select"
                  value={joinSource?.get('id') as number}
                />
                <Form.Control.Feedback type="invalid" className={classNames({ 'd-block': false })}>
                  Alert Goes Here
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {joinType && joinSource ? (
              <Col className={classNames('mt-2 pl-0', { 'd-none': false })}>
                <Form.Label className="bmd-label-floating">Column Mapping</Form.Label>
                <Alert variant="danger" hidden={true}>
                  Alert Goes Here
                </Alert>
                <AdvancedJoinColumnsMapper
                  primaryColumns={columnItems}
                  secondaryColumns={getSourceColumns(joinSource) as ColumnList}
                  onSelect={onUpdateMapping}
                  onRemove={onRemoveMapping}
                  mappedColumns={
                    activeJoin.mapping && activeJoin.mapping.length ? activeJoin.mapping : []
                  }
                />

                <AdvancedSelectQueryBuilder
                  source={joinSource}
                  usage="join"
                  activeJoinIndex={activeJoinIndex}
                  onSelectColumns={onSelectColumns}
                  selectedColumns={selectedColumns}
                />

                <div className="mb-3">{}</div>
              </Col>
            ) : null}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export { AdvancedJoinQueryBuilder };
