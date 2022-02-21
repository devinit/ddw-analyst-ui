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
  return (
    <div>
      <div>Chooser Query Builder Here</div>;
    </div>
  );
>>>>>>> 0ffec619 (Added an onClick method to the QueryBuilder)
};

export default QueryBuilderChooser;
