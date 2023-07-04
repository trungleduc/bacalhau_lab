import { Box } from '@mui/material';
import * as React from 'react';
import { useAppSelector } from './redux/hooks';

export function LogPanel() {
  const log = useAppSelector(state => state.log);
  const divRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <Box
      className="jp-LogConsolePanel"
      sx={{ overflow: 'auto', height: '100%' }}
      ref={divRef}
    >
      {(log ?? []).length === 0 && (
        <div className="jp-LogConsoleListPlaceholder">No log messages.</div>
      )}
      {log &&
        log.map((logLine, idx: number) => (
          <Box key={idx} sx={{ display: 'flex' }}>
            <div
              className="lm-Widget jp-OutputArea-prompt jp-deai-logTimestamp"
              data-log-level={logLine.level}
            >
              <div>{new Date(logLine.timestamp).toLocaleTimeString()}</div>
            </div>
            <p className={'jp-deai-logLine'}>{logLine.content}</p>
          </Box>
        ))}
    </Box>
  );
}
