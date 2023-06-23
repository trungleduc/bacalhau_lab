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
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';
import { IDeAIState } from '../react/redux/types';
import { AnyAction, ThunkMiddleware } from '@reduxjs/toolkit';

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
    this.options.context.ready.then(() => {
      const state = this.options.context.model.toJSON() as any;
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

  private _store: ToolkitStore<
    IDeAIState,
    AnyAction,
    [ThunkMiddleware<IDeAIState, AnyAction>]
  >;
}

namespace DeAIPanel {
  export interface IOptions {
    context: DocumentRegistry.Context;
    themeManager?: IThemeManager;
    serviceManager: ServiceManager.IManager;
  }
}
