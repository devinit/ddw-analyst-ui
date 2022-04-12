import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Dropdown, DropdownItemProps, DropdownProps } from 'semantic-ui-react';
import styled from 'styled-components';
import { ColumnList } from '../../types/sources';
import { getSelectOptionsFromColumns, sortObjectArrayByProperty } from '../../utils';

interface JoinColumnsMapperProps {
  mappedColumns: [string, string][];
  primaryColumns: DropdownItemProps[];
  secondaryColumns: ColumnList;
  onSelect?: (columnMapping: [string, string], index: number) => void;
  onRemove?: (columnMapping: [string, string]) => void;
}

const StyledCol = styled(Col)`
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
`;

export const AdvancedJoinColumnsMapper: FunctionComponent<JoinColumnsMapperProps> = ({
  mappedColumns,
  ...props
}) => {
  const [joinMappingRow, setJoinMappingRow] = useState<string[]>(
    mappedColumns.length ? mappedColumns.map((column) => `${column}`) : [],
  );
  const [columnData, setColumnData] = useState<[string, string][]>(
    mappedColumns.length ? mappedColumns : [],
  );
  const [activeMapping, setActiveMapping] = useState<[string, string]>(['', '']);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    if (props.onSelect && activeMapping && activeMapping.every((column) => !!column)) {
      columnData.splice(activeIndex, 1, activeMapping);
      setColumnData([...columnData]);
      props.onSelect(activeMapping, activeIndex);
    }
  }, [activeMapping]);

  const onSelectColumn = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps,
  ) => {
    setActiveIndex(data.index as number);
    setActiveMapping(
      data.name === 'primaryColumn'
        ? [
            data.value as string,
            data.index < columnData.length ? columnData[data.index][1] : activeMapping[1],
          ]
        : [
            data.index < columnData.length ? columnData[data.index][0] : activeMapping[0],
            data.value as string,
          ],
    );
  };

  const onRemove = (index: number) => {
    const updatedColumnData = columnData.filter(
      (mapping) => !(mapping[0] === columnData[index][0] && mapping[1] === columnData[index][1]),
    );
    joinMappingRow.splice(index, 1);
    setColumnData([...updatedColumnData]);
    setJoinMappingRow([...joinMappingRow]);
    if (props.onRemove) props.onRemove(columnData[index]);
    setActiveMapping(['', '']);
  };

  const addMapping = () => {
    if (columnData.length > 0) {
      setJoinMappingRow([...joinMappingRow, '']);
      setActiveMapping(['', '']);
    } else {
      setJoinMappingRow(['']);
    }
  };

  const { primaryColumns, secondaryColumns } = props;

  return (
    <>
      {joinMappingRow.map((_column, index) => {
        return (
          <Row key={index} className="mb-1">
            <Col lg={4} className="my-2">
              <Dropdown
                index={index}
                name="primaryColumn"
                placeholder="Select Column"
                fluid
                selection
                search
                options={primaryColumns.sort(sortObjectArrayByProperty('text').sort)}
                onChange={onSelectColumn}
                data-testid="qb-join-primary-column-select"
                value={index < columnData.length ? columnData[index][0] : activeMapping[0]}
              />
            </Col>

            <StyledCol md={1}>
              <i className="material-icons">arrow_forward</i>
            </StyledCol>

            <Col lg={4} className="my-2">
              <Dropdown
                index={index}
                name="secondaryColumn"
                placeholder="Select Column"
                fluid
                selection
                search
                options={getSelectOptionsFromColumns(secondaryColumns).sort(
                  sortObjectArrayByProperty('text').sort,
                )}
                onChange={onSelectColumn}
                data-testid="qb-join-secondary-column-select"
                value={index < columnData.length ? columnData[index][1] : activeMapping[1]}
              />
            </Col>

            <Col lg={2}>
              {props.onRemove ? (
                <Button
                  variant="link"
                  className="btn-just-icon"
                  onClick={() => {
                    onRemove(index);
                  }}
                  data-testid="qb-join-remove-mapping"
                >
                  <i className="material-icons">remove</i>
                </Button>
              ) : null}
            </Col>
          </Row>
        );
      })}
      <Row className="mb-1">
        <Col lg={4} className="my-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => addMapping()}
            data-testid="qb-join-add-mapping-button"
          >
            <i className="material-icons mr-1">add</i>
            Add Mapping
          </Button>
        </Col>
      </Row>
    </>
  );
};

AdvancedJoinColumnsMapper.defaultProps = {};
