import { List, Map } from 'immutable';
import React, { FunctionComponent, useState } from 'react';
import { Button, Col, Row, ModalProps, ButtonGroup } from 'react-bootstrap';
import { Segment } from 'semantic-ui-react';
import { ErroredFilterMap, FilterMap } from '../../types/operations';
import { FilterItem } from '../FilterItem';

interface FilterGroupProps extends ModalProps {
  onDelete: (filter: ErroredFilterMap) => void;
  filter: ErroredFilterMap;
}

export const FilterGroup: FunctionComponent<FilterGroupProps> = ({ filter, onDelete }) => {
  const [filters, setFilters] = useState<List<FilterMap>>(List());

  const operations = [
    { key: 'lt', text: 'is Less Than', value: 'lt' },
    { key: 'le', text: 'is Less Than Or Equal', value: 'le' },
    { key: 'eq', text: 'is Equal', value: 'eq' },
    { key: 'ne', text: 'is Not Equal', value: 'ne' },
    { key: 'gt', text: 'is Greater Than', value: 'gt' },
    { key: 'ge', text: 'is Greater Than Or Equal', value: 'ge' },
    { key: 'text_search', text: 'Contains', value: 'text_search' },
  ];

  const onDeleteGroup = () => {
    onDelete(filter);
  };

  const onDeleteItem = (index) => {
    // onDelete(filter);
  };

  const addFilter = () => {
    const filter: FilterMap = Map({
      value: '',
      func: '',
      field: '',
    } as any);
    const myFilters = filters.push(filter);
    setFilters(myFilters);
  };

  const onUpdateItem = (filter: FilterMap, index: number) => {
    // if (filters && this.props.onUpdateFilters) {
    //   const filters = this.props.filters.set(index, filter);
    //   this.props.onUpdateFilters(JSON.stringify(Map({ filters } as any).toJS()));
    // }
  };

  const renderFilters = (filters?: List<FilterMap>) => {
    if (filters) {
      console.log(`Render filters ${JSON.stringify(filters)}`);

      return filters.map((filter, index) => (
        <FilterItem
          editable={true}
          key={index}
          columns={[]}
          operations={operations}
          filter={filter}
          onUpdate={(filtr: FilterMap) => onUpdateItem(filtr, index)}
          onDelete={() => onDeleteItem(index)}
        />
      ));
    }

    return null;
  };

  return (
    <>
      <Row className="mb-1">
        <Col sm={11}>
          <Segment>
            {renderFilters(filters)}
            <div>
              <ButtonGroup size="sm">
                <Button variant="danger" onClick={addFilter}>
                  <i className="material-icons mr-1">add</i>
                  OR
                </Button>
                <Button variant="danger" onClick={addFilter}>
                  <i className="material-icons mr-1">add</i>
                  AND
                </Button>
              </ButtonGroup>
            </div>
          </Segment>
        </Col>
        <Col sm={1}>
          <Button variant="link" className="btn-just-icon" onClick={onDeleteGroup}>
            <i className="material-icons">delete</i>
          </Button>
        </Col>
      </Row>
    </>
  );
};

FilterGroup.defaultProps = {};
