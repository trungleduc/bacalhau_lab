import { ReactWidget } from '@jupyterlab/apputils';
import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from '../react/redux/store';
import { MainView } from '../react/mainView';
import { DocumentRegistry } from '@jupyterlab/docregistry';

export class DeAIPanel extends ReactWidget {
  /**
   * Construct a `DeAIPanel`.
   *
   * @param context - The documents context.
   */
  constructor(private options: { context: DocumentRegistry.Context }) {
    super();
    this.addClass('jp-deai-panel');
    this.options.context.ready.then(() => {
      console.log(this.options.context.model.toString());
    });
  }

  render(): JSX.Element {
    return (
      <Provider store={store}>
        <MainView />
      </Provider>
    );
  }
}
