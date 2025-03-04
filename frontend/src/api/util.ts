import { serverPath } from "@/api/config";
import {
  isKeyOfMessageContent,
  MessageContent,
  Mode,
} from "@/types/messageTypes";

const handelError: (error: any) => Error = (error) => {
  if (
    error &&
    "response" in error &&
    "data" in error.response &&
    "message" in error.response.data
  ) {
    throw new Error(error.response.data.message);
  }
  throw new Error("Network error");
};

const processBackendContent = (content: []) => {
  const messageContent: MessageContent = {};

  let text;
  let audio;
  let html;
  const images: string[] = [];

  for (const item of content) {
    if (
      "type" in item &&
      isKeyOfMessageContent(item["type"]) &&
      "data" in item &&
      typeof item["data"] === "string"
    ) {
      switch (item["type"]) {
        case "text":
          text = item["data"];
          break;
        case "audio":
          audio = serverPath + item["data"];
          break;
        case "image":
          images.push(serverPath + item["data"]);
          break;
        case "html":
          html = item["data"];
          break;
      }
    }
  }
  if (text) {
    messageContent.text = text;
  }
  if (audio) {
    messageContent.audio = audio;
  }
  if (html) {
    messageContent.html = html;
  }
  if (images.length === 1) {
    messageContent.image = images[0];
  } else if (images.length > 1) {
    messageContent.images = images;
  }
  return messageContent;
};

const backendContentToMessageContent = (
  content: [],
  extraInfo?: { hint?: []; news?: []; draw?: [] },
): MessageContent[] => {
  const contents: MessageContent[] = [];
  if (extraInfo) {
    if (extraInfo["hint"]) {
      content = [...content, ...extraInfo["hint"]];
    }
  }
  contents.push(processBackendContent(content));
  if (extraInfo) {
    if (extraInfo["news"]) {
      contents.push({
        ...processBackendContent(extraInfo["news"]),
        mode: Mode.NEWS,
      });
    }
    if (extraInfo["draw"]) {
      contents.push({
        ...processBackendContent(extraInfo["draw"]),
        mode: Mode.DRAW,
      });
    }
  }
  return contents;
};

const messageContentToBackendContent = async (content: MessageContent) => {
  const backendContent = [];
  const types = ["text", "audio", "image"] as const;
  for (const type of types) {
    if (content[type]) {
      backendContent.push({
        type: type,
        data: content[type],
      });
    }
  }
  if (content.images) {
    for (const image of content.images) {
      backendContent.push({
        type: "image",
        data: image,
      });
    }
  }
  return backendContent;
};

export {
  backendContentToMessageContent,
  handelError,
  messageContentToBackendContent,
};
