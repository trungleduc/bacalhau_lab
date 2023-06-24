import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IDeAIResource, IDeAIState } from './types';

export const INITIAL_STATE: IDeAIState = {
  protocol: undefined,
  availableImage: [],
  dockerImage: undefined,
  customDockerImage: undefined,
  resources: {}
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
    }
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
