import { createSlice } from '@reduxjs/toolkit';
import { IDeAIState } from './types';

export const INITIAL_STATE: IDeAIState = {
  protocol: 'foobar'
};

export const slice = createSlice({
  name: 'deAIState',
  initialState: INITIAL_STATE,
  reducers: {
    reset: state => {
      return INITIAL_STATE;
    }
  }
});

export const reduxAction = slice.actions;
export default slice.reducer;
