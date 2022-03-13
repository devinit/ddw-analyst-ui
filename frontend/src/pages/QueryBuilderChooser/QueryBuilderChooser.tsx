import React, { FC, useState, useEffect } from 'react';
import * as localForage from 'localforage';
import { localForageKeys } from '../../utils';
import { Alert, Modal } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ICheckData, IRadio } from '../../components/IRadio';
import AdvancedQueryBuilder from '../AdvancedQueryBuilder/AdvancedQueryBuilder';
import QueryBuilder from '../QueryBuilder/QueryBuilder';
import { key } from 'localforage';

type SelectedQueryBuilder = 'basic' | 'advanced';

// eslint-disable-next-line @typescript-eslint/ban-types
const QueryBuilderChooser: FC<RouteComponentProps> = (props: RouteComponentProps<{}>) => {
  const [showModal, setShowModal] = useState(true);
  const [selectedOption, setSelectedOption] = useState<SelectedQueryBuilder>();

  const [token, setToken] = useState<string>();

  useEffect(() => {
    localForage
      .getItem<string>(localForageKeys.PREFERENCES)
      .then((key) => setToken(key || undefined));
  }, []);
  console.log(key);
  const toggleModal = () => setShowModal(!showModal);
  const onRadioChange = (data: ICheckData) => {
    setSelectedOption(data.value as SelectedQueryBuilder);
  };

  if (selectedOption) {
    if (selectedOption === 'basic') {
      return <QueryBuilder {...props} />;
    } else {
      return <AdvancedQueryBuilder {...props} />;
    }
  }

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
            checked={selectedOption === 'advanced'}
          />
          <Alert variant="secondary">
            <p>The Advanced Query Builder</p>
          </Alert>
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
