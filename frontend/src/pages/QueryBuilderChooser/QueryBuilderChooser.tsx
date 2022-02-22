import React, { FC, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import './QueryBuilderChooser.scss';

const QueryBuilderChooser: FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <div>
      <div>Choose a Query Builder Here</div>
      <Button
        variant="link"
        onClick={() => {
          handleShow();
          console.log('click');
        }}
      >
        {' '}
        Choose{' '}
      </Button>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your Query Builder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check
              inline
              label="Basic Query Builder"
              name="querybuilder"
              type="radio"
              id="basic"
            />
            <Form.Check
              inline
              label="Advanced Query Builder"
              name="querybuilder"
              type="radio"
              id="advanced"
              checked
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <input type="checkbox" />
          <label>Remember my choice</label>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
