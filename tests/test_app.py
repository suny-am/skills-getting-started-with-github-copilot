# Tests for FastAPI backend using AAA pattern

def test_root(client):
    # Arrange: nothing to set up for root
    # Act
    response = client.get("/")
    # Assert
    assert response.status_code == 200
    assert "Mergington High School" in response.text


def test_get_activities(client):
    # Arrange: nothing to set up
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_signup_and_unregister(client):
    # Arrange
    activity_name = list(client.get("/activities").json().keys())[0]
    email = "testuser@mergington.edu"
    # Act: signup
    signup_resp = client.post(f"/activities/{activity_name}/signup?email={email}")
    # Assert
    assert signup_resp.status_code == 200
    assert "signed up" in signup_resp.json()["message"].lower()
    # Act: unregister
    unregister_resp = client.post(f"/activities/{activity_name}/unregister?email={email}")
    # Assert
    assert unregister_resp.status_code == 200
    assert "removed" in unregister_resp.json()["message"].lower() or "success" in unregister_resp.json()["message"].lower()


def test_signup_duplicate(client):
    # Arrange
    activity_name = list(client.get("/activities").json().keys())[0]
    email = "duplicate@mergington.edu"
    client.post(f"/activities/{activity_name}/signup?email={email}")
    # Act
    resp = client.post(f"/activities/{activity_name}/signup?email={email}")
    # Assert
    assert resp.status_code == 400
    assert "already signed up" in resp.json()["detail"].lower()
