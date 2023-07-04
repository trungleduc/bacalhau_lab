import { Download, PlayCircle, Save } from '@mui/icons-material';
import { Box, Card, Container } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import StyledAccordion from './components/styledAccordion';
import { GeneralSetting } from './components/generalSetting';
import { ResourceSetting } from './components/resourceSetting';
import { useJupyter } from './provider/jupyter';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { requestAPI } from '../handler';
import { IDict } from '../token';
import { reduxAction } from './redux/slice';
import { ILogContent } from './redux/types';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
export function ControlPanel() {
  const jupyterContext = useJupyter();
  const docContent = useAppSelector(state => state);
  const { dockerImage, customDockerImage } = docContent;
  const [error, setError] = React.useState<IDict>({});
  const [executing, setExecuting] = React.useState(false);
  const [dockerError, setDockerError] = React.useState<{
    el: 'dockerSelector' | 'customImage';
    msg: string;
  } | null>(null);
  const dispatch = useAppDispatch();
  const polling = useAppSelector(state => state.polling);
  React.useEffect(
    () => () => {
      dispatch(reduxAction.togglePolling({ startPolling: false }));
    },
    [dispatch]
  );
  React.useEffect(() => {
    if (!polling) {
      setExecuting(false);
    }
  }, [polling, setExecuting]);
  React.useEffect(() => {
    if (dockerImage && dockerImage !== 'local-image') {
      setDockerError(null);
      return;
    }
    if (
      dockerImage === 'local-image' &&
      customDockerImage &&
      customDockerImage.length > 0
    ) {
      setDockerError(null);
      return;
    }
  }, [dockerImage, customDockerImage]);
  const saveDocument = React.useCallback(async () => {
    const { context, serviceManager } = jupyterContext;
    if (!context || !serviceManager) {
      return;
    }

    const path = context.path;
    const currentFile = await serviceManager.contents.get(path);
    await serviceManager.contents.save(context.path, {
      ...currentFile,
      content: JSON.stringify(docContent, null, 2)
    });
  }, [jupyterContext, docContent]);

  const execute = React.useCallback(async () => {
    if (!dockerImage || dockerImage.length === 0) {
      setDockerError({ el: 'dockerSelector', msg: 'Missing image' });
      return;
    }
    if (
      dockerImage === 'local-image' &&
      (!customDockerImage || customDockerImage.length === 0)
    ) {
      setDockerError({ el: 'customImage', msg: 'Missing image' });
      return;
    }
    const { context, serviceManager } = jupyterContext;
    if (!context || !serviceManager) {
      return;
    }

    const path = context.path;
    const currentFile = await serviceManager.contents.get(path);
    const contentWithoutLog = JSON.parse(JSON.stringify(docContent));
    delete contentWithoutLog['log'];
    await serviceManager.contents.save(context.path, {
      ...currentFile,
      content: JSON.stringify(contentWithoutLog, null, 2)
    });
    dispatch(reduxAction.logInfo(`Submitting job ${path}`));
    setExecuting(true);
    const response = await requestAPI<{
      action: 'RESOURCE_ERROR' | 'EXECUTING' | 'EXECUTED' | 'EXECUTION_ERROR';
      payload: IDict;
    }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'EXECUTE',
        payload: docContent
      })
    });

    const { action, payload } = response;
    const sessionId = docContent['sessionId'];
    switch (action) {
      case 'RESOURCE_ERROR': {
        const newError: IDict = {};
        Object.entries(payload).forEach(([key, value]) => {
          if (!value?.validated) {
            newError[key] = value?.message;
          }
        });
        dispatch(reduxAction.logError('Resource Error!'));
        setError(newError);
        break;
      }
      case 'EXECUTING': {
        const { jobId } = payload;
        dispatch(reduxAction.logInfo(`Executing job with id ${jobId}`));
        dispatch(
          reduxAction.togglePolling({ startPolling: true, sessionId, jobId })
        );
        break;
      }

      case 'EXECUTION_ERROR':
        break;
      default:
        break;
    }
  }, [jupyterContext, docContent, dockerImage, customDockerImage, dispatch]);
  const getResult = React.useCallback(async () => {
    const log = {
      events: [
        {
          comment: 'Job created',
          compute_reference: 'None',
          execution_state: 'None',
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: { new: 'None', previous: 'None' },
          new_version: 1,
          node_id: 'None',
          time: '2023-07-02T21:26:34.549307149Z',
          type: 'JobLevel'
        },
        {
          comment: 'None',
          compute_reference: 'None',
          execution_state: 'None',
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: { new: 'Queued', previous: 'None' },
          new_version: 2,
          node_id: 'None',
          time: '2023-07-02T21:26:34.549313463Z',
          type: 'JobLevel'
        },
        {
          comment: 'None',
          compute_reference: 'None',
          execution_state: 'None',
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: { new: 'None', previous: 'Queued' },
          new_version: 3,
          node_id: 'None',
          time: '2023-07-02T21:26:34.693673117Z',
          type: 'JobLevel'
        },
        {
          comment: 'None',
          compute_reference: 'None',
          execution_state: 'None',
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: { new: 'InProgress', previous: 'None' },
          new_version: 4,
          node_id: 'None',
          time: '2023-07-02T21:26:34.69441838Z',
          type: 'JobLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-2786f4d5-15a0-45c6-b1a1-ae4f0fee1db4',
          execution_state: {
            new: 'AskForBidAccepted',
            previous: 'AskForBid'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 2,
          node_id: 'QmUDAXvv31WPZ8U9CzuRTMn9iFGiopGE7rHiah1X8a6PkT',
          time: '2023-07-02T21:26:34.699931349Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-2786f4d5-15a0-45c6-b1a1-ae4f0fee1db4',
          execution_state: { new: 'AskForBid', previous: 'None' },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 1,
          node_id: 'QmUDAXvv31WPZ8U9CzuRTMn9iFGiopGE7rHiah1X8a6PkT',
          time: '2023-07-02T21:26:34.699931349Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-857e04f4-a618-4c91-b5dc-7db5ff2fbb42',
          execution_state: { new: 'AskForBid', previous: 'None' },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 1,
          node_id: 'QmYgxZiySj3MRkwLSL4X2MF5F9f2PMhAE3LV49XkfNL1o3',
          time: '2023-07-02T21:26:34.699957842Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-857e04f4-a618-4c91-b5dc-7db5ff2fbb42',
          execution_state: {
            new: 'AskForBidAccepted',
            previous: 'AskForBid'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 2,
          node_id: 'QmYgxZiySj3MRkwLSL4X2MF5F9f2PMhAE3LV49XkfNL1o3',
          time: '2023-07-02T21:26:34.699957842Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-5885718a-f53e-4070-8b4c-b601c5a8bc02',
          execution_state: { new: 'AskForBid', previous: 'None' },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 1,
          node_id: 'QmXaXu9N5GNetatsvwnTfQqNtSeKAD6uCmarbh3LMRYAcF',
          time: '2023-07-02T21:26:34.699968891Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-5885718a-f53e-4070-8b4c-b601c5a8bc02',
          execution_state: {
            new: 'AskForBidAccepted',
            previous: 'AskForBid'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 2,
          node_id: 'QmXaXu9N5GNetatsvwnTfQqNtSeKAD6uCmarbh3LMRYAcF',
          time: '2023-07-02T21:26:34.699968891Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-857e04f4-a618-4c91-b5dc-7db5ff2fbb42',
          execution_state: {
            new: 'BidAccepted',
            previous: 'AskForBidAccepted'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 3,
          node_id: 'QmYgxZiySj3MRkwLSL4X2MF5F9f2PMhAE3LV49XkfNL1o3',
          time: '2023-07-02T21:26:34.789324447Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-857e04f4-a618-4c91-b5dc-7db5ff2fbb42',
          execution_state: {
            new: 'WaitingVerification',
            previous: 'BidAccepted'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 4,
          node_id: 'QmYgxZiySj3MRkwLSL4X2MF5F9f2PMhAE3LV49XkfNL1o3',
          time: '2023-07-02T21:26:34.789558264Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-5885718a-f53e-4070-8b4c-b601c5a8bc02',
          execution_state: {
            new: 'BidRejected',
            previous: 'AskForBidAccepted'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 3,
          node_id: 'QmXaXu9N5GNetatsvwnTfQqNtSeKAD6uCmarbh3LMRYAcF',
          time: '2023-07-02T21:26:35.017846724Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-2786f4d5-15a0-45c6-b1a1-ae4f0fee1db4',
          execution_state: {
            new: 'BidRejected',
            previous: 'AskForBidAccepted'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 3,
          node_id: 'QmUDAXvv31WPZ8U9CzuRTMn9iFGiopGE7rHiah1X8a6PkT',
          time: '2023-07-02T21:26:36.353084342Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-857e04f4-a618-4c91-b5dc-7db5ff2fbb42',
          execution_state: {
            new: 'ResultAccepted',
            previous: 'WaitingVerification'
          },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 5,
          node_id: 'QmYgxZiySj3MRkwLSL4X2MF5F9f2PMhAE3LV49XkfNL1o3',
          time: '2023-07-02T21:26:37.349325381Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'e-857e04f4-a618-4c91-b5dc-7db5ff2fbb42',
          execution_state: { new: 'Completed', previous: 'ResultAccepted' },
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: 'None',
          new_version: 6,
          node_id: 'QmYgxZiySj3MRkwLSL4X2MF5F9f2PMhAE3LV49XkfNL1o3',
          time: '2023-07-02T21:26:37.349400968Z',
          type: 'ExecutionLevel'
        },
        {
          comment: 'None',
          compute_reference: 'None',
          execution_state: 'None',
          job_id: 'b57d8847-76fb-4a64-a107-b5435b1f78e6',
          job_state: { new: 'Completed', previous: 'InProgress' },
          new_version: 5,
          node_id: 'None',
          time: '2023-07-02T21:26:37.355106091Z',
          type: 'JobLevel'
        }
      ]
    };
    dispatch(reduxAction.logExecution(log.events as ILogContent[]));
  }, [dispatch]);
  return (
    <Box className="jp-deai-control-panel">
      <AppBar position="static" sx={{ marginBottom: '20px' }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, paddingLeft: '10px' }}
        >
          DeAI Request
        </Typography>
      </AppBar>
      <Container maxWidth="md" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <StyledAccordion
          title="DOCKER IMAGE"
          panel={<GeneralSetting error={dockerError} />}
          defaultExpanded={true}
        />
        <StyledAccordion
          title="DATA SOURCES"
          panel={<ResourceSetting error={error} />}
          defaultExpanded={true}
        />
      </Container>
      <Card elevation={5}>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            label="SAVE"
            icon={<Save color="warning" />}
            onClick={saveDocument}
            sx={{ display: 'none' }}
          />
          <BottomNavigationAction
            color="primary"
            label="RUN"
            onClick={execute}
            icon={
              executing ? (
                <PauseCircleIcon color="primary" />
              ) : (
                <PlayCircle color="primary" />
              )
            }
          />
          <BottomNavigationAction
            // color="disabled"
            // disabled
            label="GET RESULT"
            icon={<Download color="disabled" />}
            onClick={getResult}
          />
        </BottomNavigation>
      </Card>
    </Box>
  );
}
