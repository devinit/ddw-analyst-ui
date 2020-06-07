import React, { ReactElement, useEffect, useState, ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';
import { fetchRunHistory } from './utils';
import { PaginationRow } from '../PaginationRow';
import { LIMIT, getScheduledEventsByPage } from '.././ScheduledEventsTableCard';

export const ScheduledEventsRunHistoryTableCard = (): ReactElement => {
  const location = useLocation();
  const [historyData, setHistoryData] = useState({});
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);

  useEffect(() => {
    if (location.state) {
      fetchRunHistory(location.state.rowId).then((result) => {
        setHistoryData(result);
        setCount(result.data.length);
        setPageCount(Math.ceil(result.data.length / 5));
      });
    }
  }, [location]);

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
    <div className="col-md-12">
      {historyData.data && historyData.data.length > 0 ? (
        <React.Fragment>
          <Card className="col-md-12">
            <Card.Header className="card-header-rose card-header-icon">
              <h4 className="card-title">Update FTS Run History</h4>
            </Card.Header>
            <Card.Body>
              <ScheduledEventsRunHistoryTable
                data={getScheduledEventsByPage(currentPage, historyData)}
              />
              ;{renderPagination()}
            </Card.Body>
          </Card>
        </React.Fragment>
      ) : null}
    </div>
  );
};
