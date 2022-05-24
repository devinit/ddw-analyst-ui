import classNames from 'classnames';
import React, { FunctionComponent, useState } from 'react';
import { Dropdown, Button, Nav } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
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

const StyledIcon = styled.i`
  top: -1px !important;
  margin-top: -1em !important;
  font-size: 16px !important;
`;

const StyledDropdownToggle = styled(Dropdown.Toggle)`
  &:after {
    display: none !important;
  }
`;

const HelpNavItem: FunctionComponent = () => {
  const [show, setShow] = useState(false);

  return (
    <Dropdown as={Nav.Item} aria-labelledby="navbarDropdownHelp">
      <StyledDropdownToggle as={Nav.Link} id="help-nav-dropdown" data-cy="help">
        <li className="nav-item mr-4">
          <Button size="sm" variant="danger" onClick={() => setShow(!show)}>
            <StyledIcon className="material-icons">help</StyledIcon> <span>User Guide</span>
          </Button>
        </li>
      </StyledDropdownToggle>
      <Dropdown.Menu alignRight show={show} className={classNames({ show: show })}>
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
    </Dropdown>
  );
};

export { HelpNavItem };
