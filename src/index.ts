import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';
import { bhlPlugin } from './document/plugins';
import { toolbarPlugin } from './toolbar/plugins';
import { IDeAIProtocol, IDict } from './token';
/**
 * Initialization data for the deailab extension.
 */
const plugin: JupyterFrontEndPlugin<IDeAIProtocol> = {
  id: 'deailab:plugin',
  description: 'A JupyterLab extension for DeAI.',
  autoStart: true,
  provides: IDeAIProtocol,
  activate: (app: JupyterFrontEnd): IDeAIProtocol => {
    console.log('JupyterLab extension deailab is activated!');
    const deaiData: IDeAIProtocol = {
      availableProtocol: {}
    };
    requestAPI<{ payload: IDict }>()
      .then(data => {
        deaiData.availableProtocol = data.payload['availableProtocol'];
      })
      .catch(reason => {
        console.error(
          `The deailab server extension appears to be missing.\n${reason}`
        );
      });

    return deaiData;
  }
};

export default [plugin, bhlPlugin, toolbarPlugin];
