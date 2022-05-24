import React, { FunctionComponent, useState } from 'react';
import { Dropdown, Nav, Button } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';
import { HelpMenu } from '.';
import {
  dataSourcesHelpMenuLinks,
  myDatasetsHelpMenuLinks,
  publishedDatasetsHelpMenuLinks,
  queryBuilderHelpMenuLinks,
  queryDataHelpMenuLinks,
  queryHistoryHelpMenuLinks,
  scheduledEventHelpMenuLinks,
  sourceHistorysHelpMenuLinks,
  updateDataSourceHelpMenuLinks,
} from '../../utils/help';

const HelpNavItem: FunctionComponent = () => {
  const [showGuide, setShowGuide] = useState(false);

  const toggleButton = () => {
    setShowGuide(!showGuide);
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={toggleButton} style={{ marginRight: 10 }}>
        User Guide
      </Button>
      <Dropdown.Menu show={showGuide} style={{ backgroundColor: 'grey' }} alignRight>
        <Switch>
          <Route path="/" exact component={() => <HelpMenu links={myDatasetsHelpMenuLinks} />} />
          <Route
            path="/datasets"
            exact
            component={() => <HelpMenu links={publishedDatasetsHelpMenuLinks} />}
          />
          <Route
            path="/sources"
            exact
            component={() => <HelpMenu links={dataSourcesHelpMenuLinks} />}
          />
          <Route
            path="/queries/build"
            exact
            component={() => <HelpMenu links={queryBuilderHelpMenuLinks} />}
          />
          <Route
            path="/queries/build/:id"
            exact
            component={() => <HelpMenu links={queryBuilderHelpMenuLinks} />}
          />
          <Route
            path="/queries/history/:id"
            exact
            component={() => <HelpMenu links={queryHistoryHelpMenuLinks} />}
          />
          <Route
            path="/update"
            exact
            component={() => <HelpMenu links={updateDataSourceHelpMenuLinks} />}
          />
          <Route
            path="/queries/data/:id"
            exact
            component={() => <HelpMenu links={queryDataHelpMenuLinks} />}
          />
          <Route
            path="/scheduledevents"
            exact
            component={() => <HelpMenu links={scheduledEventHelpMenuLinks} />}
          />
          <Route
            path="/source/datasets/:id"
            exact
            component={() => <HelpMenu links={publishedDatasetsHelpMenuLinks} />}
          />
          <Route
            path="/source/history/:id"
            exact
            component={() => <HelpMenu links={sourceHistorysHelpMenuLinks} />}
          />
        </Switch>
      </Dropdown.Menu>
    </>
  );
};

export { HelpNavItem };
