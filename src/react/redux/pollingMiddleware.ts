import { Middleware } from 'redux';
import { reduxAction } from './slice';
import { IDeAIState } from './types';
import { getLog } from '../tools';

export function pollingMiddlewareFactory(): Middleware {
  let intervalId: any;

  const pollingMiddleware: Middleware = store => next => action => {
    if (!reduxAction.togglePolling.match(action)) {
      return next(action);
    }
    const { startPolling, jobId } = action.payload;

    const currentState: IDeAIState = store.getState();
    if (currentState.polling === startPolling) {
      next(action);
    }

    if (startPolling && jobId) {
      intervalId = setInterval(async () => {
        const response = await getLog(jobId);
        if (response.action === 'NEW_LOG') {
          store.dispatch(reduxAction.logInfo(response.payload));
        } else if (response.action === 'END_LOG') {
          clearInterval(intervalId);
          store.dispatch(reduxAction.stopPolling());
        }
      }, 1000);
    } else {
      store.dispatch(reduxAction.stopPolling());
      clearInterval(intervalId);
    }

    return next(action);
  };
  return pollingMiddleware;
}
