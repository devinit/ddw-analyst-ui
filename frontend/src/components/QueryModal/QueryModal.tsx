import React, { FunctionComponent, useState } from 'react';
import { Modal } from 'react-bootstrap';

export const QueryModal: FunctionComponent = () => {
  const [showModal, setShowModal] = useState(false);

  const onHideModal = () => setShowModal(false);

  return (
    <>
      <Modal show={showModal} onHide={onHideModal}>
        <p>Basic</p>
      </Modal>
    </>
  );
};
