import os
from typing import Dict
from deairequest import BacalhauProtocol, ErrorProtocol, DeProtocol
from enum import Enum

from .tools import check_site_exist, content_from_path


class DeProtocolEnum(str, Enum):
    Bacalhau = "bacalhau"
    Error = "error"


AVAILABLE_PROTOCOLS = [BacalhauProtocol, ErrorProtocol]


def init_data():
    """_summary_

    Returns:
        _type_: _description_
    """

    data = {"availableProtocol": {}, "availableImage": []}
    for Protocol in AVAILABLE_PROTOCOLS:
        protocol: DeProtocol = Protocol()
        name = protocol.get_name()
        get_docker_images = getattr(protocol, "get_docker_images", None)
        available_images = []

        if get_docker_images is not None:
            available_images = get_docker_images()

        data["availableProtocol"][name] = dict(
            icon=content_from_path(protocol.get_icon()),
            availableImages=available_images,
        )
    return data


def check_data(data: Dict) -> Dict:
    resources = data.get("resources", {})
    response = {}
    for key, value in resources.items():
        exist = True
        if value["type"] == "file":
            exist = os.path.exists(value["value"])
            response[key] = {"validated": exist, "message": None}
            if not exist:
                response[key]["message"] = "Resource is not available"
        elif value["type"] == "url":
            exist = check_site_exist(value["value"])

        response[key] = {"validated": exist, "message": None}
        if not exist:
            response[key]["message"] = "Resource is not available"

    return response
