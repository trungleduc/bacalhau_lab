import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import { useJupyter } from './jupyter';
import { IThemeManager } from '@jupyterlab/apputils';

interface IColorModeHandler {
  toggleColorMode: () => void;
}

const ColorModeContext = React.createContext<IColorModeHandler>({
  toggleColorMode: () => {
    throw new Error('Component is not wrapped with a ColorModeProvider.');
  }
});

function modeFromJupyter(themeManager?: IThemeManager): 'dark' | 'light' {
  return themeManager
    ? themeManager.theme === 'JupyterLab Light'
      ? 'light'
      : 'dark'
    : 'light';
}

export function ColorModeProvider(props: { children: React.ReactNode }) {
  const jupyterContext = useJupyter();
  const { themeManager } = jupyterContext;
  const fromJupyter = modeFromJupyter(themeManager);
  const [mode, setMode] = React.useState<'light' | 'dark'>(fromJupyter);
  React.useEffect(() => {
    const updateColorMode = () => {
      setMode(modeFromJupyter(themeManager));
    };
    themeManager?.themeChanged?.connect(updateColorMode);
    return () => {
      themeManager?.themeChanged?.disconnect(updateColorMode);
    };
  }, [themeManager]);
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
      }
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorModeToggle = () => {
  return React.useContext(ColorModeContext);
};
