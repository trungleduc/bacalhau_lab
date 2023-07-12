from typing import Iterable
from .handlers import setup_handlers


def patch_ipfshttpclient():
    """Monkey patch ipfshttpclient to use newer versions of the
    ipfs protocol.
    """
    from ipfshttpclient import client

    old_assert_version = client.assert_version

    def patched_assert_version(
        version: str,
        minimum: str = "0.0.1",
        maximum: str = "0.100.0",
        blacklist: Iterable[str] = client.VERSION_BLACKLIST,
    ) -> None:
        return old_assert_version(version, "0.0.1", "0.100.0", blacklist)

    client.assert_version = patched_assert_version


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "deailab"}]


def _jupyter_server_extension_points():
    return [{"module": "deailab"}]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    patch_ipfshttpclient()
    setup_handlers(server_app.web_app)
    name = "deailab"
    server_app.log.info(f"Registered {name} server extension")


# For backward compatibility with notebook server - useful for Binder/JupyterHub
load_jupyter_server_extension = _load_jupyter_server_extension
