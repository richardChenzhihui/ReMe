import { Result, SpinLoading } from "antd-mobile";
import { useTranslation } from "react-i18next";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { formatDate } from "@/dateUtil";
import useLifelogStore from "@/store/useLifelogStore";
import Navigator from "@c/Navigator";
import "swiper/css";
import "swiper/css/pagination";

import "./index.less";

const LifelogDetail = () => {
  const { i18n } = useTranslation();

  const lifelog = useLifelogStore((state) => state.lifelog);
  let loading = false;
  if (!lifelog) {
    loading = true;
  }

  let content = <></>;
  if (loading) {
    content = (
      <div className="content">
        <SpinLoading style={{ "--size": "48px", marginTop: "25vh" }} />
      </div>
    );
  } else if (lifelog) {
    const { timestamp, title, story, images } = lifelog;
    content = (
      <div className="lifelog-detail">
        <div className="top-div">
          <div className="title">{title}</div>
          <div className="date">
            {formatDate(new Date(timestamp), i18n.language)}
          </div>
        </div>
        {
          <Swiper
            pagination={{
              type: "fraction",
              el: ".pagination-number",
            }}
            modules={[Pagination]}
            loop={true}
            className="view-swiper"
          >
            {images.map((src) => (
              <SwiperSlide key={src}>
                <img className="view-image" src={src} />
              </SwiperSlide>
            ))}
          </Swiper>
        }
        {story && <div className="story">{story}</div>}
      </div>
    );
  } else {
    content = <Result status="error" title="404" description="回忆不存在" />;
  }
  return (
    <div className="page lifelog-detail-page">
      <Navigator back></Navigator>
      {content}
    </div>
  );
};

export default LifelogDetail;
