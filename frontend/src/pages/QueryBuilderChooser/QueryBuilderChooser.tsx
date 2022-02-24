<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import React, { FC, useState, useEffect } from 'react';
import * as localForage from 'localforage';
import { localForageKeys, api } from '../../utils';
import { Alert, Button, Modal } from 'react-bootstrap';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { ICheckData, IRadio } from '../../components/IRadio';
import { CheckBox } from '../../components/CheckBox';
import axios from 'axios';

type SelectedQueryBuilder = 'basic' | 'advanced';

// eslint-disable-next-line @typescript-eslint/ban-types
const QueryBuilderChooser: FC<RouteComponentProps> = () => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>('advanced');
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState<string>();

  const toggleModal = () => setShowModal(!showModal);
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
  };

  const history = useHistory();
  useEffect(() => {
    localForage.getItem<string>(localForageKeys.PREFERENCES).then((key) => {
      if (key) {
        if (key === 'advanced') {
          history.push('/queries/build/advanced/');
        } else {
          history.push('/queries/build/basic/');
        }
      }
      setChoice(key || undefined);
    });
  }, []);

  const handleChange = () => {
    setChecked(!checked);
  };

  const handleSave = () => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
      const userPreference = {
        preferences: selectedOption,
        global_choice: false,
      };
      axios
        .request({
          method: 'post',
          url: api.routes.USERPREFERENCE,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${token}`,
          },
          data: userPreference,
        })
        .then(() => {
          if (selectedOption || choice) {
            if (selectedOption === 'basic' || choice === 'basic') {
              history.push('/queries/build/basic/');
            } else {
              history.push('/queries/build/advanced/');
            }
          }
        })
        .catch((err) => console.log(err));
    });
    if (checked === true) {
      localForage.setItem(localForageKeys.PREFERENCES, selectedOption);
    }
  };

  return (
    <div>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your Query Builder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IRadio
            variant="danger"
            id="basic"
            name="querybuilder"
            label="Basic"
            onChange={onRadioChange}
            inline
            checked={selectedOption === 'basic'}
          />
          <Alert variant="secondary" transition>
            <p>This is a Basic Query Builder </p>
          </Alert>
          <IRadio
            variant="danger"
            id="advanced"
            name="querybuilder"
            label="Advanced"
            onChange={onRadioChange}
            inline
            checked={selectedOption === 'advanced'}
          />
          <Alert variant="secondary" transition>
            <p>This is the Advanced Query Builder, a better version with more functionalities</p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <CheckBox label="Remember choice" checked={checked} onChange={handleChange} />
          <Button onClick={handleSave}>Go to querybuilder</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
=======
import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';
// import { BasicModal } from '../../components/BasicModal';

const QueryBuilderChooser: FC<RouteComponentProps> = () => {
<<<<<<< HEAD
  return <div>Chooser Query Builder Here</div>;
>>>>>>> cb9f131d (Add QueryBuilderChooser)
=======
=======
import React, { FC, useState } from 'react';
=======
import React, { FC, useEffect, useState } from 'react';
>>>>>>> 1146ca01 (Modified the redirects and chnaged the value for id for both basic and advanced respecteively)
=======
import React, { FC, useState } from 'react';
>>>>>>> e8a7ab7c (Re-modified the method redirecting selected QueryBuilder to either Bais or Advanced Query Builder)
import { Modal, OverlayTrigger, Popover } from 'react-bootstrap';
import { ICheckData, IRadio } from '../../components/IRadio';
import { RouteComponentProps } from 'react-router-dom';

type SelectedQueryBuilder = 'basic' | 'advanced';

type QueryBuilderChooserProps = RouteComponentProps;

const QueryBuilderChooser: FC<QueryBuilderChooserProps> = (props) => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>();

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 58273d2b (Added modal to display options Basic and Advanced)
=======
  const history = useHistory();
=======
  const toggleModal = () => setShowModal(!showModal);
<<<<<<< HEAD
  const onRadioChange = (data: ICheckData) => setSelectedBtn(data.value as SelectedQueryBuilder);
>>>>>>> 515e69ba (Modal showing by default o clicking QueryBuilder)
=======
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
  };
>>>>>>> 8add03d1 (Selected QueryBuilder redirects to the selected QueryBuilder)

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> ea4b7fce (Enabled redirection of selected options to the matching QueryBuilder)
=======
=======
  useEffect(() => {
    console.log(selectedOption);
    if (selectedOption) {
      if (selectedOption === 'basic') {
        props.history.push('/queries/build/basic/');
      } else {
        props.history.push('/queries/build/advanced/');
      }
=======
  if (selectedOption) {
    if (selectedOption === 'basic') {
      props.history.push('/queries/build/basic/');
    } else {
      props.history.push('/queries/build/advanced/');
>>>>>>> e8a7ab7c (Re-modified the method redirecting selected QueryBuilder to either Bais or Advanced Query Builder)
    }
  }

>>>>>>> 1146ca01 (Modified the redirects and chnaged the value for id for both basic and advanced respecteively)
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
                id="basic"
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
                id="advanced"
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

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> d5448073 (Modified the description of options Basic or Advanced with bootstrap popovers)
  return (
    <div>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Choose your Query Builder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayTrigger trigger="focus" placement="top-end" overlay={popover1}>
            <IRadio
              variant="danger"
              id="base"
              name="querybuilder"
              label="Basic"
              onChange={onRadioChange}
              inline
              checked={selectedBtn === 'basic'}
            />
          </OverlayTrigger>
          <OverlayTrigger trigger="focus" placement="top-end" overlay={popover2}>
            <IRadio
              variant="danger"
              id="advance"
              name="querybuilder"
              label="Advanced"
              onChange={onRadioChange}
              inline
              checked={selectedBtn === 'advanced'}
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
>>>>>>> 0ffec619 (Added an onClick method to the QueryBuilder)
=======
  return <div>{selectedBtn}</div>;
>>>>>>> 1fe9bfaa (Created a route for Basic Query Builder)
=======
  return <div>{selectedOption}</div>;
>>>>>>> 8add03d1 (Selected QueryBuilder redirects to the selected QueryBuilder)
};

export default QueryBuilderChooser;
