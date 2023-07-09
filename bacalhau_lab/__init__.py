from typing import Iterable
from .handlers import setup_handlers


def path_ipfshttpclient():
    from ipfshttpclient import client

    old_assert_version = client.assert_version

    def patched_assert_version(
        version: str,
        minimum: str = "0.0.1",
        maximum: str = "0.100.0",
        blacklist: Iterable[str] = client.VERSION_BLACKLIST,
    ) -> None:
        return old_assert_version(version, "0.0.1", maximum, blacklist)

    client.assert_version = patched_assert_version


path_ipfshttpclient()


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "bacalhau_lab"}]


def _jupyter_server_extension_points():
    return [{"module": "bacalhau_lab"}]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    setup_handlers(server_app.web_app)
    name = "bacalhau_lab"
    server_app.log.info(f"Registered {name} server extension")


# For backward compatibility with notebook server - useful for Binder/JupyterHub
load_jupyter_server_extension = _load_jupyter_server_extension
