import { Button, ColorPicker } from "antd";
import { DotLoading } from "antd-mobile";
import { Mask, Popup } from "antd-mobile";
import confetti from "canvas-confetti";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Layer, Line, Stage } from "react-konva";
import { useNavigate, useParams } from "react-router-dom";
import type { Swiper as SwiperType } from "swiper";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { chat } from "@/api";
import AudioPlayer from "@/components/AudioPlayer";
import {
  CloseIcon,
  EraserFilledIcon,
  EraserIcon,
  PenFilledIcon,
  PenIcon,
  QuestionMarkIcon,
  RestoreIcon,
} from "@/components/icons";
import Navigator from "@/components/Navigator";
import useHistoryStore from "@/store/useHistoryStore";
import useStatusStore from "@/store/useStatusStore";
import { Role } from "@/types/messageTypes";
import { Status } from "@/types/statusTypes";
import "swiper/css";
import "swiper/css/pagination";

import "./index.less";

const URLImage = ({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const imageRef = useRef(null);
  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImage(img);
    };
    img.crossOrigin = "Anonymous";
  }, [src]);
  return (
    image && (
      <Image image={image} ref={imageRef} width={width} height={height} />
    )
  );
};

const tips = [
  {
    text: "Click the pencil icon to start drawing.",
    gif: "/tips/01.gif",
    audio: "/tips/01.mp3",
  },
  {
    text: "Use your finger to swipe from the specified starting point to the ending point.",
    gif: "/tips/02.gif",
    audio: "/tips/02.mp3",
  },
  {
    text: "Click the eraser icon, then erase where needed.",
    gif: "/tips/03.gif",
    audio: "/tips/03.mp3",
  },
  {
    text: "Select different colors to enrich your drawing.",
    gif: "/tips/04.gif",
    audio: "/tips/04.mp3",
  },
  {
    text: 'Click the "Redraw" button to clear the canvas and start drawing again.',
    gif: "/tips/05.gif",
    audio: "/tips/05.mp3",
  },
];

const Star = ({
  fill,
  className = "",
}: {
  fill: string;
  className?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 68 68"
      fill="none"
      className={className}
    >
      <path
        d="M31.1468 8.78115C32.0449 6.01722 35.9551 6.01722 36.8532 8.78115L40.9599 21.4205C41.3616 22.6565 42.5134 23.4934 43.8131 23.4934L57.1029 23.4934C60.009 23.4934 61.2174 27.2123 58.8662 28.9205L48.1146 36.732C47.0631 37.4959 46.6231 38.85 47.0248 40.0861L51.1315 52.7254C52.0296 55.4894 48.8661 57.7877 46.515 56.0795L35.7634 48.268C34.7119 47.5041 33.2881 47.5041 32.2366 48.268L21.485 56.0795C19.1339 57.7877 15.9704 55.4894 16.8685 52.7254L20.9752 40.0861C21.3769 38.85 20.9369 37.4959 19.8854 36.732L9.13377 28.9205C6.78263 27.2123 7.99096 23.4934 10.8971 23.4934L24.1869 23.4934C25.4866 23.4934 26.6384 22.6565 27.0401 21.4205L31.1468 8.78115Z"
        fill={fill}
      />
    </svg>
  );
};

