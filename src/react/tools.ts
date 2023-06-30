import { requestAPI } from '../handler';

interface ILogResponse {
  action: 'GET_STATE';
  payload: { state: string; log: string };
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
