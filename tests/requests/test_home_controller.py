from test_base import BaseTestCase


class TestHomeController(BaseTestCase):

    def test_home_path_should_be_ok(self):
        response = self.client.get("/")
        self.assert_200(response)

    def test_about_path_should_be_ok(self):
        response = self.client.get("/about")
        self.assert_200(response)

    def test_score_path_should_be_ok(self):
        response = self.client.get("/score")
        self.assert_400(response)