const Draw = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const tCommon = useTranslation("common").t;
  const tUrl = useTranslation("url").t;

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#df4b26");
  const [lines, setLines] = useState<
    { tool: string; points: any[]; color: string }[]
  >([]);
  const isDrawing = useRef(false);
  const [maskVisible, setMaskVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const [swiperIndex, setSwiperIndex] = useState(0);
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const stageRef = useRef(null);

  const setPlayerId = useStatusStore((state) => state.setPlayerId);
  const sessionId = useHistoryStore((state) => state.sessionId);
  const history = useHistoryStore((state) => state.history);
  const addMessage = useHistoryStore((state) => state.addMessage);
  const [responseId, setResponseId] = useState<string | null>(null);
  const drawInstance = history.find((item) => item.id === id);
  const response = history.find((item) => item.id === responseId);
  const [rating, setRating] = useState(2);
  const soundEffect = useRef<HTMLAudioElement>(new Audio("/rating.mp3"));
  const [soundEffectEnd, setSoundEffectEnd] = useState(false);

  const setStatus = useStatusStore((state) => state.setStatus);
  const status = useStatusStore((state) => state.status);
  const clearStatus = useStatusStore((state) => state.clearStatus);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color: color }]);
  };

  const handleMouseMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (tool === "eraser") {
      handleErase(point);
      return;
    }
    const lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleErase = (pos: { x: number; y: number }) => {
    setLines(
      lines.filter((line) => {
        return !line.points.some((point, index) => {
          if (index % 2 === 0) {
            const distance = Math.sqrt(
              (point - pos.x) ** 2 + (line.points[index + 1] - pos.y) ** 2,
            );
            return distance < 10; // Adjust this value for eraser size
          }
          return false;
        });
      }),
    );
  };

  const handleSubmit = () => {
    if (!sessionId) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const uri = stageRef?.current?.toDataURL();

    const message = {
      image: uri,
    };

    setFeedbackVisible(true);
    setSoundEffectEnd(false);
    setPlayerId(null);
    setStatus(Status.GENERATING);
    setResponseId(null);
    chat(sessionId, message).then((response) => {
      if (response) {
        const { messageContents, info } = response;

        const id = addMessage(Role.AGENT, messageContents[0]);
        setResponseId(id);
        if (info && info.end === "end") {
          setStatus(Status.END);
        } else {
          setStatus(Status.VOID);
        }
        if (info && info.rating) {
          setRating(info.rating);
        }
      }
    });
  };

  const handleRatingSoundEffect = () => {
    soundEffect.current.currentTime = 0.3;
    soundEffect.current.play();
  };

  //preload
  useEffect(() => {
    const audio = soundEffect.current;
    if (audio.readyState === 0) {
      audio.load();
    }
  }, []);
  useEffect(() => {
    if (feedbackVisible && response) {
      let intervalId: string | number | NodeJS.Timeout | undefined;
      const repeatAction = () => {
        let count = 0;
        const maxCount = rating;

        intervalId = setInterval(() => {
          handleRatingSoundEffect();
          count++;
          if (count >= maxCount) {
            setSoundEffectEnd(true);
            clearInterval(intervalId);
          }
        }, 1000);
      };
      repeatAction();
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [feedbackVisible, rating, response]);

  useEffect(() => {
    function showConfetti() {
      confetti({
        particleCount: 60,
        startVelocity: 30,
        angle: 100,
        spread: 25,
        gravity: 0.8,
        zIndex: 9999,
        scalar: 0.7,
        origin: {
          x: 0.7,
          y: 1, // Start from the bottom
        },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          startVelocity: 30,
          angle: 80,
          spread: 25,
          gravity: 0.8,
          zIndex: 9999,
          scalar: 0.7,
          origin: {
            x: 0.3,
            y: 1, // Start from the bottom
          },
        });
      }, 400);
    }
    if (status === Status.END && feedbackVisible && soundEffectEnd) {
      showConfetti();
    }
  }, [status, soundEffectEnd, feedbackVisible]);

  const size = window.innerWidth * 0.8;
  if (!drawInstance) {
    return <>404</>;
  }
  const { audio, text, image } = drawInstance;
  return (
    <div className="page draw-page">
      <Navigator back title={tCommon("Art Game")} />
      <div className="container">
        <div>
          <div className="draw-task">
            {audio && (
              <AudioPlayer
                mode="wave"
                autoPlay={true}
                id="draw-audio"
                src={audio}
                className="draw-task-audio"
              />
            )}
            {text && text}
          </div>
          <div className="draw-toobar">
            {tool === "pen" ? (
              <PenFilledIcon
                className="draw-icon"
                onClick={() => setTool("eraser")}
              />
            ) : (
              <PenIcon className="draw-icon" onClick={() => setTool("pen")} />
            )}
            {tool === "eraser" ? (
              <EraserFilledIcon
                className="draw-icon"
                onClick={() => setTool("pen")}
              />
            ) : (
              <EraserIcon
                className="draw-icon"
                onClick={() => setTool("eraser")}
              />
            )}
            <ColorPicker
              defaultValue={color}
              placement="bottom"
              className="draw-icon"
              onChange={(_value, hex) => setColor(hex)}
            ></ColorPicker>
            <RestoreIcon className="draw-icon" onClick={() => setLines([])} />
            <div className="question">
              <QuestionMarkIcon
                className="question-icon"
                onClick={() => setMaskVisible(true)}
              />
            </div>
            <Mask visible={maskVisible} className="draw-mask">
              <div className="close-button">
                <CloseIcon
                  className="close-icon"
                  onClick={() => setMaskVisible(false)}
                />
              </div>

              <Swiper
                onSwiper={(swiper: SwiperType) => setSwiperRef(swiper)}
                pagination={{ enabled: true }}
                modules={[Pagination]}
                className="tips-container"
                onSlideChange={(swiper) => {
                  setSwiperIndex(swiper.activeIndex);
                }}
              >
                {tips.map((tip, i) => (
                  <SwiperSlide key={tip.text}>
                    <div className="tip">
                      <div className="audio-control">
                        <AudioPlayer
                          src={tUrl(tip.audio)}
                          id={"tip" + i}
                          autoPlay={i === swiperIndex && maskVisible}
                          mode={"wave"}
                          color="white"
                          onAudioEnd={() => {
                            swiperRef &&
                              i !== tips.length - 1 &&
                              swiperRef.slideTo(i + 1);
                          }}
                        />
                      </div>

                      <div className="tip-text">{tCommon(tip.text)}</div>
                      <img src={tip.gif} alt={tip.text} className="tip-gif" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <Button
                className="default-button get-button"
                type="primary"
                onClick={() => setMaskVisible(false)}
                style={{ opacity: swiperIndex === tips.length - 1 ? 1 : 0 }}
                disabled={swiperIndex !== tips.length - 1}
              >
                {tCommon("Got it")}
              </Button>
            </Mask>
          </div>
        </div>

        <Stage
          ref={stageRef}
          width={size}
          height={size}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {image && (
              <URLImage src={image} width={size} height={size}></URLImage>
            )}

            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={3}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        </Stage>
        <Button
          className="default-button submit-button"
          type="primary"
          onClick={handleSubmit}
        >
          {tCommon("Submit Drawing")}
        </Button>
        <Popup visible={feedbackVisible} bodyClassName="feedback-popup">
          {response ? (
            <>
              <div className="rating-group">
                {[0, 1, 2].map((i) => (
                  <div className="rating-item">
                    <Star
                      fill={"#D1D1D1"}
                      key={i}
                      className="back-rating"
                    ></Star>
                    {i < rating && (
                      <Star
                        fill={"#FDB913"}
                        key={"rating" + i}
                        className="rating"
                      ></Star>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="feedback-info"
                style={{ animationDelay: rating + 0.2 + "s" }}
              >
                {response.audio && (
                  <AudioPlayer
                    mode="wave"
                    autoPlay={soundEffectEnd}
                    id="feedback-audio"
                    src={response.audio}
                    className="feedback-audio"
                    color={"var(--black, #242424)"}
                  />
                )}
                {response.text && (
                  <div className="feedback-text">{response.text}</div>
                )}
              </div>
              {status === Status.END ? (
                <>
                  <Button
                    className="default-button continue-button"
                    type="primary"
                    onClick={() => {
                      navigate("/game");
                      clearStatus(); // avoid end status being kept in the store
                    }}
                  >
                    {tCommon("Finish Drawing")}
                  </Button>
                  <Button
                    className="default-button continue-button back-button"
                    onClick={() => {
                      setFeedbackVisible(false);
                      setPlayerId(null);
                      clearStatus(); // avoid end status being kept in the store
                    }}
                  >
                    {tCommon("Back to Drawing")}
                  </Button>
                </>
              ) : (
                <Button
                  className="default-button continue-button"
                  type="primary"
                  onClick={() => {
                    setFeedbackVisible(false);
                    setPlayerId(null);
                  }}
                >
                  {tCommon("Continue Drawing")}
                </Button>
              )}
            </>
          ) : (
            <>
              <DotLoading className="loading"></DotLoading>
            </>
          )}
        </Popup>
      </div>
    </div>
  );
};

export default Draw;
