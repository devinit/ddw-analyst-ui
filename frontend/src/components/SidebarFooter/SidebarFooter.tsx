import * as React from 'react';

type ComponentProps = {
  children?: React.ReactNode;
};
export const SidebarFooter: React.FC<ComponentProps> = (props) => (
  <div className="sidebar-footer">{props.children}</div>
);

export default SidebarFooter;
