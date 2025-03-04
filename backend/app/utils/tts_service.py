import base64
import os
import random
import re
import time
import uuid

import azure.cognitiveservices.speech as speechsdk
import emoji
from bs4 import BeautifulSoup
from flask import current_app


def clean_text_for_tts(text):
    text = BeautifulSoup(text, "html.parser").get_text()  # Remove HTML tags
    text = re.sub(r"\\[nrt]", " ", text)  # Remove escape characters
    text = emoji.replace_emoji(text, replace="")  # Remove emojis
    text = re.sub(r"http\S+|www\.\S+", "", text)  # Remove URLs
    text = re.sub(r"[#$%^&*()@]", "", text)  # Remove special symbols
    text = re.sub(r"\s+", " ", text).strip()  # Remove extra spaces
    text = "".join(c for c in text if c.isprintable())  # Remove any remaining non-printable characters
    return text


class AzureTTS:
    def __init__(self):
        pass

    @staticmethod
    def text_to_speech(text, sub_folder="unattached"):
        speech_config = speechsdk.SpeechConfig(subscription=os.environ.get("SPEECH_KEY"), region=os.environ.get("SPEECH_REGION"))
        speech_config.speech_synthesis_voice_name = os.environ.get("SPEECH_VOICE_NAME")
        print(os.environ.get("SPEECH_VOICE_NAME"))
        print(speech_config.speech_synthesis_voice_name)
        speech_config.set_speech_synthesis_output_format(speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3)
        static_folder = current_app.static_folder

        # file path = static/{session_id}/{timestamp_ms}_chatbot_reply_{uuid.uuid4()}.mp3}
        timestamp_ms = int(time.time() * 1000)
        random_filename = f"{timestamp_ms}_chatbot_reply_{uuid.uuid4()}.mp3"

        if not os.path.exists(os.path.join(static_folder, f"{sub_folder}")):
            os.makedirs(os.path.join(static_folder, f"{sub_folder}"))
        file_path = os.path.join(static_folder, f"{sub_folder}", random_filename)

        # config
        audio_config = speechsdk.audio.AudioOutputConfig(filename=file_path)
        speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

        # tts
        text = clean_text_for_tts(text)  # clean text before tts
        result = speech_synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return random_filename
        else:
            print(f"Speech synthesis failed: {result.reason}")
            return None
