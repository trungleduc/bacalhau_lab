async def test_get_example(jp_fetch):
    # When
    response = await jp_fetch("bacalhau-lab")

    # Then
    assert response.code == 200
