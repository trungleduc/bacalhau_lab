import { Stack } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { reduxAction } from '../redux/slice';
import { MuiFileInput } from 'mui-file-input';

export function GeneralSetting() {
  const [fileValue, setFileValue] = React.useState<File | null>(null);
  const dispatch = useAppDispatch();
  const handleFileChange = React.useCallback(
    (newValue: File | null) => {
      if (!newValue) {
        return;
      }
      newValue.text().then(text => {
        console.log('text', text);

        dispatch(reduxAction.setDockerFileContent(text));
      });
      setFileValue(newValue);
    },
    [dispatch]
  );
  const availableImages = useAppSelector(state => state.availableImage);
  const dockerImage = useAppSelector(state => state.dockerImage);

  const handleChange = React.useCallback(
    (e: SelectChangeEvent) => {
      dispatch(reduxAction.setDockerImage(e.target.value));
    },
    [dispatch]
  );
  return (
    <Stack spacing={2} className="jp-deai-general-setting">
      <FormControl sx={{ width: '100%' }} size="small">
        <InputLabel id="demo-simple-select-helper-label">
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
          <MenuItem value="local-image">Local image</MenuItem>
        </Select>
      </FormControl>
      <MuiFileInput
        size="small"
        placeholder={dockerImage !== 'local-image' ? 'Disabled' : ''}
        onChange={handleFileChange}
        label="Select docker file"
        disabled={dockerImage !== 'local-image'}
        sx={{ '& .MuiFileInput-placeholder': { fontSize: '0.9rem' } }}
        value={fileValue}
      />
    </Stack>
  );
}
