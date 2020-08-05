import React, { FunctionComponent } from 'react';
import { OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { List, Map } from 'immutable';
import { ReactNode, ReactElement } from 'react';

export interface InfoItem {
  caption: string;
  info: string;
}
export type InfoMap = Map<keyof InfoItem, InfoItem[keyof InfoItem]>;
export type InfoListItems = List<InfoMap>;
interface InfoListProps {
  list: InfoListItems;
  className?: string;
}

export const InfoList: FunctionComponent<InfoListProps> = (props) => {
  const renderPopOver = (info: string): ReactElement => {
    return (
      <Popover id="popover-basic" data-testid="info-list-info">
        {info}
      </Popover>
    );
  };
  const renderRow = (item: InfoMap): ReactNode => {
    const info = item.get('info');
    if (info) {
      return (
        <td className="text-right">
          <OverlayTrigger placement="bottom" overlay={renderPopOver(info)}>
            <i className="material-icons" data-testid="info-trigger">
              info
            </i>
          </OverlayTrigger>
        </td>
      );
    }
  };

  return (
    <div>
      <Table size="sm" className={`${props.className || ''}`}>
        <tbody>
          {props.list.map((item, index) => (
            <tr key={index}>
              <td colSpan={item.get('info') ? 1 : 2}>{item.get('caption')}</td>
              {renderRow(item)}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
