import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { ChangePasswordForm } from '../ChangePasswordForm';

export const AccountModal = () => {
  return (
    <React.Fragment>
      <Modal.Header closeButton>
        <Modal.Title>Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body><ChangePasswordForm/></Modal.Body>
    </React.Fragment>
  );
};

export default AccountModal;
