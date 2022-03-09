/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames';
import React, { FunctionComponent, SyntheticEvent, useContext, useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import { SourcesContext } from '../../context';
import { AdvancedQueryJoin, AdvancedQueryOptions, JoinType } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { getSelectOptionsFromSources } from '../../utils';
import { AdvancedJoinColumnsMapper } from '../AdvancedJoinColumnsMapper';
import { AdvancedSelectQueryBuilder } from '../AdvancedSelectQueryBuilder';
import { StyledStepContainer, StyledListItem } from '../OperationSteps';
import { AdvancedQueryContext, QueryContextProps } from '../QuerySentenceBuilder';
import { getSourceColumns, hasJoinConfig, joinTypes } from './utils';

interface ComponentProps {
  source: SourceMap;
}

const AdvancedJoinQueryBuilder: FunctionComponent<ComponentProps> = ({ source }) => {
  const { options, updateOptions } = useContext<QueryContextProps>(AdvancedQueryContext);
  const [joinType, setJoinType] = useState<JoinType>('inner');
  const [edit, setEdit] = useState<boolean>(false);
  const [joinSource, setJoinSource] = useState<SourceMap>();
  const { sources } = useContext(SourcesContext);
  const [display, setDisplay] = useState<boolean>(true);
  const [joinList, setJoinList] = useState<AdvancedQueryJoin[]>([]);
  const [activeJoin, setActiveJoin] = useState<AdvancedQueryJoin>({
    type: 'inner',
  } as AdvancedQueryJoin);
  const [activeJoinIndex, setActiveJoinIndex] = useState<number>(0);

  useEffect(() => {
    if (!hasJoinConfig(options)) {
      updateOptions!({ join: [] as AdvancedQueryJoin[] });
    }
    if (options.join && options.join![activeJoinIndex].source) {
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
    if (joinList.length > 0) {
      updateOptions!({
        join: joinList,
      });
    }
  }, [joinList]);

  // useEffect(() => {
  //   setActiveJoin({
  //     ...activeJoin,
  //     ...options.join,
  //   });
  // }, [options.join![activeJoinIndex].columns]);

  const onChangeJoinType = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const value = data.value as JoinType;
    setJoinType(value);
    // updateOptions!({ join: { ...options.join, type: value } as AdvancedQueryJoin });
    setActiveJoin({ ...activeJoin, type: value } as AdvancedQueryJoin);
  };

  const onSelectSource = (_event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    if (options.join && options.join.length > 0 && options.join[activeJoinIndex].columns)
      delete options.join[activeJoinIndex].columns;
    // updateOptions!({
    //   join: {
    //     ...options.join,
    //     source: data.value as number,
    //     mapping: [],
    //   } as AdvancedQueryJoin,
    // });
    setActiveJoin({
      ...activeJoin,
      source: data.value as number,
      mapping: [],
    } as AdvancedQueryJoin);
    const joinSource = sources.find((_source) => _source.get('id') === data.value);
    if (joinSource) setJoinSource(joinSource);
  };

  const onAddMapping = (columnMapping: [string, string]) => {
    if (columnMapping.every((column) => !!column)) {
      // updateOptions!({
      //   join: {
      //     ...options.join,
      //     mapping:
      //       options.join && options.join.mapping
      //         ? options.join.mapping.concat([columnMapping])
      //         : [columnMapping],
      //   },
      // });

      setActiveJoin({
        ...activeJoin,
        mapping: [columnMapping],
      } as AdvancedQueryJoin);
    }
  };
  const onRemoveMapping = (columnMapping: [string, string]) => {
    // should only attempt to remove when there's something to remove
    // if (
    //   options.join &&
    //   options.join.mapping &&
    //   options.join.mapping.length &&
    //   columnMapping.every((column) => !!column)
    // ) {
    // updateOptions!({
    //   join: {
    //     ...options.join,
    //     mapping:
    //       options.join &&
    //       options.join.mapping.filter(
    //         (mapping) => !(mapping[0] === columnMapping[0] && mapping[1] === columnMapping[1]),
    //       ),
    //   } as AdvancedQueryJoin,
    // });
    // }
  };

  const onSelectColumns = (columns: Partial<AdvancedQueryOptions>) => {
    setActiveJoin({
      ...activeJoin,
      ...columns,
    });
  };

  const onAddJoin = () => {
    setJoinList([...joinList, { ...activeJoin }]);
    setDisplay(!display);
  };

  const onClickJoin = (activeJoinIndex: number) => {
    setActiveJoinIndex(activeJoinIndex);
    setEdit(true);
    setJoinType(joinList[activeJoinIndex].type);
    const joinSource = sources.find(
      (_source) => _source.get('id') === joinList[activeJoinIndex].source,
    );
    if (joinSource) setJoinSource(joinSource);
    setActiveJoin(joinList[activeJoinIndex]);
    setDisplay(!display);
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
              setDisplay(!display);
              setEdit(false);
              setActiveJoin({
                type: 'inner',
              } as AdvancedQueryJoin);
            }}
          >
            {display ? (
              <span>
                <i className="material-icons mr-1">add</i>Add Join
              </span>
            ) : (
              <span>
                <i className="material-icons mr-1">list</i> View Joins
              </span>
            )}
          </Button>
        </Col>
      </Row>
      {display ? (
        <Row>
          <ListGroup variant="flush" className="w-100">
            {joinList.map((join, index) => (
              <ListGroup.Item
                key={index}
                onClick={() => {
                  onClickJoin(index);
                }}
              >
                <Badge variant="secondary">{join.type}</Badge>
                <div>
                  {sources.find((_source) => _source.get('id') === join.source)?.get('indicator')}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Row>
      ) : (
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
                value={joinSource?.get('id') as number}
              />
              <Form.Control.Feedback type="invalid" className={classNames({ 'd-block': false })}>
                Alert Goes Here
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {joinType && joinSource ? (
            <Col md={10} className={classNames('mt-2 pl-0', { 'd-none': false })}>
              <Alert variant="danger" hidden={true}>
                Alert Goes Here
              </Alert>
              <AdvancedJoinColumnsMapper
                primaryColumns={columnItems}
                secondaryColumns={getSourceColumns(joinSource) as ColumnList}
                onAdd={onAddMapping}
                onRemove={onRemoveMapping}
                mappedColumns={activeJoin.mapping ? activeJoin.mapping : [['', '']]}
              />

              <AdvancedSelectQueryBuilder
                source={joinSource}
                usage="join"
                activeJoinIndex={activeJoinIndex}
                onSelectColumns={onSelectColumns}
              />

              <div className="mb-3">
                <Button
                  disabled={
                    activeJoin.mapping && activeJoin.mapping.length > 0 && activeJoin.source
                      ? false
                      : true
                  }
                  variant="danger"
                  size="sm"
                  data-placement="top"
                  data-html="true"
                  title={`Adds a join`}
                  onClick={() => onAddJoin()}
                >
                  {edit ? 'Edit' : 'Add'}
                </Button>
              </div>
            </Col>
          ) : null}
        </>
      )}
    </>
  );
};

export { AdvancedJoinQueryBuilder };
