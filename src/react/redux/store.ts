import { configureStore } from '@reduxjs/toolkit';
import sliceReducer from './slice';

export const store = configureStore({
  reducer: sliceReducer
});
export const storeFactory = () =>
  configureStore({
    reducer: sliceReducer
  });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
