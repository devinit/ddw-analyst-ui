import * as React from 'react';
import { Col, OverlayTrigger, Pagination, Popover, Row, Table } from 'react-bootstrap';
import { ColumnList, ColumnMap } from '../../reducers/sources';

interface SourceColumnsProps {
  columns: ColumnList;
}
interface SourceColumnsState {
  offset: number;
  columns: ColumnList;
  count: number;
  pages: number;
  limit: number;
}

export class SourceColumns extends React.Component<SourceColumnsProps, SourceColumnsState> {
  private limit = 10;
  private count = this.props.columns.count();
  private pages = Math.ceil(this.count / this.limit);
  state: SourceColumnsState = {
    offset: 0,
    limit: this.limit,
    columns: this.props.columns.slice(0, this.limit),
    count: this.props.columns.count(),
    pages: Math.ceil(this.props.columns.count() / this.limit)
  };

  static getDerivedStateFromProps(props: SourceColumnsProps, state: SourceColumnsState) {
    const count = props.columns.count();
    if (count !== state.count) {
      return {
        offset: 0,
        columns: props.columns.slice(0, state.limit),
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
              this.state.columns.map((column, index) =>
                <tr key={ index }>
                  <td colSpan={ column.get('description') as string ? 1 : 2 }>
                    { column.get('source_name') as string }
                  </td>
                  { this.renderInfo(column) }
                </tr>
              )
            }
          </tbody>
        </Table>
        { this.renderPagination(this.props.columns) }
      </div>
    );
  }

  private renderPagination(columns: ColumnList) {
    if (columns.count() > this.limit) {
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

  private renderInfo(column: ColumnMap) {
    const description = column.get('description') as string;
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
      columns: this.props.columns.slice(0, this.limit)
    });
  }

  private goToLast = () => {
    const offset = (this.pages - 1) * this.limit;
    this.setState({
      offset,
      columns: this.props.columns.slice(offset, offset + this.limit)
    });
  }

  private goToNext = () => {
    const offset = this.state.offset + this.limit;
    if (offset < this.count) {
      this.setState({
        offset,
        columns: this.props.columns.slice(offset, offset + this.limit)
      });
    }
  }

  private goToPrev = () => {
    if (this.state.offset > 0) {
      const offset = this.state.offset - this.limit;
      this.setState({
        offset,
        columns: this.props.columns.slice(offset, offset + this.limit)
      });
    }
  }
}
