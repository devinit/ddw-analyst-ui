import { List, Map } from 'immutable';
import * as React from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import styled from 'styled-components';
import { ColumnList, SourceMap, UpdateHistoryList } from '../../types/sources';
import { InfoList, InfoListItems } from '../InfoList';
import { PaginatedContent } from '../PaginatedContent';
import { SourceColumnsList } from '../SourceColumnsList';
import { SourceMetadata } from '../SourceMetadata';

interface SourceDetailsProps {
  source: SourceMap;
}

const StyledCard = styled(Card)`
  box-shadow: none;
`;

export class SourceDetailsTab extends React.Component<SourceDetailsProps> {
  render(): React.ReactElement {
    return (
      <Tab.Container defaultActiveKey="metadata">
        <StyledCard className="source-details border-0">
          <Card.Body>
            <Nav variant="pills" className="nav-pills-danger" role="tablist">
              <Nav.Item>
                <Nav.Link eventKey="metadata">Metadata</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="columns">Columns</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="history">Update History</Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="metadata">
                <SourceMetadata source={this.props.source} />
              </Tab.Pane>
              <Tab.Pane eventKey="columns">
                <SourceColumnsList columns={this.props.source.get('columns') as ColumnList} />
              </Tab.Pane>
              <Tab.Pane eventKey="history">
                <PaginatedContent
                  content={<InfoList list={List()} className="source-columns-table" />}
                  list={this.getUpdateHistory()}
                  limit={10}
                  offset={0}
                />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </StyledCard>
      </Tab.Container>
    );
  }

  private getUpdateHistory(): InfoListItems {
    return (this.props.source.get('update_history') as UpdateHistoryList).map((history) =>
      Map()
        .set('caption', new Date(history.get('released_on') as string).toString())
        .set('info', history.get('release_description') as string),
    ) as InfoListItems;
  }
}
