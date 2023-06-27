import { ReactWidget, IThemeManager } from '@jupyterlab/apputils';
import * as React from 'react';
import { Provider } from 'react-redux';
import { storeFactory } from '../react/redux/store';
import { MainView } from '../react/mainView';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { reduxAction } from '../react/redux/slice';
import { ColorModeProvider } from '../react/provider/theme';
import { JupyterContext } from '../react/provider/jupyter';
import { ServiceManager } from '@jupyterlab/services';
import { requestAPI } from '../handler';

export class DeAIPanel extends ReactWidget {
  /**
   * Construct a `DeAIPanel`.
   *
   * @param context - The documents context.
   */
  constructor(private options: DeAIPanel.IOptions) {
    super();
    this.addClass('jp-deai-panel');
    this._store = storeFactory();
    this.options.context.ready.then(async () => {
      const state = this.options.context.model.toJSON() as any;
      const protocol = state['protocol'];
      const response = await requestAPI<{
        action: 'CREATE_SESSION';
        payload: { sessionId: string; availableImages: string[] };
      }>('', {
        method: 'POST',
        body: JSON.stringify({
          action: 'CREATE_SESSION',
          payload: protocol
        })
      });
      state['sessionId'] = response.payload.sessionId;
      state['availableImages'] = response.payload.availableImages;
      this._store.dispatch(reduxAction.load(state));
    });
  }
  dispose(): void {
    this._store.dispatch(reduxAction.reset());
    super.dispose();
  }
  render(): JSX.Element {
    return (
      <JupyterContext.Provider
        value={{
          themeManager: this.options.themeManager,
          serviceManager: this.options.serviceManager,
          context: this.options.context
        }}
      >
        <Provider store={this._store}>
          <ColorModeProvider>
            <MainView />
          </ColorModeProvider>
        </Provider>
      </JupyterContext.Provider>
    );
  }

  private _store: any;
}

namespace DeAIPanel {
  export interface IOptions {
    context: DocumentRegistry.Context;
    themeManager?: IThemeManager;
    serviceManager: ServiceManager.IManager;
  }
}
