import { Middleware } from 'redux';
import { reduxAction } from './slice';
import { IDeAIState, ILogContent } from './types';
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

    if (startPolling && sessionId && jobId && !intervalId) {
      intervalId = setInterval(async () => {
        const response = await getLog(sessionId, jobId);

        if (response.action === 'GET_STATE') {
          const { state, log } = response.payload;
          const logObject: { events: ILogContent[] } = log;
          if (state !== 'Completed' && state !== 'Error') {
            store.dispatch(reduxAction.logExecution(logObject.events));
          } else if (state === 'Completed') {
            clearInterval(intervalId);
            intervalId = null;

            store.dispatch(reduxAction.stopPolling());
            store.dispatch(reduxAction.logExecution(logObject.events));
            store.dispatch(
              reduxAction.logInfo({ msg: `Job ${jobId} finished` })
            );
            const cleanRes = await cleanJob(jobId);
            if (cleanRes.payload !== 1) {
              store.dispatch(
                reduxAction.logError({
                  msg: `Failed to clean job ${jobId}: ${cleanRes.payload}`
                })
              );
            }
            store.dispatch(reduxAction.updateResultStatus(true));
            store.dispatch(reduxAction.updateJobId(jobId));
          } else if (state === 'Error') {
            clearInterval(intervalId);
            intervalId = null;
            store.dispatch(reduxAction.stopPolling());
            store.dispatch(reduxAction.logExecution(logObject.events));
            store.dispatch(
              reduxAction.logError({ msg: `Job ${jobId} failed` })
            );
            const cleanRes = await cleanJob(jobId);
            if (cleanRes.payload !== 1) {
              store.dispatch(
                reduxAction.logError({
                  msg: `Failed to clean job ${jobId}: ${cleanRes.payload}`
                })
              );
            }
          }
        }
      }, 1000);
    } else {
      store.dispatch(reduxAction.stopPolling());
      clearInterval(intervalId);
      intervalId = null;
    }

    return next(action);
  };
  return pollingMiddleware;
}
