import React, { FC, useState } from 'react';
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap';
import { ICheckData, IRadio } from '../../components/IRadio';
import { RouteComponentProps } from 'react-router-dom';

type SelectedQueryBuilder = 'basic' | 'advanced';

type QueryBuilderChooserProps = RouteComponentProps;

const QueryBuilderChooser: FC<QueryBuilderChooserProps> = (props) => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>();

  const toggleModal = () => setShowModal(!showModal);
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
    if (selectedOption === 'basic') {
      props.history.push('/queries.build/basic/');
    } else {
      props.history.push('/queries/build/advanced/');
    }
  };

  const popover1 = (
    <Popover id="popover-basic">
      <Popover.Content>Basic Query Builder</Popover.Content>
    </Popover>
  );

  const popover2 = (
    <Popover id="popover-basic">
      <Popover.Content>Advanced Query Builder (BETA)</Popover.Content>
    </Popover>
  );
  if (selectedOption === undefined) {
    return (
      <div>
        <Modal show={showModal} onHide={toggleModal}>
          <Modal.Header closeButton>
            <Modal.Title>Choose your Query Builder</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OverlayTrigger trigger="hover" placement="top-end" overlay={popover1}>
              <IRadio
                variant="danger"
                id="base"
                name="querybuilder"
                label="Basic"
                onChange={onRadioChange}
                inline
                checked={selectedOption === 'basic'}
              />
            </OverlayTrigger>
            <OverlayTrigger trigger="hover" placement="top-end" overlay={popover2}>
              <IRadio
                variant="danger"
                id="advance"
                name="querybuilder"
                label="Advanced"
                onChange={onRadioChange}
                inline
                checked={selectedOption === 'advanced'}
              />
            </OverlayTrigger>
          </Modal.Body>
          <Modal.Footer>
            <input type="checkbox" />
            <label>Remember my choice</label>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  return <div>{selectedOption}</div>;
};

export default QueryBuilderChooser;
