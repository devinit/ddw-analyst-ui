/**
 * Material Dashboard Pro File Input - https://demos.creative-tim.com/material-dashboard-pro/examples/forms/extended.html
 */
import classNames from 'classnames';
import React, { FunctionComponent, InputHTMLAttributes, useState, useRef } from 'react';
import { Button, Form, FormFileProps } from 'react-bootstrap';
import styled from 'styled-components';

interface FileInputProps extends FormFileProps, InputHTMLAttributes<HTMLInputElement> {
  onReset?: () => void;
  label?: string;
}

const StyledFormFile = styled(Form.File)`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  font-size: 23px;
  cursor: pointer;
  filter: alpha(opacity=0);
  opacity: 0;
  direction: ltr;
`;

const FileInput: FunctionComponent<FileInputProps> = ({ onReset, label, ...props }) => {
  const inputNode = useRef<HTMLInputElement | undefined>(undefined);
  const [hasFile, setHasFile] = useState(false);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (props.onChange) props.onChange(event);
    setHasFile(true);
  };
  const onRemove = (): void => {
    if (inputNode.current) {
      inputNode.current.value = '';
      if (onReset) onReset();
      setHasFile(false);
    }
  };

  return (
    <div className="fileinput fileinput-new" data-provides="fileinput">
      <div>
        <span className="btn btn-danger btn-file">
          <span className={classNames({ 'd-none': hasFile })}>{label || 'Select File'}</span>
          <span className={classNames({ 'd-none': !hasFile })}>Change File</span>
          <Form.Control type="hidden" />
          <StyledFormFile name="..." {...props} onChange={onChange} ref={inputNode} />
        </span>
        <Button variant="dark" className={classNames({ 'd-none': !hasFile })} onClick={onRemove}>
          <i className="fa fa-times"></i> Remove File
        </Button>
      </div>
    </div>
  );
};

export { FileInput };
