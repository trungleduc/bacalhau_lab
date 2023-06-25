from typing import Dict, Optional
from deairequest import BacalhauProtocol
from deairequest.DeProtocolSelector import DeProtocolSelector
from requests import Response


class JobManager:
    def __init__(self) -> None:
        self._connector_session: Dict[str, BacalhauProtocol] = {}
        self._log_stream: Dict[str, Response] = {}

    def execute(self, data: Dict) -> Optional[str]:
        protocol = data.get("protocol", None)
        if protocol is None:
            return None
        connector: BacalhauProtocol = DeProtocolSelector("Bacalhau")
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
