import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { asr, feedback } from "@/api";
import useHistoryStore from "@/store/useHistoryStore";
import useStatusStore from "@/store/useStatusStore";
import { MessageContent, Role } from "@/types/messageTypes";
import { Status } from "@/types/statusTypes";
import Bubble from "@c/Bubble";
import Navigator from "@c/Navigator";
import Toolbar from "@c/Toolbar";

import "../Chat/index.less";
import "./index.less";

const Feedback = () => {
  const tCommon = useTranslation("common").t;
  const tUrl = useTranslation("url").t;

  const history = useHistoryStore((state) => state.history);
  const setStatus = useStatusStore((state) => state.setStatus);
  const initSessionStore = useHistoryStore((state) => state.initSession);
  const addMessage = useHistoryStore((state) => state.addMessage);
  const updateMessage = useHistoryStore((state) => state.updateMessage);

  useEffect(() => {
    initSessionStore("feedback", Role.AGENT, {
      text: tCommon("feedback collection start"),
      audio: tUrl("feedback collection start"),
    });
    setStatus(Status.VOID);
  }, [initSessionStore, setStatus, tCommon, tUrl]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 20);
  }, [history]);

  const sendMessage = (message: MessageContent) => {
    const userMessageId = addMessage(Role.USER, message);
    const agentMessageId = addMessage(Role.AGENT, {});
    setStatus(Status.GENERATING);
    feedback(message).then((response) => {
      if (response) {
        setStatus(Status.VOID);
        updateMessage(agentMessageId, {
          text: tCommon("feedback collection end"),
          audio: tUrl("feedback collection end"),
        });
      }
    });
    if (message.audio) {
      asr(message.audio).then((text) => {
        updateMessage(userMessageId, {
          text: text,
        });
      });
    }
  };

  return (
    <div className="chat-page feedback-page">
      <Navigator back />
      <div className="chat-content" ref={containerRef}>
        {history.map((item, index: number) => (
          <Bubble
            key={item.id}
            {...item}
            autoPlay={item.role === Role.AGENT && index === history.length - 1}
            tag={false}
          />
        ))}
      </div>
      <Toolbar sendMessage={sendMessage} />
    </div>
  );
};

export default Feedback;
