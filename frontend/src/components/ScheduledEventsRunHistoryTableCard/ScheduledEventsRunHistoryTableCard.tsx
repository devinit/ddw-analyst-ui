import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { ScheduledEventRunHistory } from '../../types/scheduledEvents';
import { LIMIT } from '.././ScheduledEventsTableCard';
import { PaginationRow } from '../PaginationRow';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';
import { fetchRunHistory, getScheduledEventsByPage } from './utils';

interface ScheduledEventsRunHistoryTableCardProps {
  rowId: number;
  eventName: string;
}

export const ScheduledEventsRunHistoryTableCard: FunctionComponent<ScheduledEventsRunHistoryTableCardProps> = (
  props,
) => {
  const [historyData, setHistoryData] = useState<ScheduledEventRunHistory[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);

  useEffect(() => {
    fetchRunHistory(props.rowId).then((result) => {
      setHistoryData(result.data);
      setCount(result.data.length);
      setPageCount(Math.ceil(result.data.length / LIMIT));
    });
  }, [props.rowId]);

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

  return historyData && historyData.length ? (
    <Card className="col-md-12">
      <Card.Header className="card-header-rose card-header-icon">
        <h4 className="card-title">{props.eventName} Run History</h4>
      </Card.Header>
      <Card.Body>
        <ScheduledEventsRunHistoryTable data={getScheduledEventsByPage(currentPage, historyData)} />
        {renderPagination()}
      </Card.Body>
    </Card>
  ) : null;
};
