import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IThemeManager, WidgetTracker } from '@jupyterlab/apputils';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { IBhlViewerTracker } from '../token';
import { bhlIcon } from '../utils';
import { BhlDocWidget } from './bhlDocWidget';
import { BhlDocWidgetFactory } from './widgetFactory';

export const bhlPlugin: JupyterFrontEndPlugin<IBhlViewerTracker> = {
  id: 'bhl-lab:document-plugin',
  autoStart: true,
  provides: IBhlViewerTracker,
  requires: [IRenderMimeRegistry],
  optional: [IThemeManager],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry,
    themeManager: IThemeManager
  ) => {
    const tracker = new WidgetTracker<BhlDocWidget>({
      namespace: 'bhl-lab:widgets'
    });
    const widgetFactory = new BhlDocWidgetFactory({
      name: 'DeAI',
      fileTypes: ['deai'],
      defaultFor: ['deai'],
      rendermime,
      commands: app.commands,
      themeManager,
      serviceManager: app.serviceManager
    });
    widgetFactory.widgetCreated.connect((_, widget) => {
      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
      tracker.add(widget);
    });
    app.docRegistry.addWidgetFactory(widgetFactory);
    // register the filetype
    app.docRegistry.addFileType({
      name: 'deai',
      icon: bhlIcon,
      displayName: 'DEAI',
      mimeTypes: ['text/json'],
      extensions: ['.deai', '.DEAI'],
      fileFormat: 'json',
      contentType: 'file'
    });
    return tracker;
  }
};
