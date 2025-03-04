import { Button } from "antd";
import type { ImageUploadItem } from "antd-mobile";
import { ImageUploader, Input, TextArea, Toast } from "antd-mobile";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { createLifelog } from "@/api";
import { formatDate } from "@/dateUtil";
import { HistoryIcon, ImagesIcon, SuccessIcon } from "@c/icons";
import Navigator from "@c/Navigator";

import "./index.less";

const UploadLife = () => {
  const { t } = useTranslation("common");
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const date = useMemo(() => new Date(), []);
  const [imageList, setImageList] = useState<ImageUploadItem[]>([]);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [succeed, setSucceed] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [story, setStory] = useState<string>("");

  async function upload(file: File): Promise<ImageUploadItem> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          resolve({
            url: reader.result as string,
          });
        },
        false,
      );
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  const onChange = (images: ImageUploadItem[]) => {
    console.log(images);
    setImageList(images);
    if (!uploaded) {
      setUploaded(true);
    }
  };

  const uploadLifeLog = async () => {
    if (!title) {
      Toast.show({
        icon: "fail",
        content: t("Title is required"),
      });
      return;
    }
    if (imageList.length === 0) {
      Toast.show({
        icon: "fail",
        content: t("Please upload an image"),
      });
      return;
    }
    createLifelog(
      date.getTime(),
      title,
      imageList.map((item) => item.url),
      story,
    ).then(() => {
      setSucceed(true);
    });
  };

  return (
    <div className="page upload-page">
      <Navigator back />
      <div className="content">
        {uploaded ? (
          <>
            {succeed ? (
              <>
                <div className="input-title">{title}</div>
                <div className="date">{formatDate(date, i18n.language)}</div>
                <div className="upload-success">
                  <SuccessIcon className="success-icon" />
                  <div className="success-text">{t("Upload Successful")}</div>
                </div>
                <div className="upload-images">
                  {imageList.map((image) => (
                    <img
                      src={image.url}
                      className="upload-image"
                      key={image.url}
                    />
                  ))}
                </div>

                {story && <div className="input-story"> {story}</div>}
                <Button
                  className="default-button history-button"
                  type="primary"
                  ghost
                  icon={<HistoryIcon className="history-icon" />}
                  onClick={() => navigate("/lifelog")}
                >
                  {t("View Other Memories")}
                </Button>
              </>
            ) : (
              <>
                <Input
                  className="input-title"
                  value={title}
                  onChange={setTitle}
                  placeholder={t("Title")}
                />
                <div className="date">{formatDate(date, i18n.language)}</div>
                <ImageUploader
                  upload={upload}
                  value={imageList}
                  onChange={onChange}
                  maxCount={5}
                  multiple
                  className="image-uploader"
                ></ImageUploader>
                <div className="desc-story">{t("Describe Your Story")}</div>
                <TextArea
                  className="input-story"
                  rows={8}
                  placeholder={t(
                    "Where were these photos taken? Do they have any special stories?",
                  )}
                  value={story}
                  onChange={setStory}
                />
                <Button
                  className="default-button finish-button"
                  type="primary"
                  icon={<ImagesIcon className="finish-icon" />}
                  onClick={uploadLifeLog}
                >
                  {t("Finish")}
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <div className="upload-head">
              <h1>{t("Upload Memories")}</h1>
              <h2>{t("Create Your Own Memories")}</h2>
            </div>
            <ImageUploader
              upload={upload}
              value={imageList}
              onChange={onChange}
              multiple
              maxCount={5}
            >
              <div className="upload-button">
                <div className="upload-icon"></div>
                <div className="upload-text">{t("Upload Photos Here")}</div>
              </div>
            </ImageUploader>
            <Button
              className="default-button history-button"
              type="primary"
              ghost
              icon={<HistoryIcon className="history-icon" />}
              onClick={() => navigate("/lifelog")}
            >
              {t("View Memories")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadLife;
