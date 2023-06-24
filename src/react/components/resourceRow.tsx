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
import { IDeAIResource } from '../redux/types';

export function ResourceRow(props: {
  resourceId: string;
  error: string | undefined;
}) {
  const { resourceId, error } = props;
  const resource = useAppSelector(state => selectResource(state, resourceId));
  const dispatch = useAppDispatch();

  const updateResource = React.useCallback(
    (newResource: Partial<IDeAIResource>) => {
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
        <InputLabel>Resource type</InputLabel>
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
      <FormControl size="small" sx={{ width: '50%' }}>
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
      <FormControl sx={{ width: '15%' }} size="small">
        <InputLabel>Encrypt data</InputLabel>
        <Select
          value={resource.encryption ? 1 : 0}
          label="Encrypt data"
          sx={{
            '& .MuiInputBase-inputSizeSmall': { fontSize: '0.9rem' }
          }}
          fullWidth
          onChange={e =>
            void updateResource({ encryption: Boolean(e.target.value) })
          }
          size="small"
        >
          <MenuItem value={1}>Yes</MenuItem>
          <MenuItem value={0}>No</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        sx={{ width: '15%' }}
        onClick={remove}
      >
        Remove
      </Button>
    </Stack>
  );
}
