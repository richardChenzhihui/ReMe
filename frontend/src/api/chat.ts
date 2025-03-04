import axios from "axios";
import axiosRetry from "axios-retry";

import { serverPath, SUCCESS } from "@/api/config";
import {
  backendContentToMessageContent,
  handelError,
  messageContentToBackendContent,
} from "@/api/util";
import { MessageContent } from "@/types/messageTypes";

axiosRetry(axios, {
  retries: 2,
  retryDelay: (retryCount) => {
    return retryCount * 500;
  },
});

const initSession = async (puzzle_name: string, language = "zh-CN") => {
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      puzzle_name,
      language,
    },
    url: `${serverPath}/api/v1/chat`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      return {
        sessionId: data.data["session_id"],
        messageContents: backendContentToMessageContent(
          data.data["message"].content,
          data.data["message"].extra_info,
        ),
      };
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

interface Info {
  end?: string;
  rating?: number;
}
const chat = async (sessionId: string, messageContent: MessageContent) => {
  const content = await messageContentToBackendContent(messageContent);
  const formData = new FormData();
  formData.append("data", JSON.stringify({ content }));
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
    url: `${serverPath}/api/v1/chat/${sessionId}`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      const message = data.data["response_message"];
      console.log(message);
      return {
        messageContents: backendContentToMessageContent(
          message.content,
          message.extra_info,
        ),
        info: message["extra_info"] as Info,
      };
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

const asr: (audio: string) => Promise<string> = async (audio: string) => {
  // audio: url
  // return text
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      audio: audio,
    }),
    url: `${serverPath}/api/v1/chat/util/asr`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      return data.data;
    }
    throw new Error(data.message);
  } catch (error: any) {
    handelError(error);
  }
};

export { asr, chat, initSession };
