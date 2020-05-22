import requests


class RequestHelper:
    def __init__(self):
        self.auth_url = 'http://127.0.0.1:8000/api/auth/login/'
        self.update_url = 'http://127.0.0.1:8000/api/execute_update/'
        self.session = requests.Session()
        self.session.auth = ('dave', 'dave')
        self.headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
        self.token = 0

    def login(self):
        if self.token == 0:
            response =  self.session.post(self.auth_url, headers=self.headers)
            json_response = response.json()
            self.token = json_response['token']
        return self.token

    def execute_update(self, script_name):
        self.login()
        data = {
            'script_name': script_name,
            'token': self.token
        }
        response =  requests.post(self.update_url, headers=self.headers, json=data)
        return response.status_code
