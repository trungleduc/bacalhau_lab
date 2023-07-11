from http import HTTPStatus
from pathlib import Path
from urllib.parse import urlparse

import requests


def content_from_path(path: str | Path) -> str:
    """_summary_

    Args:
        path (str | Path): _description_

    Returns:
        str: _description_
    """
    content = None
    try:
        with open(path) as f:
            content = f.read()
    except Exception:
        content = None
    return content


def check_site_exist(url) -> bool:
    try:
        url_parts = urlparse(url)
        request = requests.head(url_parts.geturl())
        return request.status_code == HTTPStatus.OK
    except Exception:
        return False
