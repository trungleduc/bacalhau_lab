from deairequest import BacalhauProtocol, ErrorProtocol, DeProtocol
from enum import Enum

from .tools import content_from_path


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
