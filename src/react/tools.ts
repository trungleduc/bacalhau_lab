import { requestAPI } from '../handler';

interface ILogResponse {
  action: 'NEW_LOG' | 'END_LOG';
  payload: string;
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
