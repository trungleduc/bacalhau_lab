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
        data["availableProtocol"][name] = dict(
            icon=content_from_path(protocol.get_icon()),
        )
    data["availableImage"] = [
        "tensorflow/tensorflow:latest",
        "tensorflow/tensorflow:latest-gpu",
    ]
    return data
