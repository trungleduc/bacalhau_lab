import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { reduxAction } from '../redux/slice';
import { requestAPI } from '../../handler';
import { IDict } from '../../token';

export function GeneralSetting(props: {
  error: {
    el: 'dockerSelector' | 'customImage';
    msg: string;
  } | null;
}) {
  const dispatch = useAppDispatch();
  const dockerImage = useAppSelector(state => state.dockerImage);
  const sessionId = useAppSelector(state => state.sessionId);
  const availableImages = useAppSelector(state => state.availableImages);
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

  const addCustomImage = React.useCallback(async () => {
    if (!customDockerImage || customDockerImage.length === 0) {
      return;
    }
    dispatch(reduxAction.logInfo({ msg: `Adding ${customDockerImage} image` }));
    const response = await requestAPI<{
      action: 'CUSTOM_IMAGE';
      payload: IDict;
    }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'CUSTOM_IMAGE',
        payload: { sessionId, customDockerImage }
      })
    });
    const { success, msg } = response.payload;
    if (success) {
      dispatch(reduxAction.addCustomDockerImage(customDockerImage));
      dispatch(
        reduxAction.logInfo({
          msg: `Image ${customDockerImage} added successfully`
        })
      );
    } else {
      dispatch(
        reduxAction.logError({
          msg: `Failed to add Image ${customDockerImage}: ${msg}`
        })
      );
    }
  }, [customDockerImage, sessionId, dispatch]);
  return (
    <Stack spacing={2} className="jp-deai-general-setting">
      <Typography sx={{ fontSize: '0.85rem' }}>
        Please select the Docker image which you want the Bacalhau node to use
        to run your code in.
      </Typography>
      <FormControl
        sx={{ width: '100%' }}
        size="small"
        error={props.error?.el === 'dockerSelector'}
      >
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
        <FormHelperText>
          {props.error?.el === 'dockerSelector' ? props.error?.msg ?? '' : ''}
        </FormHelperText>
      </FormControl>
      <Box
        sx={{
          display: dockerImage !== 'local-image' ? 'none' : 'flex',
          flexDirection: 'row',
          gap: '5px'
        }}
      >
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
            flexGrow: 1
          }}
          value={customDockerImage}
          error={props.error?.el === 'customImage'}
          helperText={props.error?.msg ?? ''}
        />
        <Button
          sx={{ minWidth: 100 }}
          variant="outlined"
          onClick={addCustomImage}
        >
          Add
        </Button>
      </Box>
    </Stack>
  );
}
