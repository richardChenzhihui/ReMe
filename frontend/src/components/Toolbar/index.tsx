import { Button, theme } from "antd";
import { Input, InputProps, InputRef, Toast } from "antd-mobile";
import React, {
  Touch,
  TouchEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import Recorder from "recorder-core/recorder.wav.min";

import useHistoryStore from "@/store/useHistoryStore";
import useStatusStore from "@/store/useStatusStore";
import { MessageContent } from "@/types/messageTypes";
import { Status } from "@/types/statusTypes";
import { KeyboardIcon, MicIcon, TrashIcon, UploadImageIcon } from "@c/icons";
import "recorder-core/src/extensions/lib.fft";
import "./frequency.histogram.view";

import "./index.less";

const { useToken } = theme;

const FocusInput = (props: InputProps) => {
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return <Input ref={inputRef} enterKeyHint="send" {...props} />;
};

interface ToolbarProps {
  sendMessage: (message: MessageContent) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ sendMessage }) => {
  const { t } = useTranslation("common");
  const { token } = useToken();
  const color = token.colorPrimary;

  const [voiceInput, setVoiceInput] = useState(true);
  const cancleRef = useRef<HTMLButtonElement>(null);
  const [insideCancle, setInsideCancle] = useState(false);
  const [recorder, setRecorder] = useState<typeof Recorder | null>(null);

  const history = useHistoryStore((state) => state.history);
  const pendingMessages = useHistoryStore((state) => state.pendingMessages);

  const status = useStatusStore((state) => state.status);
  const setStatus = useStatusStore((state) => state.setStatus);
  const recording = status === Status.RECORDING;
  const disabled =
    history.length === 0 ||
    pendingMessages.length > 0 ||
    status === Status.GENERATING ||
    status === Status.END;
  const [audioPermission, setAudioPermission] = useState(true);

  async function getMicrophonePermission() {
    try {
      // request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioPermission(true);
    } catch (error) {
      setAudioPermission(false);
      Toast.show({
        icon: "fail",
        content: t("Please enable microphone permissions to record."),
      });
    }
  }

  useEffect(() => {
    getMicrophonePermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handel audio message
  const isInside = (touch: Touch, element: HTMLButtonElement) => {
    const rect = element.getBoundingClientRect();
    return (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    );
  };

  const onTouchMove: TouchEventHandler<HTMLElement> = (event) => {
    if (disabled) {
      return;
    }

    const touch = event.touches[0];
    if (cancleRef.current && isInside(touch, cancleRef.current)) {
      if (!insideCancle) {
        setInsideCancle(true);
        if (navigator.vibrate) {
          navigator.vibrate(80);
        }
      }
    } else {
      if (insideCancle) {
        setInsideCancle(false);
      }
    }
  };

  const onStartRecording = () => {
    console.log("onStartRecording", status);
    if (disabled) {
      return;
    }
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }

    if (!audioPermission) {
      getMicrophonePermission();
      return;
    }

    const recorder = Recorder({
      type: "wav",
      sampleRate: 16000,
      bitRate: 16,
      onProcess: (
        buffers: any,
        powerLevel: number,
        _duration: number,
        bufferSampleRate: number,
        newBufferIdx: number,
      ) => {
        if (!Recorder.recording) {
          recorder.stop(() => {
            recorder.close();
          });
        }
        // visualizaton
        const wave = Recorder.FrequencyHistogramView({
          elem: "#recording-wave-view",
          position: 0, // middle
          lineCount: 21,
          minHeight: 3,
          widthRatio: 0.67,
          fallDuration: 400,
          stripeEnable: false,
          mirrorEnable: false,
          linear: [0, color, 1, color],
        });

        wave.input(buffers[newBufferIdx], powerLevel, bufferSampleRate);
      },
    });
    setRecorder(recorder);

    setStatus(Status.RECORDING);
    Recorder.recording = true;

    recorder.open(
      () => {
        recorder.start();
      },
      (msg: string, isUserNotAllow: boolean) => {
        // failed
        alert(
          `${isUserNotAllow ? "UserNotAllow," : ""}open recorder failed:${msg}`,
        );
      },
    );
  };

  async function fileToUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          resolve(reader.result as string);
        },
        false,
      );
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  const onEndRecording = (cancel = false) => {
    if (disabled) {
      return;
    }

    setStatus(Status.VOID);
    Recorder.recording = false;

    if (!(recorder && Recorder.IsOpen())) {
      return;
    }

    // set to generating stauts to prevent multiple recording
    setStatus(Status.GENERATING);
    recorder.stop(
      (blob: Blob) => {
        recorder.close();
        setRecorder(null);

        // cancel recording
        if (cancel || insideCancle) {
          setStatus(Status.VOID);
          setInsideCancle(false);
          return;
        }

        // send recording
        const file = new File([blob], "audio.mp3", { type: blob.type });
        fileToUrl(file).then((url) => {
          sendMessage({ audio: url });
        });
      },
      (msg: string) => {
        Toast.show({
          icon: "fail",
          content: msg,
        });
      },
    );
  };

  // handle text message
  const [inputText, setInputText] = useState<string>("");
  const onTextChange = (value: string) => {
    setInputText(value);
  };
  const sendTextMessage = () => {
    if (inputText !== "") {
      sendMessage({ text: inputText });
      setInputText("");
    }
  };

  // handle image message
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      const file = files[0];
      fileToUrl(file).then((url) => {
        sendMessage({ image: url });
      });
    }
  };

  return (
    <>
      <div className="toolbar">
        {voiceInput ? (
          <>
            {!recording && (
              <KeyboardIcon
                onClick={() => setVoiceInput(false)}
                className="icon"
              />
            )}
            <Button
              type="primary"
              className={`default-button record-button ${recording ? "recording-button" : ""}`}
              onTouchStart={onStartRecording}
              onTouchEnd={() => onEndRecording()}
              onTouchMove={onTouchMove}
              onMouseDown={onStartRecording}
              onMouseUp={() => onEndRecording()}
              disabled={disabled}
            >
              <MicIcon className="record-icon" />
              <span>
                {recording ? t("Release to send") : t("Hold to talk")}
              </span>
              <div className="overlay"></div>
            </Button>
          </>
        ) : (
          <>
            <MicIcon onClick={() => setVoiceInput(true)} className="icon" />
            <FocusInput
              className="text-input"
              onEnterPress={sendTextMessage}
              onChange={onTextChange}
              value={inputText}
              disabled={disabled}
            />
          </>
        )}

        {!recording && (
          <div className="image-upload-container">
            <UploadImageIcon className="icon" />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              aria-hidden={true}
              className="image-upload"
              disabled={disabled}
            />
          </div>
        )}
      </div>
      {recording && (
        <div className="mask">
          <div id="recording-wave-view" className="recording-wave-view"></div>
          <Button
            className={
              "default-button cancel-button" +
              (insideCancle ? " cancel-button-active" : "")
            }
            ghost
            ref={cancleRef}
            onClick={() => onEndRecording(true)}
          >
            <TrashIcon className="icon" />
            {t("Cancel")}
          </Button>
        </div>
      )}
    </>
  );
};
export default Toolbar;
