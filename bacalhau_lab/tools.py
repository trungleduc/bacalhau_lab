from pathlib import Path


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
