import { IDict } from '../../token';

export interface IDeAIResource {
  type: string;
  value: string | null;
  encryption: boolean;
}
export interface IDeAIState {
  protocol?: string;
  dockerImage?: string;
  customDockerImage?: string;
  availableImage: string[];
  resources: IDict<IDeAIResource>;
  notebook?: IDict;
  log?: { level: 'info' | 'error'; content: string; timestamp: number }[];
  polling?: boolean;
}
