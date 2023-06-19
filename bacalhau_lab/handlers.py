import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

from .deai_handler import check_data, init_data


class RouteHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"payload": init_data()}))

    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        action = body.get("action")
        payload = body.get("payload")
        if action == "CHECK_DATA":
            res_payload = check_data(payload)
            self.finish(json.dumps({"action": "CHECK_DATA", "payload": res_payload}))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "bacalhau-lab")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
