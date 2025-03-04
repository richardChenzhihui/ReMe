import { theme } from "antd";
import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import useStatusStore from "@/store/useStatusStore";

import { PauseIcon, PlayIcon } from "../icons";

import "./index.less";

const { useToken } = theme;

interface AudioWaveProps {
  animating: boolean;
  color: string;
}
const AudioWave: React.FC<AudioWaveProps> = ({ animating, color }) => {
  const [animationStep, setAnimationStep] = useState(0);
  useEffect(() => {
    if (animating) {
      setAnimationStep(0);

      const intervalId = setInterval(() => {
        setAnimationStep((prevStep) => (prevStep + 1) % 3);
      }, 400);

      // Cleanup function to clear interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [animating]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="26"
      viewBox="0 0 18 26"
      fill={color}
      className="audio-wave"
    >
      <path
        d="M0.939159 19.7817C0.780307 19.7817 0.619119 19.742 0.471947 19.6556C0.0257595 19.3963 -0.126084 18.824 0.133218 18.3778C1.15174 16.6234 1.68903 14.612 1.68903 12.561C1.68903 10.5099 1.14707 8.50325 0.12621 6.7512C-0.133092 6.30501 0.0164153 5.73268 0.462603 5.47338C0.90879 5.21408 1.48112 5.36358 1.74043 5.80977C2.92715 7.84681 3.55554 10.1805 3.55554 12.561C3.55554 14.9414 2.92948 17.2751 1.7451 19.3145C1.57223 19.6135 1.2592 19.7794 0.936823 19.7794L0.939159 19.7817Z"
        className="wave"
      />

      <path
        d="M7.44501 22.3981C7.28616 22.3981 7.12497 22.3584 6.9778 22.272C6.53161 22.0127 6.37977 21.4427 6.63673 20.9942C8.11312 18.4432 8.89337 15.5254 8.89337 12.5587C8.89337 9.59186 8.11312 6.68113 6.63673 4.12781C6.37743 3.68163 6.53161 3.10929 6.9778 2.84999C7.42398 2.59069 7.99632 2.74487 8.25562 3.19105C9.89787 6.02703 10.7645 9.26481 10.7645 12.5563C10.7645 15.8478 9.89787 19.0903 8.25562 21.9262C8.08275 22.2253 7.76972 22.3935 7.44501 22.3935V22.3981Z"
        className="wave"
        id="wave2"
        style={{ opacity: (animating && animationStep) === 0 ? 0 : 1 }}
      />

      <path
        d="M13.9416 25.1266C13.7827 25.1266 13.6216 25.0869 13.4744 25.0005C13.0282 24.7412 12.874 24.1712 13.1333 23.7227C15.0886 20.3424 16.1211 16.4809 16.1211 12.5587C16.1211 8.63641 15.0886 4.77724 13.1333 1.3993C12.874 0.953111 13.0282 0.380776 13.4744 0.121474C13.9206 -0.137829 14.4929 0.0163513 14.7522 0.462539C16.871 4.12314 17.9923 8.30469 17.9923 12.5587C17.9923 16.8126 16.8733 20.9918 14.7522 24.6571C14.5793 24.9561 14.264 25.1243 13.9416 25.1243V25.1266Z"
        className="wave"
        id="wave3"
        style={{ opacity: animating && [0, 1].includes(animationStep) ? 0 : 1 }}
      />
    </svg>
  );
};

interface AudioPlayerProps {
  src: string;
  id: string;
  autoPlay?: boolean;
  className?: string;
  mode?: "wave" | "bar";
  color?: string;
  onAudioEnd?: () => void;
  onAudioPause?: () => void;
  onAutoPlayFailed?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  id,
  src,
  autoPlay = false,
  className,
  mode = "bar",
  color,
  onAudioEnd,
  onAudioPause,
  onAutoPlayFailed,
}) => {
  const { token } = useToken();
  if (!color) {
    color = token.colorPrimary;
  }

  const audioRef = useRef<HTMLAudioElement>(new Audio(src));
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const playerId = useStatusStore((state) => state.playerId);
  const setPlayerId = useStatusStore((state) => state.setPlayerId);
  const isPlaying = playerId === id;

  const play = useCallback(() => {
    const audio = audioRef.current;
    audio.play();
    setPlayerId(id);
  }, [id, setPlayerId]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    if (id === playerId) {
      setPlayerId(null);
    }
  }, [id, playerId, setPlayerId]);

  useEffect(() => {
    const audio = audioRef.current;
    const func = () => {
      onAudioEnd && onAudioEnd();
    };
    audio.onended = func;
    return () => {
      audio.onended = null;
    };
  }, [onAudioEnd]);

  useEffect(() => {
    const audio = audioRef.current;
    const func = () => {
      onAudioPause && onAudioPause();
    };
    audio.onpause = func;
    return () => {
      audio.onpause = null;
    };
  }, [onAudioPause]);

  // preload
  useEffect(() => {
    const audio = audioRef.current;
    if (audio.readyState === 0) {
      audio.load();
    }
  }, []);

  // auto play
  useEffect(() => {
    const audio = audioRef.current;

    const autoplay = () => {
      audio
        .play()
        .then(() => {
          setPlayerId(id);
        })
        .catch(() => {
          onAutoPlayFailed && onAutoPlayFailed();
          console.log("Autoplay is not allowed.");
        });
    };

    let played = false;
    const canplaythrough = () => {
      if (!played) {
        played = true;
        autoplay();
      }
    };

    if (autoPlay) {
      if (audio.readyState !== 4) {
        audio.addEventListener("canplaythrough", canplaythrough);
      } else {
        audio.currentTime = 0;
        autoplay();
      }
    }
    return () => {
      if (autoPlay) {
        audio.pause();
        if (playerId === id) {
          setPlayerId(null);
        }
        audio.removeEventListener("canplaythrough", canplaythrough);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, id]);

  // pasue when playerId change
  useEffect(() => {
    const audio = audioRef.current;
    if (playerId !== id) {
      audio.pause();
    }
  }, [id, playerId]);

  // update progress
  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const ended = () => {
      setProgress(0);
      setPlayerId(null);
    };

    if (audio) {
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", ended);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", ended);
      }
    };
  }, [setPlayerId]);

  const handleProgressClick = (event: MouseEvent) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (audio && progressBar) {
      const clickX = event.nativeEvent.offsetX;
      const progressWidth = progressBar.clientWidth;
      const newTime = (clickX / progressWidth) * audio.duration;
      audio.currentTime = newTime;
    }
  };

  const togglePlayPause = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  if (mode === "wave") {
    return (
      <div className={`audioWave ${className}`} onClick={togglePlayPause}>
        <AudioWave animating={isPlaying} color={color}></AudioWave>
      </div>
    );
  }
  // bar
  return (
    <div className={`audio-player ${className}`}>
      <div className="play-pause" onClick={togglePlayPause}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </div>

      <div
        className="progress-bar"
        ref={progressRef}
        onClick={handleProgressClick}
      >
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default AudioPlayer;
