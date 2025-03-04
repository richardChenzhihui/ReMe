import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import approveBadge from "/approveBadge.png";

import Header from "../Header";

import "./index.less";

const SuccessRegistration = () => {
  const { t } = useTranslation("common");

  return (
    <div className="page success-registration">
      <Header />
      <img src={approveBadge} className="success-img"></img>
      <p className="p1 text1">
        {t("Welcome! You've successfully signed up and joined us.")}
      </p>

      <div>
        <Link className="home" to="/home">
          {t("Go home")}
        </Link>
      </div>
    </div>
  );
};

export default SuccessRegistration;
