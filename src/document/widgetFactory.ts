import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { CommandRegistry } from '@lumino/commands';

import { bhlIcon } from '../utils';
import { DeAIPanel } from './bhlDocPanel';
import { BhlDocWidget } from './bhlDocWidget';
import { IThemeManager } from '@jupyterlab/apputils';
import { ServiceManager } from '@jupyterlab/services';

export class BhlDocWidgetFactory extends ABCWidgetFactory<BhlDocWidget> {
  constructor(options: BhlDocWidgetFactory.IOptions) {
    super(options);
    this._commands = options.commands;
    this._themeManager = options.themeManager;
    this._serviceManager = options.serviceManager;
  }

  get commands(): CommandRegistry | undefined {
    return this._commands;
  }
  /**
   * Create a new widget given a context.
   *
   * @param context Contains the information of the file
   * @returns The widget
   */
  protected createNewWidget(context: DocumentRegistry.Context): BhlDocWidget {
    const content = new DeAIPanel({
      context,
      themeManager: this._themeManager,
      serviceManager: this._serviceManager
    });

    const widget = new BhlDocWidget({ context, content });
    widget.title.icon = bhlIcon;
    return widget;
  }

  private _commands?: CommandRegistry;
  private _themeManager?: IThemeManager;
  private _serviceManager: ServiceManager.IManager;
}

export namespace BhlDocWidgetFactory {
  export interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
    rendermime?: IRenderMimeRegistry;
    commands: CommandRegistry;
    themeManager?: IThemeManager;
    serviceManager: ServiceManager.IManager;
  }
}
