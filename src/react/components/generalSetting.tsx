import { Stack, TextField, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { reduxAction } from '../redux/slice';

export function GeneralSetting() {
  const dispatch = useAppDispatch();
  const dockerImage = useAppSelector(state => state.dockerImage);
  const availableImages = useAppSelector(state => state.availableImage);
  const customDockerImage = useAppSelector(state => state.customDockerImage);

  const handleCustomImageChange = React.useCallback(
    (newValue: string) => {
      dispatch(reduxAction.setCustomDockerImage(newValue));
    },
    [dispatch]
  );

  const handleChange = React.useCallback(
    (e: SelectChangeEvent) => {
      const newVal = e.target.value;
      dispatch(reduxAction.setDockerImage(newVal));
      if (newVal !== 'local-image') {
        dispatch(reduxAction.setCustomDockerImage(''));
      }
    },
    [dispatch]
  );
  return (
    <Stack spacing={2} className="jp-deai-general-setting">
      <Typography sx={{ fontSize: '0.85rem' }}>
        Please select the Docker image which you want the Bacalhau node to use
        to run your code in.
      </Typography>
      <FormControl sx={{ width: '100%' }} size="small">
        <InputLabel
          id="demo-simple-select-helper-label"
          sx={{ fontSize: '0.9rem' }}
        >
          Select docker image
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={dockerImage ?? ''}
          label="Select docker image"
          fullWidth={true}
          sx={{ '& .MuiInputBase-inputSizeSmall': { fontSize: '0.9rem' } }}
          onChange={handleChange}
        >
          {availableImages.map((value, idx) => (
            <MenuItem key={value + idx} value={value}>
              {value}
            </MenuItem>
          ))}
          <MenuItem value="local-image">Custom image</MenuItem>
        </Select>
      </FormControl>
      <TextField
        InputLabelProps={{ shrink: true }}
        size="small"
        onChange={e => handleCustomImageChange(e.target.value)}
        label={dockerImage !== 'local-image' ? 'Disabled' : 'Custom image'}
        placeholder="Docker image name"
        disabled={dockerImage !== 'local-image'}
        sx={{
          '& .MuiInputBase-inputSizeSmall': { fontSize: '0.9rem' },
          '& .MuiInputLabel-sizeSmall': { fontSize: '0.9rem' },
          display: dockerImage !== 'local-image' ? 'none' : 'flex'
        }}
        value={customDockerImage}
      />
    </Stack>
  );
}
