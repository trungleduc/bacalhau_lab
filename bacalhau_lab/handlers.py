import json
import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .job_manager import JobManager

from .deai_handler import check_data, init_data


class RouteHandler(APIHandler):
    def initialize(self, **kwargs):
        self.job_manager: JobManager = kwargs.pop("job_manager")
        super().initialize(**kwargs)

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"payload": init_data()}))

    @tornado.web.authenticated
    async def post(self):
        body = self.get_json_body()
        action = body.get("action")
        payload = body.get("payload")
        if action == "EXECUTE":
            check_response = check_data(payload)
            if len(check_response) > 0:
                self.finish(
                    json.dumps({"action": "RESOURCE_ERROR", "payload": check_response})
                )
                return
            job_id = self.job_manager.execute(payload)
            self.finish(
                json.dumps({"action": "EXECUTING", "payload": {"jobId": job_id}})
            )
        if action == "GET_LOG":
            log = self.job_manager.get_log(payload)
            if log is not None:
                self.finish(json.dumps({"action": "NEW_LOG", "payload": log}))
            else:
                self.finish(json.dumps({"action": "END_LOG"}))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "bacalhau-lab")
    job_manager = JobManager()
    handlers = [(route_pattern, RouteHandler, {"job_manager": job_manager})]

    web_app.add_handlers(host_pattern, handlers)
