import json
import os
import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .job_manager import JobManager

from .deai_handler import check_data, init_data


class RouteHandler(APIHandler):
    """Custom handler for the extension"""

    def initialize(self, **kwargs):
        """Initialize the handler"""

        self.job_manager: JobManager = kwargs.pop("job_manager")
        super().initialize(**kwargs)

    @tornado.web.authenticated
    def get(self):
        """Return the initialized data to the GET request."""
        self.finish(json.dumps({"payload": init_data()}))

    @tornado.web.authenticated
    async def post(self):
        """Handler for the POST request"""

        body = self.get_json_body()
        action = body.get("action")
        payload = body.get("payload")
        if action == "PARSE_RESOURCES":
            # Parse the resources from notebook content in payload["nbContent"]
            resources = []
            server_root_dir = os.path.abspath(self.settings["serverapp"].root_dir)
            cwd = os.path.join(server_root_dir, payload["currentPath"])

            self.finish(json.dumps({"resources": resources, "cwd": cwd}))
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
        if action == "CHECK_DOWNLOAD_STATUS":
            task_id = payload.get("taskId")
            status = self.job_manager.get_download_status(task_id)
            self.finish(
                json.dumps(
                    {"action": "CHECK_DOWNLOAD_STATUS", "payload": {"status": status}}
                )
            )
            return
        if action == "DOWNLOAD_RESULT":
            session_id = payload.get("sessionId")
            job_id = payload.get("jobId")
            current_dir = payload.get("currentDir")
            deai_file_name = payload.get("deaiFileName")
            if (
                session_id is not None
                and job_id is not None
                and current_dir is not None
                and deai_file_name is not None
            ):
                dest = os.path.join(current_dir, deai_file_name)
                response = self.job_manager.get_result(session_id, job_id, dest)
                if response["task_id"] is None:
                    self.finish(
                        json.dumps(
                            {
                                "action": "DOWNLOAD_RESULT",
                                "payload": {
                                    "success": False,
                                    "msg": response["msg"],
                                },
                            }
                        )
                    )
                    return
                self.finish(
                    json.dumps(
                        {
                            "action": "DOWNLOAD_RESULT",
                            "payload": {
                                "success": True,
                                "msg": response["msg"],
                                "task_id": response["task_id"],
                            },
                        }
                    )
                )
                return


def setup_handlers(web_app):
    """Add custom handler to the Jupyter web app"""
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "bacalhau-lab")
    job_manager = JobManager()
    handlers = [(route_pattern, RouteHandler, {"job_manager": job_manager})]

    web_app.add_handlers(host_pattern, handlers)
