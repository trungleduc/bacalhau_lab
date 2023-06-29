import json
import os
import tempfile
from typing import Dict, Optional, Tuple
from deairequest import BacalhauProtocol, DeProtocol
from deairequest.DeProtocolSelector import DeProtocolSelector
from requests import Response
from uuid import uuid4


class JobManager:
    def __init__(self) -> None:
        self._connector_session: Dict[str, BacalhauProtocol] = {}
        self._log_stream: Dict[str, Response] = {}
        self._notebooks = {}

    def create_session(self, protocol_name: str) -> str:
        session_id = str(uuid4())
        if protocol_name is None:
            return None
        connector = DeProtocolSelector(protocol_name.capitalize())
        self._connector_session[session_id] = connector

        return session_id

    def get_session(self, session_id: str) -> Optional[DeProtocol]:
        return self._connector_session.get(session_id)

    def add_image_to_session(
        self, session_id: str, image_name: str
    ) -> Tuple[bool, str]:
        session = self._connector_session.get(session_id)
        if session is None:
            return False, "Missing session"
        try:
            session.add_docker_image(image_name)
            return True, None
        except Exception as e:
            return False, str(e)

    def execute(self, data: Dict) -> Optional[str]:
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
        resources = data.get("resources", {})
        for resource in resources.values():
            res_type = resource["type"]
            res_value = resource["value"]
            encrypted = res_type["encryption"]
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
        self._log_stream[job_id] = connector.get_logs(job_id).iter_content(
            chunk_size=1024
        )
        return job_id
        # self._connectorSession[id] =

    def clean_up(self, job_id: str):
        nb_path = self._notebooks.pop(job_id, None)
        if nb_path and os.path.exists(nb_path):
            os.remove(nb_path)

        self._log_stream.pop(job_id, None)

    def remove_session(self, session_id):
        self._connector_session.pop(session_id, None)

    def get_log(self, session_id: str, job_id: str) -> Optional[str]:
        connector = self._connector_session.get(session_id)
        log_stream = self._log_stream.get(job_id, None)
        if connector is None or log_stream is None:
            return None, None
        state = connector.get_state(job_id)
        log = None
        try:
            log_line = next(log_stream)
            log = log_line.decode("utf-8")
        except StopIteration:
            pass
        return state, log
