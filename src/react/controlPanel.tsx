import { Box, Container } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import StyledAccordion from './components/styledAccordion';

export function ControlPanel() {
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
      <Container maxWidth="md">
        <StyledAccordion
          title="GENERAL SETTINGS"
          panel={
            <p>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </p>
          }
          defaultExpanded={true}
        />
        <StyledAccordion
          title="RESOURCE SETTINGS"
          panel={
            <p>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </p>
          }
          defaultExpanded={true}
        />
        <StyledAccordion
          title="ADVANCED SETTINGS"
          panel={
            <p>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </p>
          }
          defaultExpanded={true}
        />
      </Container>
    </Box>
  );
}
