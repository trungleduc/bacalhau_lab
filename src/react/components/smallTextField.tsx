import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const SmallTextField = styled(TextField)({
  '& .MuiInputBase-inputSizeSmall': { fontSize: '0.9rem' },
  '& .MuiInputLabel-sizeSmall': { fontSize: '0.9rem' }
});
