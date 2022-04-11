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

  useEffect(() => {
    localForage.getItem<string>(localForageKeys.PREFERENCES).then((key) => {
      setChoice(key || undefined);
    });
  }, []);

  const handleSave = () => {
    localForage.getItem<string>(localForageKeys.API_KEY).then((token) => {
      const userPreference = {
        preferences: selectedOption,
        global_choice: false,
      };
      axios({
        method: 'post',
        url: api.routes.USERPREFERENCE,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${token}`,
        },
        data: userPreference,
      })
        .then(() => {
          if (selectedOption === 'basic') {
            setRedirectPage('basic');
          } else {
            setRedirectPage('advanced');
          }
        })
        .catch((err) => console.log(err));
    });
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
          <Alert variant="secondary">
            <p>The Basic Query Builder </p>
          </Alert>
          <IRadio
            variant="danger"
            id="advanced"
            name="querybuilder"
            label="Advanced"
            onChange={onRadioChange}
            inline
            checked={!checked}
          />
          <Alert variant="secondary">
            <p>The Advanced Query Builder</p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <CheckBox label="Remember choice" checked={checked} onChange={handleChange} />
          <Button onClick={handleSave}>Go to querybuilder</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QueryBuilderChooser;
