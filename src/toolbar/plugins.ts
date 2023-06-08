import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { PathExt } from '@jupyterlab/coreutils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
  INotebookModel,
  INotebookTracker,
  NotebookPanel
} from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { CommandRegistry } from '@lumino/commands';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';
import { IDisposable } from '@lumino/disposable';

import { DeAISwitcher } from './widget';
import { IDeAIProtocol } from '../token';

/**
 * The command IDs used by the plugin.
 */
export namespace CommandIDs {
  export const bhlOpen = 'notebook:open-with-bhl';
}

class DeAIButton
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  constructor(allProtocols: IDeAIProtocol, commands: CommandRegistry) {
    this._commands = commands;
    this._allProtocols = allProtocols;
  }

  createNew(panel: NotebookPanel): IDisposable {
    const button = new DeAISwitcher(this._allProtocols, this._commands);
    panel.toolbar.insertAfter('cellType', 'bhlLab', button);
    return button;
  }

  private _commands: CommandRegistry;
  private _allProtocols: IDeAIProtocol;
}

export const toolbarPlugin: JupyterFrontEndPlugin<void> = {
  id: 'bacalhau_lab:toolbar-plugin',
  autoStart: true,
  requires: [IDeAIProtocol],
  optional: [
    INotebookTracker,
    ICommandPalette,
    ILayoutRestorer,
    ISettingRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    allProtocols: IDeAIProtocol,
    notebooks: INotebookTracker | null
  ) => {
    function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
      const widget = notebooks?.currentWidget ?? null;
      const activate = args['activate'] !== false;

      if (activate && widget) {
        app.shell.activateById(widget.id);
      }

      return widget;
    }

    function isEnabled(): boolean {
      return (
        notebooks?.currentWidget !== null &&
        notebooks?.currentWidget === app.shell.currentWidget
      );
    }
    const { commands, docRegistry } = app;

    commands.addCommand(CommandIDs.bhlOpen, {
      label: 'Open in Bacalhau Lab',
      execute: async args => {
        const current = getCurrent(args);
        if (current) {
          const nbFullPath = current.context.path;
          const fileName = PathExt.basename(nbFullPath).replace(
            PathExt.extname(nbFullPath),
            ''
          );
          const path = PathExt.dirname(nbFullPath);
          let newPath = PathExt.join(path, `${fileName}.bhl`);
          try {
            const newFile = await app.serviceManager.contents.get(newPath);

            const fileContent = JSON.parse(newFile.content);
            newPath = newFile.path;
            fileContent['protocol'] = args['protocol'];
            const content = JSON.stringify(fileContent);

            await app.serviceManager.contents.save(newPath, {
              ...newFile,
              content
            });
          } catch (e) {
            const newUntitled = await app.serviceManager.contents.newUntitled({
              path: path,
              type: 'file',
              ext: '.bhl'
            });
            await app.serviceManager.contents.save(newUntitled.path, {
              ...newUntitled,
              format: 'text',
              size: undefined,
              content: `{\n\t"protocol": "${args['protocol']}"\n}`
            });
            await app.serviceManager.contents.rename(newUntitled.path, newPath);
          }
          commands.execute('docmanager:open', {
            path: newPath
          });
        }
      },
      isEnabled
    });

    const bhlButton = new DeAIButton(allProtocols, commands);
    docRegistry.addWidgetExtension('Notebook', bhlButton);
  }
};
