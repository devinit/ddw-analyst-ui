import React, { FunctionComponent, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Pagination, PaginationProps } from '../Pagination';

interface ComponentProps extends Partial<PaginationProps> {
  limit: number;
  count: number;
}

const PaginationRow: FunctionComponent<ComponentProps> = ({ limit, count, ...props }) => {
  const [offset, setOffset] = useState(0);
  const onPageSelected = (page: { selected: number }): void => {
    if (page.selected === 0) {
      setOffset(0);
    } else {
      setOffset(page.selected * limit);
    }
    if (props.onPageChange) {
      props.onPageChange(page);
    }
  };
  const max = offset + limit;

  return (
    <Row>
      <Col lg={4} className="align-middle d-none d-sm-none d-md-block" style={{ top: '2px' }}>
        {count === 0
          ? 'No Data'
          : `Showing ${offset + 1} to ${max > count ? count : max} of ${count}`}
      </Col>
      <Col lg={8} className="align-middle">
        <Pagination className="float-right" {...props} onPageChange={onPageSelected} />
      </Col>
    </Row>
  );
};

export { PaginationRow };
