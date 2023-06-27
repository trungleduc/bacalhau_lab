from typing import Dict, Optional, Tuple
from deairequest import BacalhauProtocol, DeProtocol
from deairequest.DeProtocolSelector import DeProtocolSelector
from requests import Response
from uuid import uuid4


class JobManager:
    def __init__(self) -> None:
        self._connector_session: Dict[str, BacalhauProtocol] = {}
        self._log_stream: Dict[str, Response] = {}

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
        job_id = connector.submit_job("foo", data)
        self._connector_session[job_id] = connector
        self._log_stream[job_id] = connector.get_logs(job_id).iter_lines()
        return job_id
        # self._connectorSession[id] =

    def get_log(self, job_id: str) -> Optional[str]:
        log_stream = self._log_stream.get(job_id, None)
        if log_stream is None:
            return None
        try:
            log_line = next(log_stream)
            return log_line.decode("utf-8")
        except StopIteration:
            return None
