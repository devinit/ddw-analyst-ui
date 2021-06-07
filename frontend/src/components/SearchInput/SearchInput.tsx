import React, { FunctionComponent, KeyboardEvent, useEffect, useState } from 'react';
import { FormControl } from 'react-bootstrap';

interface SearchInputProps {
  onSearch?: (searchText: string) => void;
  placeholder?: string;
  className?: string;
  testid?: string;
  value?: string;
}

const SearchInput: FunctionComponent<SearchInputProps> = (props) => {
  const [searchText, setSearchText] = useState('');
  useEffect(() => setSearchText(props.value || ''), [props.value]);

  const onSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && props.onSearch) {
      event.preventDefault();
      event.stopPropagation();
      props.onSearch(searchText);
    }
  };

  return (
    <FormControl
      placeholder={props.placeholder}
      className={props.className}
      value={searchText}
      onChange={(event) => setSearchText(event.currentTarget.value)}
      onKeyDown={onSearch}
      data-testid={props.testid}
    />
  );
};

SearchInput.defaultProps = { testid: 'search-input', placeholder: 'Search ...' };

export { SearchInput };
