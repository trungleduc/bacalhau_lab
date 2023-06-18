export interface IDeAIState {
  protocol?: string;
  dockerImage?: string;
  customDockerImage?: string;
  availableImage: string[];
  resource: { type: string; value: string }[];
}
