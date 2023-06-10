import { ReactWidget, IThemeManager } from '@jupyterlab/apputils';
import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from '../react/redux/store';
import { MainView } from '../react/mainView';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { reduxAction } from '../react/redux/slice';
import { ColorModeProvider } from '../react/provider/theme';
import { JupyterContext } from '../react/provider/jupyter';

export class DeAIPanel extends ReactWidget {
  /**
   * Construct a `DeAIPanel`.
   *
   * @param context - The documents context.
   */
  constructor(private options: DeAIPanel.IOptions) {
    super();
    this.addClass('jp-deai-panel');
    this.options.context.ready.then(() => {
      const state = this.options.context.model.toJSON() as any;
      store.dispatch(reduxAction.load(state));
    });
  }

  render(): JSX.Element {
    return (
      <JupyterContext.Provider
        value={{ themeManager: this.options.themeManager }}
      >
        <Provider store={store}>
          <ColorModeProvider>
            <MainView />
          </ColorModeProvider>
        </Provider>
      </JupyterContext.Provider>
    );
  }
}

namespace DeAIPanel {
  export interface IOptions {
    context: DocumentRegistry.Context;
    themeManager?: IThemeManager;
  }
}
