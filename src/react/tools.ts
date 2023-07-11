import { requestAPI } from '../handler';
import { ILogContent } from './redux/types';

interface ILogResponse {
  action: 'GET_STATE';
  payload: { state: string; log: { events: ILogContent[] } };
}
export async function getLog(
  sessionId: string,
  jobId: string
): Promise<ILogResponse> {
  const res = await requestAPI<ILogResponse>('', {
    method: 'POST',
    body: JSON.stringify({
      action: 'GET_STATE',
      payload: { sessionId, jobId }
    })
  });
  return res;
}

interface ICleanJobResponse {
  action: 'CLEAN_JOB';
  payload: string | 1;
}
export async function cleanJob(jobId: string): Promise<ICleanJobResponse> {
  const res = await requestAPI<ICleanJobResponse>('', {
    method: 'POST',
    body: JSON.stringify({
      action: 'CLEAN_JOB',
      payload: { jobId }
    })
  });
  return res;
}

export async function checkResultStatus(
  taskId: string
): Promise<'error' | 'pending' | 'finished'> {
  const res = await requestAPI<{
    action: 'CHECK_DOWNLOAD_STATUS';
    payload: { status: 'error' | 'pending' | 'finished' };
  }>('', {
    method: 'POST',
    body: JSON.stringify({
      action: 'CHECK_DOWNLOAD_STATUS',
      payload: { taskId }
    })
  });
  return res.payload.status;
}
