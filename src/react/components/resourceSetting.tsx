import { Button, Stack, Box } from '@mui/material';
import * as React from 'react';
import { ResourceRow } from './resourceRow';
import { UUID } from '@lumino/coreutils';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { reduxAction } from '../redux/slice';
import { IDict } from '../../token';

export function ResourceSetting(props: { error: IDict }) {
  const resources = useAppSelector(state => state.resources);
  const dispatch = useAppDispatch();
  const addRes = React.useCallback(() => {
    const newId = UUID.uuid4();
    dispatch(reduxAction.addResource(newId));
  }, [dispatch]);
  return (
    <Stack spacing={2} className="jp-deai-resource-setting">
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
