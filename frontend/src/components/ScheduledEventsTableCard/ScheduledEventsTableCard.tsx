import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { PaginationRow } from '../PaginationRow';
import { ScheduledEventsTable } from '../ScheduledEventsTable';
import { fetchData } from '.';

const Limit = 5;

export const ScheduledEventsTableCard: FunctionComponent = () => {
  const [scheduledEvents, setScheduledEvents] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);

  useEffect(() => {
    const fetchDataAsync = async (): Promise<void> => {
      const result = await fetchData();
      setScheduledEvents({ data: result.data });
      setLoading(false);
      setCount(result.data.length);
      setPageCount(Math.ceil(result.data.length / 5));
    };
    fetchDataAsync();
  }, []);

  const getScheduledEventsByPage = (): Array<[]> => {
    const begin = (currentPage - 1) * 5;
    const end = begin + 5;

    return scheduledEvents.data.slice(begin, end);
  };

  const handlePageChange = (page: { selected: number }): void => {
    setSelectedPage(page.selected);
    if (page.selected === selectedPage + 1) {
      setCurrentPage((currentPage) => currentPage + 1);
    } else if (page.selected === selectedPage - 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    } else {
      setCurrentPage(() => page.selected + 1);
    }
  };
  const renderPagination = (): ReactNode => {
    return count === 0 ? (
      'No Data'
    ) : (
      <PaginationRow
        limit={Limit}
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
      <Card style={{ width: '70vw' }}>
        <Card.Header className="card-header-rose card-header-icon">
          <Card.Header className="card-icon">
            <i className="material-icons">schedule</i>
          </Card.Header>
          <h4 className="card-title">Scheduled Events</h4>
        </Card.Header>
        <Card.Body>
          <ScheduledEventsTable
            currentPage={currentPage}
            pageLimit={Limit}
            events={getScheduledEventsByPage()}
          />
          {renderPagination()}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
