from http import HTTPStatus
from pathlib import Path
from urllib.parse import urlparse

import requests


def content_from_path(path: str | Path) -> str:
    """Return the string content from a resource path

    Args:
        path (str | Path): Path to resource

    Returns:
        str: String content
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
