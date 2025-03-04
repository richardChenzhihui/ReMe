import axios from "axios";

import { serverPath, SUCCESS } from "@/api/config";
import { handelError, messageContentToBackendContent } from "@/api/util";
import { MessageContent } from "@/types/messageTypes";

const feedback = async (messageContent: MessageContent) => {
  const content = await messageContentToBackendContent(messageContent);
  const formData = new FormData();
  formData.append("data", JSON.stringify({ feedback: content }));
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: formData,
    url: `${serverPath}/api/v1/feedback/upload`,
    withCredentials: true,
  };
  try {
    const response = await axios(config);
    const { data } = response;
    if (data && data.code === SUCCESS) {
      return true;
    }
    throw new Error(data.message);
  } catch (error: any) {
    console.log(error);
    handelError(error);
    return false;
  }
};

export { feedback };
