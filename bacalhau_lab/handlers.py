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
        if action == 'PARSE_RESOURCES':
            notebook = payload["nbContent"]
            print(notebook) # Parse the resources from notebook content
            resources = [{'type':'file', 'value':'foobar', 'encryption': True}]
            self.finish(
                json.dumps(resources)
            )
            return
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
            return
        if action == "CLEAN_JOB":
            job_id = payload["jobId"]
            try:
                self.job_manager.clean_up(job_id)
                self.finish(json.dumps({"action": "CLEAN_JOB", "payload": 1}))
            except Exception as e:
                self.finish(json.dumps({"action": "CLEAN_JOB", "payload": str(e)}))
            return

        if action == "GET_STATE":
            session_id = payload["sessionId"]
            job_id = payload["jobId"]
            state, log = self.job_manager.get_log(session_id, job_id)

            self.finish(
                json.dumps(
                    {"action": "GET_STATE", "payload": {"state": state, "log": log}}
                )
            )
            return
        if action == "CREATE_SESSION":
            session_id = self.job_manager.create_session(payload)
            session = self.job_manager.get_session(session_id)
            get_docker_images = getattr(session, "get_docker_images", None)
            available_images = []

            if get_docker_images is not None:
                available_images = get_docker_images()
            self.finish(
                json.dumps(
                    {
                        "action": "CREATE_SESSION",
                        "payload": {
                            "sessionId": session_id,
                            "availableImages": available_images,
                        },
                    }
                )
            )
            return
        if action == "CUSTOM_IMAGE":
            success, msg = self.job_manager.add_image_to_session(
                payload["sessionId"], payload["customDockerImage"]
            )

            self.finish(
                json.dumps(
                    {
                        "action": "CUSTOM_IMAGE",
                        "payload": {"success": success, "msg": msg},
                    }
                )
            )
            return


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "bacalhau-lab")
    job_manager = JobManager()
    handlers = [(route_pattern, RouteHandler, {"job_manager": job_manager})]

    web_app.add_handlers(host_pattern, handlers)
