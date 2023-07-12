import json


async def test_get_example(jp_fetch):
    response = await jp_fetch("bacalhau-lab")
    assert response.code == 200
    data = json.loads(response.body.decode())
    assert "Bacalhau" in data["payload"]["availableProtocol"]


async def test_parse_resources(jp_fetch):
    body = {
        "action": "PARSE_RESOURCES",
        "payload": {"nbContent": {}, "currentPath": ""},
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    data = json.loads(response.body.decode())
    assert data["resources"] == []


async def test_execute(jp_fetch, mocker):
    execute_mock = mocker.patch(
        "deailab.job_manager.JobManager.execute", return_value="job_id"
    )
    body = {"action": "EXECUTE", "payload": {"foo": "bar"}}
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert execute_mock.call_count == 1
    execute_mock.assert_called_once_with({"foo": "bar"})
    data = json.loads(response.body.decode())
    assert data["payload"] == {"jobId": "job_id"}


async def test_execute_resource_error(jp_fetch, mocker):
    execute_mock = mocker.patch(
        "deailab.job_manager.JobManager.execute", return_value="job_id"
    )
    body = {
        "action": "EXECUTE",
        "payload": {
            "resources": {"one": {"type": "url", "value": "foo", "encryption": True}}
        },
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert execute_mock.call_count == 0
    data = json.loads(response.body.decode())
    assert data["action"] == "RESOURCE_ERROR"


async def test_clean_job(jp_fetch, mocker):
    clean_up_mock = mocker.patch("deailab.job_manager.JobManager.clean_up")
    body = {
        "action": "CLEAN_JOB",
        "payload": {"jobId": "jobId"},
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert clean_up_mock.call_count == 1
    clean_up_mock.assert_called_once_with("jobId")
    data = json.loads(response.body.decode())
    assert data["payload"] == 1


async def test_get_state(jp_fetch, mocker):
    get_state_mock = mocker.patch(
        "deailab.job_manager.JobManager.get_log", return_value=("state", {})
    )
    body = {
        "action": "GET_STATE",
        "payload": {"sessionId": "sessionId", "jobId": "jobId"},
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert get_state_mock.call_count == 1
    get_state_mock.assert_called_once_with("sessionId", "jobId")
    data = json.loads(response.body.decode())
    assert data["payload"] == {"state": "state", "log": {}}


async def test_create_session(jp_fetch, mocker):
    create_session_mock = mocker.patch(
        "deailab.job_manager.JobManager.create_session", return_value="sessionId"
    )
    get_session_mock = mocker.patch(
        "deailab.job_manager.JobManager.get_session", return_value={}
    )
    body = {
        "action": "CREATE_SESSION",
        "payload": {"foo": "bar"},
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert create_session_mock.call_count == 1
    create_session_mock.assert_called_once_with({"foo": "bar"})
    assert get_session_mock.call_count == 1
    get_session_mock.assert_called_once_with("sessionId")
    data = json.loads(response.body.decode())
    assert data["payload"] == {
        "sessionId": "sessionId",
        "availableImages": [],
    }


async def test_custom_image(jp_fetch, mocker):
    add_image_to_session_mock = mocker.patch(
        "deailab.job_manager.JobManager.add_image_to_session",
        return_value=(True, ""),
    )
    body = {
        "action": "CUSTOM_IMAGE",
        "payload": {"sessionId": "sessionId", "customDockerImage": "customDockerImage"},
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert add_image_to_session_mock.call_count == 1
    add_image_to_session_mock.assert_called_once_with("sessionId", "customDockerImage")
    data = json.loads(response.body.decode())
    assert data["payload"] == {"success": True, "msg": ""}


async def test_check_download_status(jp_fetch, mocker):
    get_download_status_mock = mocker.patch(
        "deailab.job_manager.JobManager.get_download_status",
        return_value="pending",
    )
    body = {
        "action": "CHECK_DOWNLOAD_STATUS",
        "payload": {"taskId": "taskId"},
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert get_download_status_mock.call_count == 1
    get_download_status_mock.assert_called_once_with("taskId")
    data = json.loads(response.body.decode())
    assert data["payload"] == {"status": "pending"}


async def test_download_result(jp_fetch, mocker):
    get_result_mock = mocker.patch(
        "deailab.job_manager.JobManager.get_result",
        return_value={"task_id": "taskId", "msg": "foo"},
    )
    body = {
        "action": "DOWNLOAD_RESULT",
        "payload": {
            "sessionId": "sessionId",
            "jobId": "jobId",
            "currentDir": ".",
            "deaiFileName": "deaiFileName",
        },
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert get_result_mock.call_count == 1
    get_result_mock.assert_called_once_with("sessionId", "jobId", "./deaiFileName")
    data = json.loads(response.body.decode())
    assert data["payload"]["success"]


async def test_download_result_error(jp_fetch, mocker):
    get_result_mock = mocker.patch(
        "deailab.job_manager.JobManager.get_result",
        return_value={"task_id": None, "msg": "error"},
    )
    body = {
        "action": "DOWNLOAD_RESULT",
        "payload": {
            "sessionId": "sessionId",
            "jobId": "jobId",
            "currentDir": ".",
            "deaiFileName": "deaiFileName",
        },
    }
    response = await jp_fetch("bacalhau-lab", method="POST", body=json.dumps(body))
    assert response.code == 200
    assert get_result_mock.call_count == 1
    data = json.loads(response.body.decode())
    assert data["payload"]["success"] is False
    assert data["payload"]["msg"] == "error"
