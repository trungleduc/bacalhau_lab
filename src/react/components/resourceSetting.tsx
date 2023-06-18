import { Button, Stack, Box } from '@mui/material';
import * as React from 'react';
import { ResourceRow } from './resourceRow';
import { IDict } from '../../token';
import { UUID } from '@lumino/coreutils';
export function ResourceSetting() {
  const [resource, setResource] = React.useState<IDict>({});
  const addRes = React.useCallback(() => {
    const newId = UUID.uuid4();
    setResource(old => ({ ...old, [newId]: 1 }));
  }, [setResource]);
  return (
    <Stack spacing={2} className="jp-deai-resource-setting">
      {Object.entries(resource).map(([key, val], idx) => (
        <ResourceRow key={key} />
      ))}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Button onClick={addRes}>Add resource</Button>
      </Box>
    </Stack>
  );
}
