export interface IDeAIState {
  protocol?: string;
  dockerImage?: string;
  dockerFile?: string;
  availableImage: string[];
  resource: { type: string; value: string }[];
}
