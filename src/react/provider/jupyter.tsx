import { IThemeManager } from '@jupyterlab/apputils';
import * as React from 'react';

interface IJupyterContext {
  themeManager?: IThemeManager;
}

export const JupyterContext = React.createContext<IJupyterContext>({
  themeManager: undefined
});

export const useJupyter = () => {
  return React.useContext(JupyterContext);
};
