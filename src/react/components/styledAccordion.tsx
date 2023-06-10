import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography
} from '@mui/material';
import * as React from 'react';

interface IProps {
  title: string;
  defaultExpanded: boolean;
  panel: JSX.Element;
}

export default function StyledAccordion(props: IProps) {
  return (
    <Box
      sx={{
        '& .MuiAccordion-root': {
          margin: '8px 0px!important'
        },
        '& .MuiAccordionSummary-content.Mui-expanded': {
          margin: '12px 0!important'
        }
      }}
    >
      <Accordion
        sx={{
          '& .MuiAccordionSummary-root.Mui-expanded': {
            minHeight: '40px'
          },
          '& .MuiAccordionSummary-root': {
            borderBottom: 'solid 1px #ddd'
          }
        }}
        defaultExpanded={props.defaultExpanded}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">{props.title}</Typography>
        </AccordionSummary>
        <AccordionDetails>{props.panel}</AccordionDetails>
      </Accordion>
    </Box>
  );
}
