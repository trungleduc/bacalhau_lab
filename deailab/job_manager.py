import json
import os
import tempfile
import threading
from typing import Dict, Optional, Tuple
from deairequest import BacalhauProtocol, DeProtocol
from deairequest.DeProtocolSelector import DeProtocolSelector
from uuid import uuid4


class JobManager:
    def __init__(self) -> None:
        """Class to manage the connectors"""
        self._connector_session: Dict[str, BacalhauProtocol] = {}
        self._notebooks = {}
        self._get_result_task = {}

    def create_session(self, protocol_name: str) -> str:
        """Create a connector session with the requested protocol

        Args:
            protocol_name (str): The connector protocol

        Returns:
            str: id of created session.
        """
        session_id = str(uuid4())
        if protocol_name is None:
            return None
        connector = DeProtocolSelector(protocol_name.capitalize())
        self._connector_session[session_id] = connector

        return session_id

    def get_session(self, session_id: str) -> Optional[DeProtocol]:
        """Get the connector session from its id

        Args:
            session_id (str): _description_

        Returns:
            Optional[DeProtocol]: _description_
        """
        return self._connector_session.get(session_id)

    def add_image_to_session(
        self, session_id: str, image_name: str
    ) -> Tuple[bool, str]:
        """Add custom docker image to a connector session

        Args:
            session_id (str): Id of the session
            image_name (str): Name of docker image

        Returns:
            Tuple[bool, str]: Operation result and error message.
        """
        session = self._connector_session.get(session_id)
        if session is None:
            return False, "Missing session"
        try:
            session.add_docker_image(image_name)
            return True, None
        except Exception as e:
            return False, str(e)

    def execute(self, data: Dict) -> Optional[str]:
        """Execute session with input data

        Args:
            data (Dict): Execution data

        Returns:
            Optional[str]: Job Id
        """
        session_id = data.get("sessionId")
        connector = self._connector_session.get(session_id)
        if connector is None:
            return
        # Save notebook to a temp file
        notebook = data.get("notebook", None)
        if notebook is None:
            return
        nb_handler, nb_path = tempfile.mkstemp(prefix=session_id, suffix=".ipynb")
        with os.fdopen(nb_handler, "w") as f:
            json.dump(notebook, f)

        # Set docker image
        docker_image = data.get("dockerImage", None)
        if docker_image is None:
            return
        connector.set_docker_image(docker_image)

        # Set resources
        connector.remove_datasets()
        resources = data.get("resources", {})

        for resource in resources.values():
            res_type = resource["type"]
            res_value = resource["value"]
            encrypted = resource["encryption"]
            data_type = None
            if res_type == "file":
                if os.path.isfile(res_value):
                    data_type = connector.get_file_data_type()
                else:
                    data_type = connector.get_directory_data_type()
            elif res_type == "url":
                data_type = connector.get_url_data_type()
            elif res_type == "ipfs":
                data_type = connector.get_ipfs_data_type()
            if data_type is not None:
                connector.add_dataset(
                    type=data_type,
                    value=res_value,
                    encrypted=encrypted,
                )
        job_id = connector.submit_job(nb_path)

        self._notebooks[job_id] = nb_path
        return job_id

    def clean_up(self, job_id: str):
        """Remove the notebook created by the execution

        Args:
            job_id (str): Id of the connector session
        """
        nb_path = self._notebooks.pop(job_id, None)
        if nb_path and os.path.exists(nb_path):
            os.remove(nb_path)

    def remove_session(self, session_id):
        """Remove a connector session

        Args:
            session_id (_type_): Id of the connector session
        """
        self._connector_session.pop(session_id, None)

    def get_log(self, session_id: str, job_id: str) -> Tuple[str, str]:
        """Get execution log of a job in a session

        Args:
            session_id (str): Id of the connector session
            job_id (str): Id of the job

        Returns:
            Optional[str]: Return the state and log of the job
        """
        connector = self._connector_session.get(session_id)
        if connector is None:
            return None, None
        log_str = connector.get_logs(job_id)
        state = connector.get_state(job_id)
        log = log_str.to_dict()
        return state, log

    def get_download_status(self, task_id: str) -> str:
        """Get download status

        Args:
            task_id (str): Id of the download task

        Returns:
            str: Status of the process
        """
        return self._get_result_task.get(task_id, "error")

    def get_result(self, session_id: str, job_id: str, dest: str) -> Dict:
        """Get the result of the executed job

        Args:
            session_id (str): Id of the connector session
            job_id (str): Id of the job
            dest (str): Path to save the result data.

        Returns:
            Dict: Task id and log message.
        """
        if not os.path.exists(dest):
            os.makedirs(dest)
        session = self.get_session(session_id)
        if session is None:
            return {"task_id": None, "msg": "Missing session"}
        task_id = f"get_result::{uuid4()}"
        self._get_result_task[task_id] = "pending"

        def thread_task():
            session.get_results(job_id, dest)
            self._get_result_task[task_id] = "finished"

        x = threading.Thread(target=thread_task)
        x.start()
        return {"task_id": task_id, "msg": "Downloading result"}
