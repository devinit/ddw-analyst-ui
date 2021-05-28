import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Pagination, PaginationProps } from '../Pagination';

interface ComponentProps extends Partial<PaginationProps> {
  limit: number;
  count: number;
  className?: string;
  currentPage?: number;
  offset?: number;
}

const PaginationRow: FunctionComponent<ComponentProps> = ({ limit, count, ...props }) => {
  const onPageSelected = (page: { selected: number }): void => {
    if (props.onPageChange) {
      props.onPageChange(page);
    }
  };

  const max = (props.offset ? props.offset : 0) + limit;

  return (
    <Row className={classNames(props.className)}>
      <Col
        lg={4}
        className="align-middle d-none d-sm-none d-md-block m-auto"
        style={{ top: '2px' }}
      >
        {count === 0
          ? 'No Data'
          : `Showing ${(props.offset ? props.offset : 0) + 1} to ${
              max > count ? count : max
            } of ${count}`}
      </Col>
      <Col lg={8} className="align-middle">
        <Pagination
          className="pagination-danger float-right"
          {...props}
          onPageChange={onPageSelected}
          currentPage={props.currentPage}
        />
      </Col>
    </Row>
  );
};

export { PaginationRow };
