import { DocumentWidget } from '@jupyterlab/docregistry';
import { DeAIPanel } from './bhlDocPanel';

export class BhlDocWidget extends DocumentWidget<DeAIPanel> {
  onResize = (msg: any): void => {
    window.dispatchEvent(new Event('resize'));
  };
}
