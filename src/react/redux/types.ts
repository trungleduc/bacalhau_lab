import { IDict } from '../../token';

export interface IDeAIState {
  protocol?: string;
  dockerImage?: string;
  customDockerImage?: string;
  availableImage: string[];
  resources: IDict<{ type: string; value: string | null }>;
}
