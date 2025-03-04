import copy
import json
import os
import re
import time
import uuid

from flask import current_app, url_for
from openai import AzureOpenAI
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm.attributes import flag_modified

from app import db
from app.models.chat import ChatSession
from app.utils.asr_service import AzureASRService
from app.utils.cognitive_puzzle import CognitivePuzzleManager
from app.utils.local_file_manager import save_base64_to_file
from app.utils.tts_service import AzureTTS
from config import Config


class ChatService:
    def __init__(self):
        self.asr_service = AzureASRService
        self.tts_service = AzureTTS
        self.cognitive_puzzle_manager = CognitivePuzzleManager()
        self.client = AzureOpenAI(
            api_key=os.getenv("AOAI_API_KEY"),
            api_version=os.getenv("AOAI_API_VERSION"),
            azure_endpoint=os.getenv("AOAI_ENDPOINT"),
        )
        self.model = os.getenv("AOAI_MODEL_NAME")

    def get_puzzle_name_list(self):
        puzzle_names = self.cognitive_puzzle_manager.list_puzzles()
        return puzzle_names

    def create_chat_session(self, user_id, puzzle_name, language=None):
        puzzle_maker = self.cognitive_puzzle_manager.get_puzzle_maker(puzzle_name, language)

        if not puzzle_maker:
            raise ValueError("Invalid puzzle_id")

        # Create chat session
        chat_session_id = str(uuid.uuid4())
        puzzle_instance = puzzle_maker(user_id, chat_session_id)
        timestamp = int(time.time())
        chat_session = ChatSession(
            id=chat_session_id,
            user_id=user_id,
            puzzle_name=puzzle_name,
            language=language,
            timestamp=timestamp,
            active=True,
            model_chat_history=puzzle_instance["model_history"],
            puzzle_instance=puzzle_instance,
        )

        instruction_message = puzzle_instance["instruction_message"]
        
        session_record_path = os.path.normpath(os.path.join(current_app.static_folder, "chat_sessions", f"{chat_session.id}"))
        if not session_record_path.startswith(current_app.static_folder):
            raise Exception("Invalid subfolder name")
        if not os.path.exists(session_record_path):
            os.makedirs(session_record_path)

        try:
            db.session.add(chat_session)
            db.session.commit()
            # log puzzle_instance instruction_message
            with open(
                os.path.join(session_record_path, f"{int(time.time())*1000}_instruction_message.json"), "w", encoding='utf-8'
            ) as f:
                json.dump(
                    {
                        "instruction_message": puzzle_instance,
                    },
                    f,
                    ensure_ascii=False,
                )

            return chat_session, instruction_message
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    def train_chat(self, user_id, session_id, raw_user_chat_message):
        # 1. Process user chat message
        # 2. Get model response from AzureOpenAI
        # 3. Parse response for display and extract additional info
        # 4. Update chat history and session

        chat_session = ChatSession.query.filter_by(id=session_id, user_id=user_id, active=True).first()
        if not chat_session:
            raise ValueError("Invalid or inactive session_id")

        # parse user input
        content = raw_user_chat_message.get("content")
        language = chat_session.language

        print(content)

        if not isinstance(content, list):
            raise ValueError("Invalid user chat message")

        if len(content) == 0:
            raise ValueError("Empty user chat message")

        if len(content) > 1:
            raise ValueError("Invalid user chat message for multiple input types")

        content_item = content[0]
        content_type = content_item.get("type")
        content_data = content_item.get("data")

        if content_type == "text":
            parsed_content = [{"type": "text", "text": content_data}]
        elif content_type == "image":
            parsed_content = [{"type": "image_url", "image_url": {"url": content_data}}]
        elif content_type == "audio":
            audio_file_path, audio_file_url = save_base64_to_file(content_data, f"chat_sessions/{session_id}")
            asr_text = AzureASRService.speech_to_text(audio_file_path, language)
            parsed_content = [{"type": "text", "text": asr_text}]
        else:
            raise ValueError(f"Unsupported content type: {content_type}")

        parsed_user_chat_message = {"role": "user", "content": parsed_content}

        print(parsed_content)

        # log user chat message
        session_record_path = os.path.normpath(os.path.join(current_app.static_folder, "chat_sessions", f"{chat_session.id}"))
        if not session_record_path.startswith(current_app.static_folder):
            raise Exception("Invalid subfolder name")
        if not os.path.exists(session_record_path):
            os.makedirs(session_record_path)
            
        with open(
            os.path.join(session_record_path, f"{int(time.time()*1000)}_user_chat_message.json"), "w", encoding='utf-8'
        ) as f:
            json.dump(
                {
                    "raw_user_chat_message": content,
                    "parsed_user_chat_message": parsed_user_chat_message,
                },
                f,
                ensure_ascii=False,
            )
            
        # add parsed user message to chat history
        model_chat_history = chat_session.model_chat_history or []
        model_chat_history.append(parsed_user_chat_message)

        # get GPT response
        raw_reponse_message = self.client.chat.completions.create(
            model=self.model,
            messages=model_chat_history,
            max_tokens=4096,
        )
        response_content = raw_reponse_message.choices[0].message.content

        print(response_content)

        # add GPT response to chat history
        model_chat_history.append({"role": "assistant", "content": response_content})

        # post process to extract tags from puzzle_instance for extra information, and remove them from response
        puzzle_instance = chat_session.puzzle_instance
        puzzle_addtional_parser_rule = puzzle_instance.get("addtional_parser_rule")

        extra_info = {}
        for k, v in puzzle_addtional_parser_rule.items():
            if k in response_content:
                extra_info.update(v)
                response_content = response_content.replace(k, "") # remove tag from response
                close_tag = k.replace("<", "</")
                response_content = response_content.replace(close_tag, "") # remove close tag from response

        # parse GPT response for display from <outputs> tag
        output_message = {"role": "assistant", "content": [], "extra_info": extra_info}
        outputs = re.findall(r"<outputs>(.*?)</outputs>", response_content, re.DOTALL)
        output_text = outputs[0] if outputs else response_content  # treat the whole response as text if no <outputs> tag
        output_message["content"].append({"type": "text", "data": output_text})

        if output_text:
            output_audio_filename = AzureTTS.text_to_speech(output_text, f"chat_sessions/{session_id}")
            output_audio_url = url_for("static", filename=output_audio_filename)
            output_message["content"].append({"type": "audio", "data": output_audio_url})

        # log GPT response and output_message
        with open(os.path.join(session_record_path, f"{int(time.time()*1000)}_output_message.json"), "w", encoding='utf-8') as f:
            json.dump(
                {
                    "model_response": response_content,
                    "output_message": output_message,
                },
                f,
                ensure_ascii=False,
            )

        # update chat session
        chat_session.model_chat_history = model_chat_history
        flag_modified(chat_session, "model_chat_history")  # XXX to pass SQLAlchemy dirty check
        chat_session.timestamp = int(time.time())
        
        print("output_message:", output_message)

        try:
            db.session.commit()
            print("send_message: db.session.commit()")
        except SQLAlchemyError as e:
            db.session.rollback()
            print("send_message: db.session.rollback()")
            raise e

        return {
            "session_id": chat_session.id,
            "timestamp": int(time.time()),
            "puzzle_name": chat_session.puzzle_name,
            "active": chat_session.active,
            "response_message": output_message,  # XXX extra_info in response_message
        }

    def speech_to_text(self, audio, language=None):
        audio_file_path, audio_file_url = save_base64_to_file(audio)
        asr_text = AzureASRService.speech_to_text(audio_file_path, language)
        return asr_text
