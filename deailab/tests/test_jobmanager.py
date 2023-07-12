import pytest
from deairequest import BacalhauProtocol, ErrorProtocol
from ..job_manager import JobManager


@pytest.fixture(scope="function")
def job_manager():
    return JobManager()


class MockLogValue:
    def to_dict(self):
        return {}


def test_job_manager(job_manager):
    assert isinstance(job_manager, JobManager)
    assert job_manager._connector_session == {}
    assert job_manager._notebooks == {}
    assert job_manager._get_result_task == {}


@pytest.mark.parametrize(
    "protocol_name,expected",
    [
        (None, None),
        ("bacalhau", BacalhauProtocol),
        ("error", ErrorProtocol),
        ("foo", ErrorProtocol),
    ],
)
def test_create_session(job_manager, protocol_name, expected):
    session_id = job_manager.create_session(protocol_name)
    if protocol_name is None:
        assert session_id is None
    else:
        session = job_manager._connector_session[session_id]
        assert isinstance(session, expected)


def test_get_session(job_manager):
    session_id = job_manager.create_session("bacalhau")
    assert isinstance(job_manager.get_session(session_id), BacalhauProtocol)
    session_id = job_manager.create_session("error")
    assert isinstance(job_manager.get_session(session_id), ErrorProtocol)


def test_add_image_to_session(job_manager, mocker):
    add_docker_image_mock = mocker.patch(
        "deairequest.BacalhauProtocol.add_docker_image"
    )
    session_id = job_manager.create_session("bacalhau")
    status, msg = job_manager.add_image_to_session(session_id, "python:3.9.17-slim")
    assert status is True
    assert msg is None
    assert add_docker_image_mock.call_count == 1


def test_add_image_to_session_missing_session(job_manager, mocker):
    add_docker_image_mock = mocker.patch(
        "deairequest.BacalhauProtocol.add_docker_image"
    )
    status, msg = job_manager.add_image_to_session("session_id", "python:3.9.17-slim")
    assert status is False
    assert msg == "Missing session"
    assert add_docker_image_mock.call_count == 0


def test_execute(job_manager, mocker):
    set_docker_image_mock = mocker.patch(
        "deairequest.BacalhauProtocol.set_docker_image"
    )
    add_dataset_mock = mocker.patch("deairequest.BacalhauProtocol.add_dataset")
    submit_job_mock = mocker.patch("deairequest.BacalhauProtocol.submit_job")

    session_id = job_manager.create_session("bacalhau")
    data = {
        "sessionId": session_id,
        "notebook": {},
        "dockerImage": "python3",
        "resources": {
            "one": {"type": "url", "value": "foo", "encryption": True},
            "two": {"type": "file", "value": "bar", "encryption": True},
        },
    }

    job_id = job_manager.execute(data)

    assert set_docker_image_mock.call_count == 1
    set_docker_image_mock.assert_called_once_with("python3")

    assert add_dataset_mock.call_count == 2

    nb_path = job_manager._notebooks.get(job_id)
    assert nb_path is not None

    assert submit_job_mock.call_count == 1
    submit_job_mock.assert_called_once_with(nb_path)


def test_clean_up(job_manager):
    job_manager._notebooks["foo"] = "bar"
    job_manager.clean_up("foo")
    assert len(job_manager._notebooks) == 0


def test_get_log(job_manager, mocker):
    get_logs_mock = mocker.patch(
        "deairequest.BacalhauProtocol.get_logs", return_value=MockLogValue()
    )
    get_state_mock = mocker.patch(
        "deairequest.BacalhauProtocol.get_state", return_value="success"
    )

    session_id = job_manager.create_session("bacalhau")
    state, log = job_manager.get_log(session_id, "job_id")
    assert state == "success"
    assert log == {}
    assert get_logs_mock.call_count == 1
    get_logs_mock.assert_called_once_with("job_id")

    assert get_state_mock.call_count == 1
    get_state_mock.assert_called_once_with("job_id")


def test_get_result(job_manager, mocker):
    get_results_mock = mocker.patch("deairequest.BacalhauProtocol.get_results")

    session_id = job_manager.create_session("bacalhau")
    res = job_manager.get_result(session_id, "job_id", "dest")
    assert res["msg"] == "Downloading result"

    assert get_results_mock.call_count == 1
    get_results_mock.assert_called_once_with("job_id", "dest")

    assert len(job_manager._get_result_task) == 1
