import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchData, getScheduledEventsByPage } from '.';
import { PaginationRow } from '../PaginationRow';
import { ScheduledEventsTable } from '../ScheduledEventsTable';

const LIMIT = 5;
interface ScheduledEventsTableCardProps {
  handleRunHistory: (id: number, name: string) => void;
}
export const ScheduledEventsTableCard: FunctionComponent<ScheduledEventsTableCardProps> = (
  props,
) => {
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);

  useEffect(() => {
    fetchData().then((result) => {
      setScheduledEvents(result.data);
      setLoading(false);
      setCount(result.data.length);
      setPageCount(Math.ceil(result.data.length / 5));
    });
  }, []);

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
        limit={LIMIT}
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
      <Card className="col-md-12">
        <Card.Header className="card-header-rose card-header-icon">
          <Card.Header className="card-icon">
            <i className="material-icons">schedule</i>
          </Card.Header>
          <h4 className="card-title">Scheduled Events</h4>
        </Card.Header>
        <Card.Body>
          <ScheduledEventsTable
            currentPage={currentPage}
            pageLimit={LIMIT}
            events={getScheduledEventsByPage(currentPage, scheduledEvents)}
            handleRunHistory={props.handleRunHistory}
          />
          {renderPagination()}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};
