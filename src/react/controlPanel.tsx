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
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { Contents } from '@jupyterlab/services';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { Poll } from '@lumino/polling';
import { checkResultStatus } from './tools';

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
  const sessionId = useAppSelector(state => state.sessionId);
  const jobId = useAppSelector(state => state.jobId);
  const deaiFileName = useAppSelector(state => state.deaiFileName);
  const currentDir = useAppSelector(state => state.cwd);
  const resultAvailable = useAppSelector(state => state.resultAvailable);
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
    if (executing) {
      return;
    }
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
    const nbPath = path.replace('.bhl.deai', '.ipynb');
    let nbContent: Contents.IModel | null = null;
    try {
      nbContent = await serviceManager.contents.get(nbPath);
    } catch (e) {
      await showDialog({
        title: 'Missing notebook',
        body: `The notebook ${nbPath} is missing`,
        buttons: [Dialog.okButton()]
      });
      return;
    }

    const contentWithoutLog = JSON.parse(JSON.stringify(docContent));
    delete contentWithoutLog['log'];
    if (nbContent) {
      contentWithoutLog['notebook'] = nbContent.content;
    }

    await serviceManager.contents.save(context.path, {
      ...currentFile,
      content: JSON.stringify(contentWithoutLog, null, 2)
    });

    dispatch(
      reduxAction.logInfo({ msg: `Submitting job ${path}`, reset: true })
    );
    dispatch(reduxAction.updateJobId(undefined));
    dispatch(reduxAction.updateResultStatus(false));
    setExecuting(true);

    const response = await requestAPI<{
      action: 'RESOURCE_ERROR' | 'EXECUTING' | 'EXECUTED' | 'EXECUTION_ERROR';
      payload: IDict;
    }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'EXECUTE',
        payload: contentWithoutLog
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
        dispatch(reduxAction.logError({ msg: 'Resource Error!' }));
        setError(newError);
        setExecuting(false);
        break;
      }
      case 'EXECUTING': {
        const { jobId } = payload;
        dispatch(
          reduxAction.logInfo({ msg: `Executing job with id ${jobId}` })
        );
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
  }, [
    jupyterContext,
    docContent,
    dockerImage,
    customDockerImage,
    dispatch,
    executing
  ]);
  const getResult = React.useCallback(async () => {
    if (!resultAvailable) {
      return;
    }
    const res = await requestAPI<{
      action: 'DOWNLOAD_RESULT';
      payload: { success: boolean; msg: string; task_id: string };
    }>('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'DOWNLOAD_RESULT',
        payload: { sessionId, jobId, currentDir, deaiFileName }
      })
    });

    if (res.payload.success) {
      dispatch(reduxAction.logInfo({ msg: res.payload.msg }));
      const poll = new Poll({
        frequency: { interval: 1000 },
        factory: async () => {
          const status = await checkResultStatus(res.payload.task_id);
          if (status === 'finished') {
            poll.stop();
            dispatch(
              reduxAction.logInfo({ msg: 'Result downloaded successfully' })
            );
          } else if (status === 'error') {
            poll.stop();
            dispatch(
              reduxAction.logError({ msg: 'Failed to download result' })
            );
          } else if (status === 'pending') {
            dispatch(reduxAction.logInfo({ msg: 'Download in progress' }));
          }
        }
      });
      poll.start();
    } else {
      dispatch(reduxAction.logError({ msg: res.payload.msg }));
    }
    dispatch(reduxAction.updateResultStatus(false));
  }, [dispatch, resultAvailable, jobId, currentDir, sessionId, deaiFileName]);

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
            color={resultAvailable ? 'primary' : 'disabled'}
            disabled={!resultAvailable}
            label="GET RESULT"
            icon={<Download color={resultAvailable ? 'primary' : 'disabled'} />}
            onClick={getResult}
          />
        </BottomNavigation>
      </Card>
    </Box>
  );
}
