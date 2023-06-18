import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';
import { bhlPlugin } from './document/plugins';
import { toolbarPlugin } from './toolbar/plugins';
import { IDeAIProtocol, IDict } from './token';
/**
 * Initialization data for the bacalhau_lab extension.
 */
const plugin: JupyterFrontEndPlugin<IDeAIProtocol> = {
  id: 'bacalhau_lab:plugin',
  description: 'A JupyterLab extension for Bacalhau.',
  autoStart: true,
  provides: IDeAIProtocol,
  activate: (app: JupyterFrontEnd): IDeAIProtocol => {
    console.log('JupyterLab extension bacalhau_lab is activated!');
    const deaiData: IDeAIProtocol = {
      availableProtocol: {}
    };
    requestAPI<{ payload: IDict }>()
      .then(data => {
        deaiData.availableProtocol = data.payload['availableProtocol'];
      })
      .catch(reason => {
        console.error(
          `The bacalhau_lab server extension appears to be missing.\n${reason}`
        );
      });

    return deaiData;
  }
};

export default [plugin, bhlPlugin, toolbarPlugin];
