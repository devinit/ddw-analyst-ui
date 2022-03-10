import React, { ChangeEvent, FunctionComponent, KeyboardEvent, useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';
import { FormControlElement } from '../../types/bootstrap';

interface SearchInputProps {
  onSearch?: (searchText: string) => void;
  placeholder?: string;
  className?: string;
  testid?: string;
  value?: string;
  instant?: boolean;
}

const SearchInput: FunctionComponent<SearchInputProps> = (props) => {
  const [searchText, setSearchText] = useState('');
  useEffect(() => setSearchText(props.value || ''), [props.value]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && props.onSearch) {
      event.preventDefault();
      event.stopPropagation();
      props.onSearch(searchText);
    }
  };
  const onChange = (event: ChangeEvent<FormControlElement>) => {
    setSearchText(event.currentTarget.value);
    if (props.instant && props.onSearch) props.onSearch(event.currentTarget.value);
  };

  return (
    <FormControl
      placeholder={props.placeholder}
      className={props.className}
      value={searchText}
      onChange={onChange}
      onKeyDown={onKeyDown}
      data-testid={props.testid}
    />
  );
};

SearchInput.defaultProps = { testid: 'search-input', placeholder: 'Search ...' };

export { SearchInput };
