import { Middleware } from 'redux';
import { reduxAction } from './slice';
import { IDeAIState } from './types';
import { cleanJob, getLog } from '../tools';

export function pollingMiddlewareFactory(): Middleware {
  let intervalId: any;

  const pollingMiddleware: Middleware = store => next => action => {
    if (!reduxAction.togglePolling.match(action)) {
      return next(action);
    }
    const { startPolling, sessionId, jobId } = action.payload;

    const currentState: IDeAIState = store.getState();
    if (currentState.polling === startPolling) {
      next(action);
    }

    if (startPolling && sessionId && jobId) {
      intervalId = setInterval(async () => {
        console.log('Polling');

        const response = await getLog(sessionId, jobId);
        if (response.action === 'GET_STATE') {
          const { state, log } = response.payload;
          if (state !== 'Completed') {
            store.dispatch(reduxAction.logInfo(log));
          } else {
            clearInterval(intervalId);
            store.dispatch(reduxAction.stopPolling());
            store.dispatch(reduxAction.logInfo(`Job ${jobId} finished`));
            const cleanRes = await cleanJob(jobId);
            if (cleanRes.payload !== 1) {
              store.dispatch(
                reduxAction.logError(
                  `Failed to clean job ${jobId}: ${cleanRes.payload}`
                )
              );
            }
          }
        }
      }, 500);
    } else {
      store.dispatch(reduxAction.stopPolling());
      clearInterval(intervalId);
    }

    return next(action);
  };
  return pollingMiddleware;
}
