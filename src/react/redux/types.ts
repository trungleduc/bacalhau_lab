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
}
