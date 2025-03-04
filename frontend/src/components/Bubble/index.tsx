import { Button } from "antd";
import { DotLoading } from "antd-mobile";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Message, Mode } from "@/types/messageTypes";
import AudioPlayer from "@c/AudioPlayer";
import logo from "/logo.png";

import { AvtarIcon, DrawTwoToneIcon } from "../icons";
import { ImagesViewer, ImageViewer } from "../ImageViewer";

import "./index.less";

interface BubbleProps extends Message {
  autoPlay?: boolean;
  loading?: boolean;
  onNext?: () => void;
  tag?: boolean;
}

const Bubble: React.FC<BubbleProps> = ({
  id,
  role,
  mode,
  autoPlay = false,
  text,
  image,
  images,
  audio,
  html,
  loading,
  onNext,
  tag = true,
}) => {
  const { t } = useTranslation("common");

  const AITag = role === "agent" && tag && (
    <div className="content-item label">{t("AI generated")}</div>
  );

  const audioPlayer = audio && (
    <AudioPlayer
      id={id}
      src={audio}
      autoPlay={autoPlay}
      onAudioEnd={onNext}
      onAudioPause={onNext}
      onAutoPlayFailed={onNext}
      className="content-item"
    ></AudioPlayer>
  );

  const imageViewer = image && <ImageViewer src={image} />;

  const imagesViewer = images && <ImagesViewer srcs={images} />;
  const textViewer = text && <div className="content-item text">{text}</div>;
  const htmlViewer = html && (
    <div
      className="content-item text inner-html"
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  );

  const contents = [];
  switch (mode) {
    case Mode.DRAW:
      if (image) {
        contents.push(
          <div className="content draw-content">
            <DrawTwoToneIcon className="draw-icon" />
            <div className="right-div">
              <div className="draw-name">{t("Art Game")}</div>
              <Button className="default-button draw-button">
                <Link to={`/draw/${id}`}>{t("Enter Game")}</Link>
              </Button>
            </div>
          </div>,
        );
      }
      break;
    case Mode.NEWS:
      if (audio) {
        contents.push(
          <div className="content">
            {AITag}
            {audioPlayer}
          </div>,
        );
      }
      if (text || image) {
        contents.push(
          <div className="content content-news">
            <div className="title">{t("Today's News")}</div>
            <div className="news">
              {imageViewer}
              {textViewer}
            </div>
          </div>,
        );
      }
      break;
    default:
      if (text || audio) {
        contents.push(
          <div className="content">
            {AITag}
            {textViewer}
            {htmlViewer}
            {audioPlayer}
          </div>,
        );
      }
      if (image || images) {
        contents.push(
          <div className="content content-image">
            {imageViewer}
            {imagesViewer}
          </div>,
        );
      }
  }

  if (contents.length === 0 && loading) {
    contents.push(
      <div className="content">
        <div className="chat-loading">
          <DotLoading></DotLoading>
        </div>
      </div>,
    );
  }

  return (
    <div className="bubble-group">
      {contents.map((content, index: number) => (
        <div className={`bubble ${role}-bubble`} key={index}>
          {(index == 0 || mode !== Mode.NEWS) && (
            <div className="role" style={{ opacity: index === 0 ? 1 : 0 }}>
              {role === "user" ? (
                <AvtarIcon className="role-icon" />
              ) : (
                <img src={logo}></img>
              )}
            </div>
          )}
          {content}
        </div>
      ))}
    </div>
  );
};

export default Bubble;
