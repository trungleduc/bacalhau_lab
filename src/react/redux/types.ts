import { IDict } from '../../token';

export interface IDeAIResource {
  type: string;
  value: string | null;
  encryption: boolean;
}
export interface IDeAIState {
  protocol?: string;
  sessionId?: string;
  jobId?: string;
  dockerImage?: string;
  customDockerImage?: string;
  availableImages: string[];
  resources: IDict<IDeAIResource>;
  notebook?: IDict;
  log?: { level: 'info' | 'error'; content: string; timestamp: number }[];
  polling?: boolean;
  resultAvailable?: boolean;
  cwd?: string;
  deaiFileName?: string;
}

export interface IJobLevelLog {
  comment: string | null;
  type: 'JobLevel';
  job_state: { new: string; previous: string };
  execution_state: string;
}
export interface IExecutionLevelLog {
  comment: string | null;
  type: 'ExecutionLevel';
  execution_state: { new: string; previous: string };
  job_state: string;
}
export type ILogContent = IJobLevelLog | IExecutionLevelLog;
