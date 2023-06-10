import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IDeAIState } from './types';

export const INITIAL_STATE: IDeAIState = {
  protocol: undefined
};

export const slice = createSlice({
  name: 'deAIState',
  initialState: INITIAL_STATE,
  reducers: {
    reset: state => {
      return INITIAL_STATE;
    },
    load: (state, action: PayloadAction<IDeAIState>) => ({ ...action.payload })
  }
});

export const reduxAction = slice.actions;
export default slice.reducer;
