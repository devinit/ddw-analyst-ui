import * as React from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { ScheduledEventsTable } from '../ScheduledEventsTable/ScheduledEventsTable';
import { api, localForageKeys } from '../../utils';
import * as localForage from 'localforage';
import { PaginationRow } from '../PaginationRow';

export const ScheduledEventsTableCard = () => {
  const [scheduledEvents, setScheduledEvents] = React.useState({ data: [] });
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedPage, setSelectedPage] = React.useState(0);
  const basePath = api.routes.VIEW_SCHEDULED_EVENTS;
  const limit = 5;
  React.useEffect(() => {
    const fetchData = async () => {
      const token = await localForage.getItem<string>(localForageKeys.API_KEY);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `token ${token}`,
      };
      const result = await axios(`${basePath}`, { headers });
      setScheduledEvents({ data: result.data });
      setLoading(false);
      setCount(result.data.length);
      setPageCount(Math.ceil(result.data.length / 5));
    };
    fetchData();
  }, []);

  const handleScheduledEvents = () => {
    const begin = (currentPage - 1) * 5;
    const end = begin + 5;

    return scheduledEvents.data.slice(begin, end);
  };

  const handlePageChange = (page: any) => {
    setSelectedPage(page.selected);
    if (page.selected === selectedPage + 1) {
      setCurrentPage((currentPage) => currentPage + 1);
    } else if (page.selected === selectedPage - 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    } else {
      setCurrentPage(() => page.selected + 1);
    }
  };
  const renderPagination = (): React.ReactNode => {
    return count === 0 ? (
      'No Data'
    ) : (
      <PaginationRow
        limit={limit}
        count={count}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <React.Fragment>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card style={{ width: '76vw' }}>
        <Card.Header className="card-header-rose card-header-icon">
          <Card.Header className="card-icon">
            <i className="material-icons">schedule</i>
          </Card.Header>
          <h4 className="card-title">Scheduled Events</h4>
        </Card.Header>
        <Card.Body>
          <ScheduledEventsTable
            currentPage={currentPage}
            pageLimit={limit}
            events={handleScheduledEvents()}
          />
          {renderPagination()}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

ScheduledEventsTableCard.defaultProps = {
  limit: 5,
  offset: 0,
};
