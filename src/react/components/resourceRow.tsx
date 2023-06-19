import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack
} from '@mui/material';
import * as React from 'react';
import { SmallTextField } from './smallTextField';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { reduxAction, selectResource } from '../redux/slice';

export function ResourceRow(props: {
  resourceId: string;
  error: string | undefined;
}) {
  const { resourceId, error } = props;
  const resource = useAppSelector(state => selectResource(state, resourceId));
  const dispatch = useAppDispatch();

  const updateResource = React.useCallback(
    (newResource: { type?: string; value?: string | null }) => {
      dispatch(
        reduxAction.updateResource({ id: resourceId, resource: newResource })
      );
    },
    [dispatch, resourceId]
  );

  const inputLabel = React.useMemo(() => {
    let label = '';
    switch (resource.type) {
      case 'ipfs':
        label = 'IPFS ID';
        break;
      case 'file':
        label = 'Path to resource';
        break;
      case 'url':
        label = 'URL';
        break;
    }
    return label;
  }, [resource]);

  const remove = React.useCallback(() => {
    dispatch(reduxAction.removeResource(resourceId));
  }, [dispatch, resourceId]);

  return (
    <Stack direction={'row'} spacing={2}>
      <FormControl sx={{ width: '20%' }} size="small">
        <InputLabel id="demo-simple-select-helper-label">
          Resource type
        </InputLabel>
        <Select
          value={resource.type}
          label="Resource type"
          sx={{
            '& .MuiInputBase-inputSizeSmall': { fontSize: '0.9rem' }
          }}
          fullWidth
          onChange={e => void updateResource({ type: e.target.value as any })}
          size="small"
        >
          <MenuItem value={'file'}>File/Directory</MenuItem>
          <MenuItem value="url">URL</MenuItem>
          <MenuItem value="ipfs">IPFS</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ width: '60%' }}>
        <SmallTextField
          value={resource.value}
          size="small"
          label={inputLabel}
          sx={{
            '& .MuiFileInput-placeholder': { fontSize: '0.9rem' }
          }}
          fullWidth
          onChange={e => void updateResource({ value: e.target.value as any })}
          error={Boolean(error)}
          helperText={error}
        />
      </FormControl>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        sx={{ width: '20%' }}
        onClick={remove}
      >
        Remove
      </Button>
    </Stack>
  );
}
