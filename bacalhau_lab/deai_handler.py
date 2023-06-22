import os
from typing import Dict
from deairequest import DeProtocol
from deairequest.DeProtocolSelector import DeProtocolSelector
from enum import Enum
from .tools import check_site_exist, content_from_path


class DeProtocolEnum(str, Enum):
    Bacalhau = "Bacalhau"
    Error = "Error"


def init_data():
    """_summary_

    Returns:
        _type_: _description_
    """

    data = {"availableProtocol": {}}
    for protocol in DeProtocolEnum:
        protocol: DeProtocol = DeProtocolSelector(protocol.value)
        name = protocol.get_name()
        get_docker_images = getattr(protocol, "get_docker_images", None)
        available_images = []

        if get_docker_images is not None:
            available_images = get_docker_images()

        data["availableProtocol"][name] = dict(
            availableImages=available_images,
            icon=content_from_path(protocol.get_icon()),
            ext=protocol.get_ext(),
        )
    return data


def check_data(data: Dict) -> Dict:
    resources = data.get("resources", {})
    response = {}
    MSG = "Resource is not available"
    for key, value in resources.items():
        exist = True
        item_value = value["value"]
        if item_value is None:
            response[key] = {"validated": False, "message": MSG}
        else:
            if value["type"] == "file":
                exist = os.path.exists(value["value"])
                response[key] = {"validated": exist, "message": None}
                if not exist:
                    response[key]["message"] = MSG
            elif value["type"] == "url":
                exist = check_site_exist(value["value"])

            response[key] = {"validated": exist, "message": None}
            if not exist:
                response[key]["message"] = MSG

    return response
