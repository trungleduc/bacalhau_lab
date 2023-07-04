import { IDict } from '../../token';

export interface IDeAIResource {
  type: string;
  value: string | null;
  encryption: boolean;
}
export interface IDeAIState {
  protocol?: string;
  sessionId?: string;
  dockerImage?: string;
  customDockerImage?: string;
  availableImages: string[];
  resources: IDict<IDeAIResource>;
  notebook?: IDict;
  log?: { level: 'info' | 'error'; content: string; timestamp: number }[];
  polling?: boolean;
}

export interface IJobLevelLog {
  type: 'JobLevel';
  job_state: { new: string; previous: string };
  execution_state: string;
}
export interface IExecutionLevelLog {
  type: 'ExecutionLevel';
  execution_state: { new: string; previous: string };
  job_state: string;
}
export type ILogContent = IJobLevelLog | IExecutionLevelLog;
