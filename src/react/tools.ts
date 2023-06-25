import { requestAPI } from '../handler';

interface ILogResponse {
  action: 'NEW_LOG' | 'END_LOG';
  payload: string;
}
export async function getLog(jobId: string): Promise<ILogResponse> {
  const res = await requestAPI<ILogResponse>('', {
    method: 'POST',
    body: JSON.stringify({
      action: 'GET_LOG',
      payload: jobId
    })
  });
  return res;
}
