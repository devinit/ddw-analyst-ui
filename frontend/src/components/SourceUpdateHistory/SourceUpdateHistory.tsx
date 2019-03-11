import * as React from 'react';
import { Col, OverlayTrigger, Pagination, Popover, Row, Table } from 'react-bootstrap';
import { UpdateHistoryList, UpdateHistoryMap } from '../../reducers/sources';

interface SourceHistoryProps {
  history: UpdateHistoryList;
}
interface SourceHistoryState {
  offset: number;
  history: UpdateHistoryList;
  count: number;
  pages: number;
  limit: number;
}

export class SourceUpdateHistory extends React.Component<SourceHistoryProps, SourceHistoryState> {
  private limit = 10;
  private count = this.props.history.count();
  private pages = Math.ceil(this.count / this.limit);
  state: SourceHistoryState = {
    offset: 0,
    limit: this.limit,
    history: this.props.history.slice(0, this.limit),
    count: this.props.history.count(),
    pages: Math.ceil(this.props.history.count() / this.limit)
  };

  static getDerivedStateFromProps(props: SourceHistoryProps, state: SourceHistoryState): Partial<SourceHistoryState> | null { //tslint:disable-line
    const count = props.history.count();
    if (count !== state.count) {
      return {
        offset: 0,
        history: props.history.slice(0, state.limit),
        count,
        pages: Math.ceil(count / state.limit)
      };
    }

    return null;
  }

  render() {
    return (
      <div>
        <Table size="sm">
          <tbody>
            {
              this.state.history.map((history, index) =>
                <tr key={ index }>
                  <td colSpan={ history.get('release_description') as string ? 1 : 2 }>
                    { new Date(history.get('released_on') as string).toString() }
                  </td>
                  { this.renderRow(history) }
                </tr>
              )
            }
          </tbody>
        </Table>
        { this.renderPagination(this.props.history) }
      </div>
    );
  }

  private renderPagination(history: UpdateHistoryList) {
    if (history.count() > this.limit) {
      const { offset, count } = this.state;
      const max = offset + this.limit;

      return (
        <Row>
          <Col lg={ 6 }>
            Showing { offset + 1 } to { max > count ? count : max } of { count }
          </Col>
          <Col lg={ 6 }>
            <Pagination className="float-right">
              <Pagination.First onClick={ this.goToFirst }>
                <i className="material-icons">first_page</i>
              </Pagination.First>
              <Pagination.Prev onClick={ this.goToPrev }>
                <i className="material-icons">chevron_left</i>
              </Pagination.Prev>
              <Pagination.Next onClick={ this.goToNext }>
                <i className="material-icons">chevron_right</i>
              </Pagination.Next>
              <Pagination.Last onClick={ this.goToLast }>
                <i className="material-icons">last_page</i>
              </Pagination.Last>
            </Pagination>
          </Col>
        </Row>
      );
    }
  }

  private renderRow(history: UpdateHistoryMap) {
    const description = history.get('release_description') as string;
    if (description) {
      return (
        <td className="text-right">
          <OverlayTrigger
            trigger="hover"
            placement="bottom"
            overlay={ this.renderPopOver(description) }
          >
            <i className="material-icons">info</i>
          </OverlayTrigger>
        </td>
      );
    }
  }

  private renderPopOver(info: string) {
    return <Popover id="popover-basic">{ info }</Popover>;
  }

  private goToFirst = () => {
    this.setState({
      offset: 0,
      history: this.props.history.slice(0, this.limit)
    });
  }

  private goToLast = () => {
    const offset = (this.pages - 1) * this.limit;
    this.setState({
      offset,
      history: this.props.history.slice(offset, offset + this.limit)
    });
  }

  private goToNext = () => {
    const offset = this.state.offset + this.limit;
    if (offset < this.count) {
      this.setState({
        offset,
        history: this.props.history.slice(offset, offset + this.limit)
      });
    }
  }

  private goToPrev = () => {
    if (this.state.offset > 0) {
      const offset = this.state.offset - this.limit;
      this.setState({
        offset,
        history: this.props.history.slice(offset, offset + this.limit)
      });
    }
  }
}
