import 'allotment/dist/style.css';

import { Box } from '@mui/material';
import { Allotment } from 'allotment';
import * as React from 'react';

import { ControlPanel } from './controlPanel';
import { LogPanel } from './logPanel';

export function MainView() {
  return (
    <Box component={'div'} className="jp-deai-main">
      <Allotment
        onChange={e => {
          window.dispatchEvent(new Event('resize'));
        }}
        defaultSizes={[60, 40]}
      >
        <Allotment.Pane snap={false} minSize={300}>
          <ControlPanel></ControlPanel>
        </Allotment.Pane>
        <Allotment.Pane snap={false} minSize={300}>
          <LogPanel />
        </Allotment.Pane>
      </Allotment>
    </Box>
  );
}
