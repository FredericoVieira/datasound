from test_base import BaseTestCase


class TestSpotifyController(BaseTestCase):

    def test_login_path_should_be_ok(self):
        response = self.client.get("/login")
        self.assertStatus(response, 302)

    def test_logout_path_should_be_ok(self):
        response = self.client.get("/logout")
        self.assertStatus(response, 302)
