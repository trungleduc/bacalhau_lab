import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IDeAIState } from './types';

export const INITIAL_STATE: IDeAIState = {
  protocol: undefined,
  availableImage: [
    'tensorflow/tensorflow:latest',
    'tensorflow/tensorflow:latest-gpu'
  ],
  dockerImage: undefined,
  customDockerImage: undefined,
  resource: []
};

export const slice = createSlice({
  name: 'deAIState',
  initialState: INITIAL_STATE,
  reducers: {
    reset: state => {
      return INITIAL_STATE;
    },
    load: (state, action: PayloadAction<IDeAIState>) => ({ ...action.payload }),
    setDockerImage: (state, action: PayloadAction<string>) => {
      return { ...state, dockerImage: action.payload };
    },
    setCustomDockerImage: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      return { ...state, customDockerImage: action.payload };
    }
  }
});

export const reduxAction = slice.actions;
export default slice.reducer;
