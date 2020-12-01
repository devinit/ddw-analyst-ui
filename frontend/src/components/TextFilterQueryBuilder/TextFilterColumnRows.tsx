import React, { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import useCopyToClipboard from '../../utils/hooks/copy';

interface TextFilterColumnRows {
  column: string;
  key: string;
}

export const TextFilterColumnRows: FunctionComponent<TextFilterColumnRows> = ({ column }) => {
  const [isCopied, handleCopy] = useCopyToClipboard(3000);
  const copyColumnName = (columnName: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (typeof handleCopy === 'function') {
      handleCopy(`col_${columnName}`);
    }
  };

  return (
    <tr>
      <td>{column}</td>
      <td>
        <Button variant="outline-secondary" size="sm" onClick={copyColumnName(column)}>
          {isCopied ? `Copied` : 'Copy'}
        </Button>
      </td>
    </tr>
  );
};
