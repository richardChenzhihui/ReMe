import { Mask } from "antd-mobile";
import React, { useState } from "react";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { CloseIcon, NextIcon, PrevIcon } from "../icons";

import "./index.less";

const ImageViewer: React.FC<{ src: string; className?: string }> = ({
  src,
  className,
}) => {
  const [visible, setVisible] = useState(false);
  const viewImage = () => {
    setVisible(true);
  };

  return (
    <div className={`image-viewer ${className}`}>
      <img className="preview-image" src={src} onClick={viewImage} />
      <Mask
        visible={visible}
        color="rgba(255, 255, 255, 0.6)"
        className="image-mask"
      >
        <div className="view-image-container">
          <CloseIcon className="close-icon" onClick={() => setVisible(false)} />
          <img className="view-image" src={src} />
        </div>
      </Mask>
    </div>
  );
};

const ImagesViewer: React.FC<{ srcs: string[]; className?: string }> = ({
  srcs,
  className,
}) => {
  const [viewIndex, setViewIndex] = useState(-1);
  const viewImage = (index: number) => {
    setViewIndex(index);
  };

  return (
    <div className={`images-viewer ${className}`}>
      <div className="prev-button">
        <PrevIcon />
      </div>
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        initialSlide={1}
        loop={false}
        coverflowEffect={{
          rotate: 0,
          stretch: 10,
          depth: 100,
          modifier: 1,
          scale: 0.9,
          slideShadows: false,
        }}
        navigation={{
          enabled: true,
          nextEl: ".next-button",
          prevEl: ".prev-button",
        }}
        modules={[EffectCoverflow, Navigation]}
        className="preview-swiper"
      >
        {srcs.map((src, index) => (
          <SwiperSlide key={index}>
            <img src={src} onClick={() => viewImage(index)} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="next-button">
        <NextIcon />
      </div>
      <Mask
        visible={viewIndex >= 0}
        color="rgba(255, 255, 255, 0.6)"
        className="image-mask"
      >
        <div className="view-image-container">
          <CloseIcon className="close-icon" onClick={() => setViewIndex(-1)} />
          <Swiper
            pagination={{
              type: "fraction",
              el: ".pagination-number",
            }}
            modules={[Pagination]}
            loop={true}
            className="view-swiper"
          >
            {srcs.map((src, index) => (
              <SwiperSlide key={index}>
                <img className="view-image" src={src} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="pagination-number"></div>
        </div>
      </Mask>
    </div>
  );
};

export { ImagesViewer, ImageViewer };
