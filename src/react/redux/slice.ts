import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IDeAIResource, IDeAIState } from './types';

export const INITIAL_STATE: IDeAIState = {
  protocol: undefined,
  availableImages: [],
  dockerImage: undefined,
  customDockerImage: undefined,
  resources: {},
  polling: false
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
    },
    addCustomDockerImage: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        availableImages: [...state.availableImages, action.payload],
        dockerImage: action.payload,
        customDockerImage: ''
      };
    },
    addResource: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      return {
        ...state,
        resources: {
          ...state.resources,
          [id]: { type: 'file', value: null, encryption: true }
        }
      };
    },
    removeResource: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const currentResource = { ...state.resources };
      if (currentResource[id]) {
        delete currentResource[id];
      }
      return {
        ...state,
        resources: currentResource
      };
    },
    updateResource: (
      state,
      action: PayloadAction<{
        id: string;
        resource: Partial<IDeAIResource>;
      }>
    ) => {
      const { id, resource } = action.payload;
      const currentResource = { ...state.resources };
      if (currentResource[id]) {
        const updated = { ...currentResource[id], ...resource };

        return {
          ...state,
          resources: { ...state.resources, [id]: updated }
        };
      } else {
        return { ...state };
      }
    },
    logError: (state, action: PayloadAction<string>) => {
      const currentLog = state.log ?? [];
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      return {
        ...state,
        log: [
          ...currentLog,
          { level: 'error', content: action.payload, timestamp }
        ]
      };
    },
    logInfo: (state, action: PayloadAction<string>) => {
      const currentLog = state.log ?? [];
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      return {
        ...state,
        log: [
          ...currentLog,
          { level: 'info', content: action.payload, timestamp }
        ]
      };
    },
    togglePolling: (
      state,
      action: PayloadAction<{
        startPolling: boolean;
        sessionId?: string;
        jobId?: string;
      }>
    ) => ({
      ...state,
      polling: action.payload.startPolling
    }),
    stopPolling: state => ({
      ...state,
      polling: false
    })
  }
});

export const selectResource = (
  state: IDeAIState,
  resourceId: string
): IDeAIResource => {
  return state.resources[resourceId];
};

export const reduxAction = slice.actions;

export default slice.reducer;
