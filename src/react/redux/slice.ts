import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IDeAIResource, IDeAIState, ILogContent } from './types';

export const INITIAL_STATE: IDeAIState = {
  protocol: undefined,
  availableImages: [],
  dockerImage: undefined,
  customDockerImage: undefined,
  resources: {},
  polling: false,
  resultAvailable: false
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
    cleanLog: state => {
      return {
        ...state,
        log: []
      };
    },
    logError: (
      state,
      action: PayloadAction<{ msg: string; reset?: boolean }>
    ) => {
      const currentLog = state.log ?? [];
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      return {
        ...state,
        log: action.payload.reset
          ? [{ level: 'error', content: action.payload.msg, timestamp }]
          : [
              ...currentLog,
              { level: 'error', content: action.payload.msg, timestamp }
            ]
      };
    },
    logInfo: (
      state,
      action: PayloadAction<{ msg: string; reset?: boolean }>
    ) => {
      const currentLog = state.log ?? [];
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      return {
        ...state,
        log: action.payload.reset
          ? [{ level: 'info', content: action.payload.msg, timestamp }]
          : [
              ...currentLog,
              { level: 'info', content: action.payload.msg, timestamp }
            ]
      };
    },
    logExecution: (state, action: PayloadAction<ILogContent[]>) => {
      const currentLog = state.log ?? [];
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      if (action.payload.length > currentLog.length) {
        const content = [...currentLog];
        for (let idx = currentLog.length; idx < action.payload.length; idx++) {
          const element = action.payload[idx];
          let logLine = '';
          const comment = element.comment ? ` - ${element.comment}` : '';
          switch (element.type) {
            case 'JobLevel':
              logLine = `${element.type} - ${element.job_state.new}${comment}`;
              break;
            case 'ExecutionLevel':
              logLine = `${element.type} - ${element.execution_state.new}${comment}`;
              break;
            default:
              break;
          }
          content.push({
            level: 'info',
            content: logLine,
            timestamp
          });
        }

        return {
          ...state,
          log: content
        };
      } else {
        return { ...state };
      }
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
    }),
    updateResultStatus: (state, action: PayloadAction<boolean>) => {
      return { ...state, resultAvailable: action.payload };
    },
    updateJobId: (state, action: PayloadAction<string | undefined>) => {
      return { ...state, jobId: action.payload };
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
