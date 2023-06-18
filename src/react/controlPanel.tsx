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

export function ControlPanel() {
  const jupyterContext = useJupyter();
  const docContent = useAppSelector(state => state);

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
          title="GENERAL SETTINGS"
          panel={<GeneralSetting />}
          defaultExpanded={true}
        />
        <StyledAccordion
          title="RESOURCE SETTINGS"
          panel={<ResourceSetting />}
          defaultExpanded={true}
        />
        {/* <StyledAccordion
          title="ADVANCED SETTINGS"
          panel={
            <p>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </p>
          }
          defaultExpanded={true}
        /> */}
      </Container>
      <Card elevation={5}>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            label="SAVE"
            icon={<Save color="warning" />}
            onClick={saveDocument}
          />
          <BottomNavigationAction
            color="primary"
            label="RUN"
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
