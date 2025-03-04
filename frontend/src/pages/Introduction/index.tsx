import { Button, theme } from "antd";
import { Swiper } from "antd-mobile";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import Header from "@c/Header";
import image1 from "/introduction/Image1.png";
import image2 from "/introduction/Image2.png";
import image3 from "/introduction/Image3.png";
import image4 from "/introduction/Image4.png";
import image5 from "/introduction/Image5.png";
import image6 from "/introduction/Image6.png";
import image7 from "/introduction/Image7.png";

import "./index.less";

const { useToken } = theme;

const Introduction = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const images = [image1, image2, image3, image4, image5, image6, image7];
  const items = images.map((image, index) => (
    <Swiper.Item key={index}>
      <img src={image} alt="" className="introduction-image" />
    </Swiper.Item>
  ));

  const { token } = useToken();
  const color = token.colorPrimary;

  return (
    <div className="page introduction-page">
      <Header />

      <p className="introduction">{t("slogan")}</p>

      <Swiper
        loop
        autoplay
        className="introduction-swiper"
        indicatorProps={{
          style: {
            "--active-dot-color": color,
            "--active-dot-size": "0.5rem",
            "--dot-size": "0.5rem",
            "--dot-border-radius": "0.25rem",
            "--dot-spacing": "0.75rem",
          },
        }}
      >
        {items}
      </Swiper>

      <Button
        type="primary"
        htmlType="submit"
        className="default-button login-button"
        onClick={() => {
          navigate("/login");
        }}
      >
        {t("log in")}
      </Button>
      <div className="register-container">
        <span>{t("First time here?")}</span>
        <Link className="register" to="/register">
          {t("register")}
        </Link>
      </div>
    </div>
  );
};

export default Introduction;
