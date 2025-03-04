import os
import time
import base64
import json
import requests

# Constants definition
BASE_URL = "http://127.0.0.1:5000"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_local_file_as_base64(filepath):
    """Load local file as base64 encoded format"""
    basename = os.path.basename(filepath)
    filetype = basename.split('.')[-1].lower()
    
    with open(filepath, 'rb') as f:
        data = f.read()
        base64_data = base64.b64encode(data).decode('utf-8')
        
        if filetype in ['jpeg', 'jpg']:
            return f"data:image/jpeg;base64,{base64_data}"
        elif filetype == 'wav':
            return f"data:audio/wav;base64,{base64_data}"
        else:
            raise ValueError(f"Unsupported file type: {filetype}")

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.user_id = None
        self.session_id = None
    
    def _assert_response(self, response, operation_name):
        """Verify API response"""
        assert response.status_code == 200, f"{operation_name} failed: {response.text}"
        result = response.json()
        assert result["code"] == 200, f"{operation_name} failed: {result['message']}"
        return result
    
    def register(self, phone, password, name=None, gender=None, birthdate_year=None, birthdate_month=None):
        """User registration"""
        url = f"{BASE_URL}/api/v1/user/register"
        data = {
            "phone": phone,
            "password": password
        }
        
        # Add optional parameters
        if name: data["name"] = name
        if gender: data["gender"] = gender
        if birthdate_year: data["birthdate_year"] = birthdate_year
        if birthdate_month: data["birthdate_month"] = birthdate_month
            
        result = self._assert_response(self.session.post(url, json=data), "Register")
        self.user_id = result["data"]["user_id"]
        print("Registration successful")

    def login(self, phone="12312341234", password="testpassword"):
        """User login"""
        url = f"{BASE_URL}/api/v1/user/login"
        data = {
            "phone": phone,
            "password": password
        }
        result = self._assert_response(self.session.post(url, json=data), "Login")
        self.user_id = result["data"]["user_id"]
        print("Login successful")

    def submit_survey(self, survey_data=None):
        """Submit survey questionnaire"""
        url = f"{BASE_URL}/api/v1/user/survey"
        if survey_data is None:
            survey_data = {"age": 30, "gender": "male"}
        
        data = {"survey": json.dumps(survey_data)}
        self._assert_response(self.session.post(url, json=data), "Submit survey")
        print("Survey submitted successfully")

    def get_survey(self):
        """Get survey questionnaire"""
        url = f"{BASE_URL}/api/v1/user/survey"
        result = self._assert_response(self.session.get(url), "Get survey")
        print(f"Survey data: {result['data']}")
        return result['data']

    def get_puzzle_list(self):
        """Get puzzle list"""
        url = f"{BASE_URL}/api/v1/chat/puzzle"
        result = self._assert_response(self.session.get(url), "Get puzzle list")
        print(f"Puzzle list: {result['data']['puzzle_list']}")
        return result['data']['puzzle_list']

    def create_chat(self, puzzle_name, language=None):
        """Create conversation"""
        url = f"{BASE_URL}/api/v1/chat"
        data = {"puzzle_name": puzzle_name}
        if language:
            data["language"] = language
            
        result = self._assert_response(self.session.post(url, json=data), "Create chat")
        self.session_id = result["data"]["session_id"]
        print(f"Chat created successfully, session_id: {self.session_id}")
        print(f"Session info: {result['data']}")
        return self.session_id

    def get_chat_list(self, page=1, page_size=10):
        """Get chat list"""
        url = f"{BASE_URL}/api/v1/chat"
        params = {
            "page": page,
            "page_size": page_size
        }
        result = self._assert_response(self.session.get(url, params=params), "Get chat list")
        print(f"Chat list: {result['data']['sessions']}")
        return result['data']['sessions']

    def get_chat_history(self):
        """Get chat history"""
        url = f"{BASE_URL}/api/v1/chat/{self.session_id}"
        result = self._assert_response(self.session.get(url), "Get chat history")
        print(f"Chat history: {result['data']}")
        return result['data']

    def send_message(self, content=None):
        """Send message"""
        url = f"{BASE_URL}/api/v1/chat/{self.session_id}"
        print(f"Current session ID: {self.session_id}")
        
        if content is None:
            data = {
                "role": "user",
                "content": [{"type": "text", "data": "我有点想不起来了"}]
            }
        elif isinstance(content, list):
            data = {
                "role": "user",
                "content": content
            }
        else:
            data = {
                "role": "user",
                "content": content
            }
        
        form_data = {"data": json.dumps(data)}
        result = self._assert_response(
            self.session.post(url, data=form_data, timeout=180), 
            "Send message"
        )
        print(f"Assistant reply: {result['data']['response_message']}")
        return result['data']['response_message']
    
    def asr(self, audio_base64=None):
        """Speech recognition"""
        url = f"{BASE_URL}/api/v1/chat/util/asr"
        if audio_base64 is None:
            audio_base64 = load_local_file_as_base64(os.path.join(SCRIPT_DIR, "./misc/chinese_audio.wav"))
            
        data = {"audio": audio_base64}
        result = self._assert_response(self.session.post(url, json=data), "Speech recognition")
        print(f"Speech recognition result: {result['data']}")
        return result['data']

    def upload_lifelog(self, title="Eating at cafe", tags=None, content=None):
        """Upload life log"""
        url = f"{BASE_URL}/api/v1/lifelog"
        if tags is None:
            tags = ["test", "api", "lunch"]
            
        if content is None:
            content = [
                {"type": "text", "data": "This is a life log"},
                {"type": "image", "data": load_local_file_as_base64(os.path.join(SCRIPT_DIR, "./misc/lunch.jpg"))}
            ]
            
        data = {
            "timestamp": int(time.time()) * 1000,
            "title": title,
            "tags": tags,
            "content": content
        }
        form_data = {"data": json.dumps(data)}
        result = self._assert_response(self.session.post(url, data=form_data), "Upload life log")
        print(f"Life log uploaded successfully, ID: {result['data']['id']}")
        return result['data']['id']

    def get_lifelog_list(self, year=None, page=1, page_size=10):
        """Get life log list"""
        url = f"{BASE_URL}/api/v1/lifelog"
        params = {
            "page": page,
            "page_size": page_size
        }
        if year:
            params["year"] = year
            
        result = self._assert_response(self.session.get(url, params=params), "Get life log list")
        print(f"Life log list: {result['data']['lifelog']}")
        return result['data']['lifelog']

    def get_lifelog_detail(self, lifelog_id):
        """Get life log details"""
        url = f"{BASE_URL}/api/v1/lifelog/{lifelog_id}"
        result = self._assert_response(self.session.get(url), "Get life log details")
        print(f"Life log details: {result['data']}")
        return result['data']
        
    def upload_feedback(self, text="A test feedback", tags=None):
        """Upload feedback"""
        url = f"{BASE_URL}/api/v1/feedback/upload"
        if tags is None:
            tags = ["test", "api"]
            
        data = {
            "feedback": {
                "text": text,
                "tags": tags
            }
        }
        form_data = {"data": json.dumps(data)}
        self._assert_response(self.session.post(url, data=form_data), "Upload feedback")
        print("Feedback uploaded successfully")

    def logout(self):
        """User logout"""
        url = f"{BASE_URL}/api/v1/user/logout"
        self._assert_response(self.session.post(url), "Logout")
        print("Logout successful")

    def run_tests(self):
        """Run all tests"""
        # Initialize database
        os.system("python manage.py init_db")
        os.system("python manage.py seed_db")
        
        # Test user-related APIs
        self.register("12312341234", "testpassword", name="Test User", gender="female", 
                      birthdate_year="1990", birthdate_month="1")
        try:
            self.register("12312341234", "testpassword")  # Test duplicate phone number
        except AssertionError as e:
            print(f"Duplicate phone test: {e}")
        self.register("12312341235", "testpassword")
        self.login()
        self.submit_survey()
        self.get_survey()
        
        # Test life log related APIs
        self.upload_lifelog()
        self.get_lifelog_list()
        self.get_lifelog_list(2024)
        self.get_lifelog_detail(1)
        
        # Test puzzle and conversation related APIs
        self.get_puzzle_list()
        self.upload_feedback()
        
        # Test various puzzle scenarios
        self._test_puzzles()
        
        # Test speech recognition
        print('ASR speech interface test')
        self.asr()
        print('English ASR speech interface test')
        self.asr(load_local_file_as_base64(os.path.join(SCRIPT_DIR, "./misc/english_audio.wav")))
        
        self.logout()
    
    def _test_puzzles(self):
        """Test various puzzle scenarios"""
        
        # Life recall puzzle (Chinese)
        self._test_life_recall_cn()
        
        # Life recall puzzle (English)
        self._test_life_recall_en()
        
        # Guess a thing puzzle (English)
        self._test_guess_a_thing_en()
        
        # Guess a thing puzzle (Chinese)
        self._test_guess_a_thing_cn()
    
    def _test_life_recall_cn(self):
        """Test Chinese life recall puzzle"""
        print('Life recall puzzle - Chinese')
        self.create_chat('life_recall','zh-CN')
        
        print('"我有点想不起来了"')
        self.send_message()
        
        print('"需要提示"')
        self.send_message([{"type": "text", "data": "需要提示"}])
        
        print('Audio test')
        self.send_message([
            {"type": "audio", "data": load_local_file_as_base64(os.path.join(SCRIPT_DIR, "./misc/chinese_audio.wav"))}
        ])
    
    def _test_life_recall_en(self):
        """Test English life recall puzzle"""
        print('Life recall puzzle - English')
        self.create_chat('life_recall', 'en-US')
        
        print('"I can\'t remember"')
        self.send_message([{"type": "text", "data": "I can't remember"}])
        
        print('"need some hints"')
        self.send_message([{"type": "text", "data": "need some hints"}])
        
        print('Audio test')
        self.send_message([
            {"type": "audio", "data": load_local_file_as_base64(os.path.join(SCRIPT_DIR, "./misc/chinese_audio.wav"))}
        ])
    
    def _test_guess_a_thing_en(self):
        """Test English guess a thing puzzle"""
        print('Guess a thing puzzle - English')
        self.create_chat('guess_a_thing', 'en-US')
        
        print('"Need some hints"')
        self.send_message([{"type": "text", "data": "Need some hints"}])
        
        print('Audio test')
        self.send_message([
            {"type": "audio", "data": load_local_file_as_base64(os.path.join(SCRIPT_DIR, "./misc/english_audio.wav"))}
        ])
        
        print('"你看到的图上有什么"')
        self.send_message([{"type": "text", "data": "你看到的图上有什么"}])
        
        print('"不玩了"')
        self.send_message([{"type": "text", "data": "不玩了"}])
    
    def _test_guess_a_thing_cn(self):
        """Test Chinese guess a thing puzzle"""
        print('Guess a thing puzzle - Chinese')
        self.create_chat('guess_a_thing','zh-CN')
        
        print('"猜不到啊，给点提示吧"')
        self.send_message([{"type": "text", "data": "猜不到啊，给点提示吧"}])
        
        print('"是不是橘子"')
        self.send_message([{"type": "text", "data": "是不是橘子"}])

if __name__ == "__main__":
    tester = APITester()
    tester.run_tests()