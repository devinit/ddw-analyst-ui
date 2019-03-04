import * as React from 'react';

export class NavbarMinimise extends React.Component {
  render() {
    return (
      <div className="navbar-minimize">
        <button className="btn btn-just-icon btn-white btn-fab btn-round" onClick={ this.onClick }>
          <i className="material-icons text_align-center visible-on-sidebar-regular">more_vert</i>
          <i className="material-icons design_bullet-list-67 visible-on-sidebar-mini">view_list</i>
        </button>
      </div>
    );
  }

  private onClick() {
    if (document.body.className.indexOf('sidebar-mini') > -1) {
      document.body.classList.remove('sidebar-mini');
    } else {
      document.body.classList.add('sidebar-mini');
    }
  }
}
