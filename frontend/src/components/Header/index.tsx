import { useTranslation } from "react-i18next";

import logo from "/logo.png";

import "./index.less";

interface HeaderProps {
  text?: string;
}
const Header: React.FC<HeaderProps> = ({ text }) => {
  const { t } = useTranslation("common");
  return (
    <h1 className="head">
      <img src={logo} alt="logo" className="logo"></img>
      {text ? text : t("app name")}
    </h1>
  );
};

export default Header;
