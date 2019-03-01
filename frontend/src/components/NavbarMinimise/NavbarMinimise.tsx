import * as React from 'react';

export const NavbarMinimise: React.SFC = () => {
  return (
    <div className="navbar-minimize">
      <button id="minimizeSidebar" className="btn btn-just-icon btn-white btn-fab btn-round">
        <i className="material-icons text_align-center visible-on-sidebar-regular">more_vert</i>
        <i className="material-icons design_bullet-list-67 visible-on-sidebar-mini">view_list</i>
      </button>
    </div>
  );
};
