import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, FormControl, Pagination, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Dimmer, Loader } from 'semantic-ui-react';
import * as sourcesActions from '../../actions/sources';
import { LinksMap } from '../../types/api';
import { SourceMap } from '../../types/sources';
import { SourcesTable } from '../SourcesTable/SourcesTable';

interface ActionProps {
  actions: typeof sourcesActions;
}
interface ComponentProps extends RouteComponentProps {
  sources: List<SourceMap>;
  activeSource: SourceMap;
  loading: boolean;
  limit: number;
  offset: number;
  links?: LinksMap;
  count: number;
  onRowClick: (source: SourceMap) => void;
}
type SourcesTableCardProps = ComponentProps & ActionProps;

class SourcesTableCard extends React.Component<SourcesTableCardProps, { searchQuery: string }> {
  static defaultProps: Partial<SourcesTableCardProps> = {
    limit: 10,
    offset: 0
  };
  state = { searchQuery: '' };

  render() {
    return (
      <React.Fragment>
        <Dimmer active={ this.props.loading } inverted>
          <Loader content="Loading" />
        </Dimmer>
        <Card>
          <Card.Header className="card-header-text card-header-danger">
            <Card.Title>
              <FormControl
                placeholder="Search ..."
                className="w-50"
                onKeyDown={ this.onSearchChange }
                data-testid="sources-table-search"
              />
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <SourcesTable
              sources={ this.props.sources }
              onRowClick={ this.props.onRowClick }
              activeSource={ this.props.activeSource }
            />
            { this.renderPagination() }
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }

  componentDidMount() {
    if (!this.props.loading) {
      this.props.actions.fetchSources({ limit: 10, offset: this.props.offset });
    }
  }

  private renderPagination() {
    const { count, offset, limit } = this.props;
    const max = offset + limit;

    return (
      <Row>
        <Col md={ 6 }>
          Showing { offset + 1 } to { max > count ? count : max } of { count }
        </Col>
        <Col md={ 6 }>
          <Pagination className="float-right">
            <Pagination.First onClick={ this.goToFirst } data-testid="operations-pagination-first">
              <i className="material-icons">first_page</i>
            </Pagination.First>
            <Pagination.Prev onClick={ this.goToPrev } data-testid="operations-pagination-prev">
              <i className="material-icons">chevron_left</i>
            </Pagination.Prev>
            <Pagination.Next onClick={ this.goToNext } data-testid="operations-pagination-next">
              <i className="material-icons">chevron_right</i>
            </Pagination.Next>
            <Pagination.Last onClick={ this.goToLast } data-testid="operations-pagination-last">
              <i className="material-icons">last_page</i>
            </Pagination.Last>
          </Pagination>
        </Col>
      </Row>
    );
  }

  private onSearchChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      const { value } = event.currentTarget as HTMLInputElement;
      this.setState({ searchQuery: value || '' });
      this.props.actions.fetchSources({ limit: this.props.limit, offset: 0, search: value || '' });
    }
  }

  private goToFirst = () => {
    this.props.actions.fetchSources({ limit: this.props.limit, offset: 0, search: this.state.searchQuery });
  }

  private goToLast = () => {
    const { count } = this.props;
    const pages = Math.ceil(count / this.props.limit);
    const offset = (pages - 1) * this.props.limit;
    this.props.actions.fetchSources({ limit: this.props.limit, offset, search: this.state.searchQuery });
  }

  private goToNext = () => {
    const { count } = this.props;
    const offset = this.props.offset + this.props.limit;
    if (offset < count) {
      this.props.actions.fetchSources({ limit: this.props.limit, offset, search: this.state.searchQuery });
    }
  }

  private goToPrev = () => {
    if (this.props.offset > 0) {
      const offset = this.props.offset - this.props.limit;
      this.props.actions.fetchSources({ limit: this.props.limit, offset, search: this.state.searchQuery });
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (dispatch): ActionProps => ({
  actions: bindActionCreators(sourcesActions, dispatch)
});

const connector = connect(null, mapDispatchToProps)(SourcesTableCard);

export { connector as SourcesTableCard };
