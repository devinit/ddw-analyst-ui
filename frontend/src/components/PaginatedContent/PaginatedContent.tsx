import { List } from 'immutable';
import * as React from 'react';
import { Col, Pagination, Row } from 'react-bootstrap';

interface PaginatedContentProps {
  content: React.ReactElement;
  list: List<any>;
  limit: number;
  offset: number;
  className?: string;
}
interface PaginatedContentState {
  offset: number;
  list: List<any>;
  count: number;
  pages: number;
  limit: number;
}

export class PaginatedContent extends React.Component<PaginatedContentProps, PaginatedContentState> {
  private count = this.props.list.count();
  private pages = Math.ceil(this.count / this.props.limit);
  state: PaginatedContentState = {
    offset: this.props.offset,
    limit: this.props.limit,
    list: this.props.list.slice(0, this.props.limit),
    count: this.props.list.count(),
    pages: Math.ceil(this.props.list.count() / this.props.limit)
  };

  static getDerivedStateFromProps(props: PaginatedContentProps, state: PaginatedContentState): Partial<PaginatedContentState> | null { //tslint:disable-line
    const count = props.list.count();
    if (count !== state.count) {
      return {
        offset: 0,
        list: props.list.slice(0, state.limit),
        count,
        pages: Math.ceil(count / state.limit)
      };
    }

    return null;
  }

  render() {
    return (
      <div>
        { React.cloneElement(this.props.content, { list: this.state.list }) }
        { this.renderPagination(this.props.list) }
      </div>
    );
  }

  private renderPagination(list: List<any>) {
    if (list.count() > this.state.limit) {
      const { offset, count } = this.state;
      const max = offset + this.state.limit;

      return (
        <Row className={ this.props.className }>
          <Col lg={ 6 }>
            Showing { offset + 1 } to { max > count ? count : max } of { count }
          </Col>
          <Col lg={ 6 }>
            <Pagination className="float-right">
              <Pagination.First onClick={ this.goToFirst } data-testid="info-pagination-first">
                <i className="material-icons">first_page</i>
              </Pagination.First>
              <Pagination.Prev onClick={ this.goToPrev } data-testid="info-pagination-prev">
                <i className="material-icons">chevron_left</i>
              </Pagination.Prev>
              <Pagination.Next onClick={ this.goToNext } data-testid="info-pagination-next">
                <i className="material-icons">chevron_right</i>
              </Pagination.Next>
              <Pagination.Last onClick={ this.goToLast } data-testid="info-pagination-last">
                <i className="material-icons">last_page</i>
              </Pagination.Last>
            </Pagination>
          </Col>
        </Row>
      );
    }
  }

  private goToFirst = () => {
    this.setState({
      offset: 0,
      list: this.props.list.slice(0, this.state.limit)
    });
  }

  private goToLast = () => {
    const offset = (this.pages - 1) * this.state.limit;
    this.setState({
      offset,
      list: this.props.list.slice(offset, offset + this.state.limit)
    });
  }

  private goToNext = () => {
    const offset = this.state.offset + this.state.limit;
    if (offset < this.count) {
      this.setState({
        offset,
        list: this.props.list.slice(offset, offset + this.state.limit)
      });
    }
  }

  private goToPrev = () => {
    if (this.state.offset > 0) {
      const offset = this.state.offset - this.state.limit;
      this.setState({
        offset,
        list: this.props.list.slice(offset, offset + this.state.limit)
      });
    }
  }
}
