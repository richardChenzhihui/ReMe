import { ArrowRightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { PUZZLES } from "@/puzzles";
import { ActionIcon, RandomIcon } from "@c/icons";
import Navigator from "@c/Navigator";

import "../Home/index.less";
import "./index.less";

const Game = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <div className="page home-page game-page">
      <Navigator back className="game-nav" title=" " />
      <div className="content">
        <div className="head-container">
          <h1 className="game-head">
            <ActionIcon className="icon" />
            {t("Game Training")}
          </h1>
        </div>

        <div className="row">
          {PUZZLES.map((puzzle) => {
            return (
              <Link
                className={"item-button"}
                key={puzzle.id}
                to={"/chat/" + puzzle.id}
              >
                {puzzle.icon("icon")}
                {t(puzzle.name)}
              </Link>
            );
          })}
        </div>

        <div className="begin-conversion random-conversion">
          <div className="title">
            <RandomIcon className="icon" />
            {t("Random start")}
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
      <div className="footer">
        <a
          href="https://go.microsoft.com/fwlink/?LinkId=521839"
          target="_blank"
        >
          {t("Privacy Statement")}
        </a>
      </div>
    </div>
  );
};

export default Game;
