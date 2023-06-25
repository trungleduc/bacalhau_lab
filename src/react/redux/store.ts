import { configureStore } from '@reduxjs/toolkit';
import sliceReducer from './slice';
import { pollingMiddlewareFactory } from './pollingMiddleware';

export const store = configureStore({
  reducer: sliceReducer
});
export const storeFactory = () =>
  configureStore({
    reducer: sliceReducer,
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat([pollingMiddlewareFactory()]);
    }
  });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
