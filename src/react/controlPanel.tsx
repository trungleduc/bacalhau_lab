import { Download, PlayCircle, Save } from '@mui/icons-material';
import { Box, Card, Container } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import StyledAccordion from './components/styledAccordion';
import { GeneralSetting } from './components/generalSetting';
import { ResourceSetting } from './components/resourceSetting';
import { useJupyter } from './provider/jupyter';
import { useAppSelector } from './redux/hooks';
import { requestAPI } from '../handler';
import { IDict } from '../token';

export function ControlPanel() {
  const jupyterContext = useJupyter();
  const docContent = useAppSelector(state => state);
  const [error, setError] = React.useState<IDict>({});
  const saveDocument = React.useCallback(async () => {
    const { context, serviceManager } = jupyterContext;
    if (!context || !serviceManager) {
      return;
    }

    const path = context.path;
    const currentFile = await serviceManager.contents.get(path);
    await serviceManager.contents.save(context.path, {
      ...currentFile,
      content: JSON.stringify(docContent, null, 2)
    });
  }, [jupyterContext, docContent]);

  const execute = React.useCallback(async () => {
    const { context, serviceManager } = jupyterContext;
    if (!context || !serviceManager) {
      return;
    }

    const path = context.path;
    const currentFile = await serviceManager.contents.get(path);
    await serviceManager.contents.save(context.path, {
      ...currentFile,
      content: JSON.stringify(docContent, null, 2)
    });

    const checked = await requestAPI<{ action: string; payload: IDict }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'CHECK_DATA',
        payload: docContent
      })
    });
    const { payload } = checked;
    const newError: IDict = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (!value?.validated) {
        newError[key] = value?.message;
      }
    });

    setError(newError);
  }, [jupyterContext, docContent]);
  return (
    <Box className="jp-deai-control-panel">
      <AppBar position="static" sx={{ marginBottom: '20px' }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, paddingLeft: '10px' }}
        >
          DeAI Request
        </Typography>
      </AppBar>
      <Container maxWidth="md" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <StyledAccordion
          title="DOCKER IMAGE"
          panel={<GeneralSetting />}
          defaultExpanded={true}
        />
        <StyledAccordion
          title="DATA SOURCES"
          panel={<ResourceSetting error={error} />}
          defaultExpanded={true}
        />
      </Container>
      <Card elevation={5}>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            label="SAVE"
            icon={<Save color="warning" />}
            onClick={saveDocument}
            sx={{ display: 'none' }}
          />
          <BottomNavigationAction
            color="primary"
            label="RUN"
            onClick={execute}
            icon={<PlayCircle color="primary" />}
          />
          <BottomNavigationAction
            color="disabled"
            disabled
            label="GET RESULT"
            icon={<Download color="disabled" />}
          />
        </BottomNavigation>
      </Card>
    </Box>
  );
}
