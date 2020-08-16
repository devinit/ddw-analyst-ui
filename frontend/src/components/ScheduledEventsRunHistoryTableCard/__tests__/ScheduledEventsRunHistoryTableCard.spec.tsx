/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { cleanup, render } from '@testing-library/react';
import 'jest-styled-components';
import React from 'react';
// import axios from 'axios';
// import renderer, { act } from 'react-test-renderer';
import { ScheduledEventsRunHistoryTableCard } from '../ScheduledEventsRunHistoryTableCard';

describe('<ScheduledEventsRunHistoryTableCard', () => {
  afterEach(cleanup);
  const { container } = render(<ScheduledEventsRunHistoryTableCard />);
  it('should match snapshot', () => {
    expect(container).toMatchSnapshot();
  });

  // it('should fetch data per page on page load', async () => {
  //   const mProps = {
  //     query: 'pippo',
  //     onQueryChange: jest.fn(),
  //   };
  //   const FAKE_HITS = [{ objectID: 1, url: 'haha.com', title: 'haha' }];
  //   const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: { hits: FAKE_HITS } });
  //   let component;
  //   await act(async () => {
  //     component = renderer.create(<DisplayData {...mProps}></DisplayData>);
  //   });
  //   expect(axiosGetSpy).toBeCalledWith('http://hn.algolia.com/api/v1/search?query=pippo');
  //   expect(component.toJSON()).toMatchSnapshot();
  //   axiosGetSpy.mockRestore();
  // });
});

// it('should not fetch data when query is empty string', async () => {
//   const mProps = {
//     query: '',
//     onQueryChange: jest.fn()
//   };
//   const axiosGetSpy = jest.spyOn(axios, 'get');
//   let component;
//   await act(async () => {
//     component = renderer.create(<DisplayData {...mProps}></DisplayData>);
//   });
//   expect(axiosGetSpy).not.toBeCalled();
//   expect(component.toJSON()).toMatchSnapshot();
//   axiosGetSpy.mockRestore();
// });
