import os

import azure.cognitiveservices.speech as speechsdk
import dotenv


class AzureASRService:
    def __init__(self, config):
        pass

    @staticmethod
    def speech_to_text(audio_file_path, language=None):
        """
        from audio file to text
        """
        speech_config = speechsdk.SpeechConfig(subscription=os.getenv("SPEECH_KEY"), region=os.getenv("SPEECH_REGION"))
        audio_config = speechsdk.AudioConfig(filename=audio_file_path)
        if language:
            speech_config.speech_recognition_language = language
            speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        else:
            auto_detect_source_language_config = speechsdk.languageconfig.AutoDetectSourceLanguageConfig(languages=["en-US", "zh-CN"])
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config,
                auto_detect_source_language_config=auto_detect_source_language_config,
                audio_config=audio_config,
            )
        result = speech_recognizer.recognize_once_async().get()
        return result.text


if __name__ == "__main__":
    dotenv.load_dotenv()
    asr = AzureASRService(None)
    t = asr.speech_to_text("misc/audio.wav")
    print(t)
