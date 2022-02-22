import React, { FC, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const QueryBuilderChooser: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState('advanced');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const history = useHistory();

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
              data-back="this is a beta version"
              name="querybuilder"
              value="basicQ"
              type="radio"
              id="basic"
              checked={isChecked === 'basicQ'}
              onChange={(e) => {
                setIsChecked(e.target.value);
              }}
              onClick={() => {
                history.push('/queries/build/');
              }}
            />
            <Form.Check
              inline
              label="Advanced Query Builder"
              name="querybuilder"
              value="advanced"
              type="radio"
              id="advance"
              checked={isChecked === 'advanced'}
              onChange={(e) => {
                setIsChecked(e.target.value);
                console.log('yesh');
              }}
              onClick={() => {
                history.push('/queries/build/advanced');
                alert('The Beta version');
              }}
              className="flip"
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
