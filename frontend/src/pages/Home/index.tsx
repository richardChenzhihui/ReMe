import { ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import Header from "@c/Header";
import { ActionIcon, ChatIcon, FeedbackIcon } from "@c/icons";
import Navigator from "@c/Navigator";

import "./index.less";

const Home = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      <Navigator />
      <div className="content">
        <div className="head-container">
          <Header />
          <p className="desc">{t("slogan")}</p>
        </div>
        <div className="row">
          <Link className="item-button memory-protection" to="/game">
            <ActionIcon className="icon" />
            {t("Game Training")}
          </Link>
          <Link className="item-button" to="/feedback">
            <FeedbackIcon className="icon" />
            {t("User Feedback")}
          </Link>
        </div>

        <div className="begin-conversion">
          <div className="title">
            <ChatIcon className="icon" />
            {t("Start Conversation")}
          </div>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ArrowRightOutlined className="icon" />}
            className="start-button"
            onClick={() => {
              navigate("/chat");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
