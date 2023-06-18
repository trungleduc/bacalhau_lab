import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { MuiFileInput } from 'mui-file-input';
import * as React from 'react';
export function ResourceRow() {
  const [resType, setResType] = React.useState<string>('file');
  return (
    <Stack direction={'row'} spacing={2}>
      <FormControl sx={{ width: '25%' }} size="small">
        <InputLabel id="demo-simple-select-helper-label">
          Resource type
        </InputLabel>
        <Select
          value={resType}
          label="Resource type"
          sx={{
            '& .MuiInputBase-inputSizeSmall': { fontSize: '0.9rem' }
          }}
          fullWidth
          onChange={e => setResType(e.target.value as any)}
          size="small"
        >
          <MenuItem value={'file'}>File</MenuItem>
          <MenuItem value="url">URL</MenuItem>
          <MenuItem value="ipfs">IPFS</MenuItem>
        </Select>
      </FormControl>
      {resType === 'file' && (
        <MuiFileInput
          size="small"
          label="Select file"
          sx={{
            '& .MuiFileInput-placeholder': { fontSize: '0.9rem' },
            width: '50%'
          }}
        />
      )}
      {resType === 'url' && (
        <TextField
          size="small"
          label="Input URL"
          sx={{
            '& .MuiFileInput-placeholder': { fontSize: '0.9rem' },
            width: '50%'
          }}
        />
      )}
      {resType === 'ipfs' && (
        <TextField
          size="small"
          label="Input IPFS"
          sx={{
            '& .MuiFileInput-placeholder': { fontSize: '0.9rem' },
            width: '50%'
          }}
        />
      )}
      <Button
        variant="outlined"
        color="warning"
        size="small"
        sx={{ width: '25%' }}
      >
        Remove
      </Button>
    </Stack>
  );
}
