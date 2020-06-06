import React, { ReactElement, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';
import { fetchRunHistory } from './utils';

export const ScheduledEventsRunHistoryTableCard = (): ReactElement => {
  const location = useLocation();
  const [historyData, setHistoryData] = useState({});

  useEffect(() => {
    if (location.state) {
      fetchRunHistory(location.state.rowId).then((result) => {
        console.log(result);
        setHistoryData(result);
        console.log(historyData.data)
      });
    }
  }, [location]);

  return (
    <div className="col-md-12">
      {historyData.data && historyData.data.length > 0 ? (
        <React.Fragment>
          <Card className="col-md-12">
            <Card.Header className="card-header-rose card-header-icon">
              <h4 className="card-title">Update FTS Run History</h4>
            </Card.Header>
            <Card.Body>
              <ScheduledEventsRunHistoryTable data={historyData} />;
            </Card.Body>
          </Card>
        </React.Fragment>
      ) : null}
    </div>
  );
};
