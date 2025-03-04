import { Button, Select } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";

import { getLifelogList } from "@/api";
import { getDay, getMonth } from "@/dateUtil";
import useLifelogStore from "@/store/useLifelogStore";
import type { Lifelog } from "@/types/lifelogTypes";
import Navigator from "@c/Navigator";
import "swiper/css";

import "./index.less";

const Lifelog = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { i18n } = useTranslation();
  const [lifelogs, setLifelogs] = useState<Lifelog[]>();

  const setLifelog = useLifelogStore((state) => state.setLifelog);

  useEffect(() => {
    getLifelogList().then((response) => {
      if (response) {
        const { lifelogs } = response;
        setLifelogs(lifelogs);
      }
    });
  }, []);

  const navigateToDetail = (lifelog: Lifelog) => {
    setLifelog(lifelog);
    navigate("/lifelog/detail");
  };

  return (
    <div className="page lifelog-page">
      <Navigator back />
      <h1 className="lifelog-head">{t("My Memories")}</h1>
      <Select
        className="year-select"
        variant="borderless"
        value={"2024"}
        options={[{ value: "2024", label: "2024" }]}
      ></Select>

      <Swiper slidesPerView={"auto"} spaceBetween={18} className="lifelog-list">
        {lifelogs?.map((lifelog) => {
          const { timestamp, title, images } = lifelog;
          const date = new Date(timestamp);
          return (
            <SwiperSlide
              className="lifelog-snapshot"
              style={{
                background: `url(${images[0]}) no-repeat center center`,
              }}
              key={timestamp}
              onClick={() => {
                navigateToDetail(lifelog);
              }}
            >
              <div className="date">
                <div className="day">{getDay(date)}</div>
                <div>{getMonth(date, i18n.language)}</div>
              </div>
              <div className="bottom-div">
                <div className="title">{title}</div>
                <Button
                  className="default-button detail-button"
                  onClick={() => {
                    navigateToDetail(lifelog);
                  }}
                >
                  {t("View Memories")}
                </Button>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Lifelog;
