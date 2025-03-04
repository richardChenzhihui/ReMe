import axios from "axios";

import { serverPath, SUCCESS } from "@/api/config";
import { backendContentToMessageContent, handelError } from "@/api/util";

const createLifelog = async (
  timestamp: number,
  title: string,
  images: string[],
  story?: string,
) => {
  const content = [];
  for (const image of images) {
    content.push({
      type: "image",
      data: image,
    });
  }
  if (story) {
    content.push({
      type: "text",
      data: story,
    });
  }
  console.log(content);
  const formData = new FormData();
  formData.append(
    "data",
    JSON.stringify({
      timestamp,
      title,
      content,
    }),
  );
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
    url: `${serverPath}/api/v1/lifelog`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    console.log(data);
    if (data && data.code === SUCCESS) {
      return true;
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

const getLifelogList = async () => {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      page: 1,
      pageSize: 50,
    },
    url: `${serverPath}/api/v1/lifelog`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    console.log(data);
    if (data && data.code === SUCCESS) {
      return {
        lifelogs: data.data.lifelog.map((item: any[]) => {
          const content = backendContentToMessageContent(item[2])[0];
          return {
            timestamp: item[1],
            title: item[0],
            story: content.text,
            images: content.images || [content.image],
          };
        }),
      };
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

const getLifelog = async (id: string) => {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: {},
    url: `${serverPath}/api/v1/lifelog/${id}`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    console.log(data);
    if (data && data.code === SUCCESS) {
      const content = backendContentToMessageContent(data.data.content)[0];

      return {
        timestamp: data.data.timestamp,
        title: data.data.title,
        story: content.text,
        images: content.images || [content.image],
      };
    }
    throw new Error(data.message);
  } catch (error: any) {
    console.log(error);
    handelError(error);
  }
};

export { createLifelog, getLifelog, getLifelogList };
