import { NavBar, Popup } from "antd-mobile";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  ActionBlackIcon,
  AvtarIcon,
  BackIcon,
  HistoryIcon,
  MenuIcon,
  MicIcon,
  UploadIcon,
} from "@c/icons";

import "./index.less";

interface NavigatorProps {
  back?: boolean;
  title?: string;
  className?: string;
}

const Navigator: React.FC<NavigatorProps> = ({
  back = false,
  title,
  className = "",
}) => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [menuVisible, setMenuVisible] = useState(false);

  const onBack = () => {
    navigate(-1);
  };

  const menuIcon = (
    <MenuIcon
      className="nav-icon menu-icon"
      onClick={() => setMenuVisible(!menuVisible)}
    />
  );
  const navigator = back ? (
    <NavBar
      onBack={onBack}
      backIcon={<BackIcon className="nav-icon back-icon" />}
      className={"navigator navigator-back " + className}
      right={menuIcon}
    >
      {title ? (
        <div className="nav-title">{title}</div>
      ) : (
        <div className="brand">
          <span>{t("app name")}</span>
        </div>
      )}
    </NavBar>
  ) : (
    <div className="navigator navigator-default">
      <AvtarIcon className="nav-icon avtar-icon" />
      {menuIcon}
    </div>
  );

  return (
    <>
      {navigator}
      <Popup
        visible={menuVisible}
        onMaskClick={() => {
          setMenuVisible(false);
        }}
        onClose={() => {
          setMenuVisible(false);
        }}
        position="top"
        className="menu-popup"
      >
        <div className="menu">
          <div className="menu-list">
            <a className="menu-item" href="/upload">
              <UploadIcon className="icon" />
              {t("Upload Memories")}
            </a>
            <a className="menu-item" href="/lifelog">
              <HistoryIcon className="icon" />
              {t("View Memories")}
            </a>
            <a className="menu-item" href="/game">
              <ActionBlackIcon className="icon" />
              {t("Game Training")}
            </a>
            <a className="menu-item menu-item-primary" href="/chat">
              <MicIcon className="icon" />
              {t("Start Conversation")}
            </a>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default Navigator;
