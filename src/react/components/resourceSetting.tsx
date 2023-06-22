import { Button, Stack, Box } from '@mui/material';
import * as React from 'react';
import { ResourceRow } from './resourceRow';
import { UUID } from '@lumino/coreutils';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { reduxAction } from '../redux/slice';
import { IDict } from '../../token';
import Typography from '@mui/material/Typography';

export function ResourceSetting(props: { error: IDict }) {
  const resources = useAppSelector(state => state.resources);
  const dispatch = useAppDispatch();
  const addRes = React.useCallback(() => {
    const newId = UUID.uuid4();
    dispatch(reduxAction.addResource(newId));
  }, [dispatch]);
  return (
    <Stack spacing={2} className="jp-deai-resource-setting">
      <Typography sx={{ fontSize: '0.85rem' }}>
        Your code will be run on a remote Bacalhau node which does not allow
        downloading data or packages. As such please include all data sources
        your code needs to have access to. They will be made available in the
        directory /inputs.
      </Typography>
      {Object.keys(resources ?? {}).map(key => (
        <ResourceRow key={key} resourceId={key} error={props.error[key]} />
      ))}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" onClick={addRes}>
          Add resource
        </Button>
      </Box>
    </Stack>
  );
}
