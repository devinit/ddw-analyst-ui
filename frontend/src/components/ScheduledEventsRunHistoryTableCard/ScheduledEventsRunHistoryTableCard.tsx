import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card, Dropdown, DropdownButton } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { RunInstanceStatus, statusMapping } from '../../pages/ScheduledEvents';
import { ScheduledEvent, ScheduledEventRunHistory } from '../../types/scheduledEvents';
import { PaginationRow } from '../PaginationRow';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';
import { fetchDataPerPage, LIMIT } from './utils';

export interface ComponentProps {
  event?: ScheduledEvent;
}

export const ScheduledEventsRunHistoryTableCard: FunctionComponent<ComponentProps> = ({
  event,
}) => {
  const [historyData, setHistoryData] = useState<ScheduledEventRunHistory[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RunInstanceStatus | ''>('');

  useEffect(() => {
    if (event) {
      fetchDataPerPage(event.id, LIMIT, currentPage, status).then((result) => {
        setHistoryData(result.data.results);
        setCount(result.data.count);
        setPageCount(Math.ceil(result.data.count / LIMIT));
        setLoading(false);
      });
    }
  }, [event, currentPage]);

  const handlePageChange = (page: { selected: number }): void => {
    setLoading(true);
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

  const onFilter = (selectedStatus: RunInstanceStatus | ''): void => {
    if (event) {
      setStatus(selectedStatus);
      fetchDataPerPage(event.id, LIMIT, 1, selectedStatus).then((result) => {
        setHistoryData(result.data.results);
        setCount(result.data.count);
        setPageCount(Math.ceil(result.data.count / LIMIT));
      });
    }
  };

  return event && historyData ? (
    <>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card className="col-md-12">
        <Card.Header className="card-header-danger card-header-icon">
          <h4 className="card-title">{event.name} Run History</h4>
        </Card.Header>
        <Card.Body>
          <DropdownButton
            id="status-filter"
            title={`Filter By Status = ${status ? statusMapping[status] : 'All'}`}
            variant="danger"
            size="sm"
          >
            <Dropdown.Item onSelect={onFilter} eventKey="">
              All
            </Dropdown.Item>
            {Object.keys(statusMapping).map((status: RunInstanceStatus) => (
              <Dropdown.Item key={status} onSelect={onFilter} eventKey={status}>
                {statusMapping[status]}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <ScheduledEventsRunHistoryTable data={historyData} />
          {renderPagination()}
        </Card.Body>
      </Card>
    </>
  ) : null;
};
