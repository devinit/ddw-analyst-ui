import classNames from 'classnames';
import React, { FunctionComponent, ReactNode } from 'react';
import ReactPaginate, { ReactPaginateProps } from 'react-paginate';

export interface PaginationProps extends Partial<ReactPaginateProps> {
  className?: string;
}
const renderLabel = (caption: string): ReactNode => (
  <>
    <span aria-hidden="true">{caption}</span>
    <span className="sr-only">{caption}</span>
    <div className="ripple-container"></div>
  </>
);

const Pagination: FunctionComponent<PaginationProps> = (props) => {
  return (
    <ReactPaginate
      containerClassName={classNames('pagination', props.className)}
      pageClassName="page-item"
      pageLinkClassName="page-link"
      activeClassName="active"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      previousLabel={renderLabel('Previous')}
      nextClassName="page-item"
      nextLinkClassName="page-link"
      nextLabel={renderLabel('Next')}
      breakClassName="page-item"
      breakLinkClassName="page-link"
      onPageChange={props.onPageChange}
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      pageCount={props.pageCount!}
      pageRangeDisplayed={props.pageRangeDisplayed!}
      marginPagesDisplayed={props.marginPagesDisplayed!}
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    />
  );
};

Pagination.defaultProps = {
  pageCount: 10,
  pageRangeDisplayed: 5,
  marginPagesDisplayed: 2,
};

export { Pagination };
