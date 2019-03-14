import * as React from 'react';
import { Col, OverlayTrigger, Pagination, Popover, Row, Table } from 'react-bootstrap';
import { List, Map } from 'immutable';

export interface InfoItem {
  caption: string;
  info: string;
}
export type InfoMap = Map<keyof InfoItem, InfoItem[keyof InfoItem]>;
export type InfoListItems = List<InfoMap>;
interface InfoListProps {
  list: InfoListItems;
  limit: number;
  offset: number;
  className?: string;
}
interface InfoListState {
  offset: number;
  list: InfoListItems;
  count: number;
  pages: number;
  limit: number;
}

export class InfoList extends React.Component<InfoListProps, InfoListState> {
  private count = this.props.list.count();
  private pages = Math.ceil(this.count / this.props.limit);
  state: InfoListState = {
    offset: this.props.offset,
    limit: this.props.limit,
    list: this.props.list.slice(0, this.props.limit),
    count: this.props.list.count(),
    pages: Math.ceil(this.props.list.count() / this.props.limit)
  };

  static getDerivedStateFromProps(props: InfoListProps, state: InfoListState): Partial<InfoListState> | null { //tslint:disable-line
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
        <Table size="sm" className={ `${this.props.className || ''}` }>
          <tbody>
            {
              this.state.list.map((item, index) =>
                <tr key={ index }>
                  <td colSpan={ item.get('info') ? 1 : 2 }>
                    { item.get('caption') }
                  </td>
                  { this.renderRow(item) }
                </tr>
              )
            }
          </tbody>
        </Table>
        { this.renderPagination(this.props.list) }
      </div>
    );
  }

  private renderPagination(list: InfoListItems) {
    if (list.count() > this.state.limit) {
      const { offset, count } = this.state;
      const max = offset + this.state.limit;

      return (
        <Row>
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

  private renderRow(item: InfoMap) {
    const info = item.get('info');
    if (info) {
      return (
        <td className="text-right">
          <OverlayTrigger
            trigger="hover"
            placement="bottom"
            overlay={ this.renderPopOver(info) }
          >
            <i className="material-icons" data-testid="info-trigger">info</i>
          </OverlayTrigger>
        </td>
      );
    }
  }

  private renderPopOver(info: string) {
    return <Popover id="popover-basic" data-testid="info-list-info">{ info }</Popover>;
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
