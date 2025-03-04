import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { asr, chat } from "@/api";
import { initSession } from "@/api";
import { PUZZLES } from "@/puzzles";
import useHistoryStore from "@/store/useHistoryStore";
import useStatusStore from "@/store/useStatusStore";
import { MessageContent, Role } from "@/types/messageTypes";
import { Status } from "@/types/statusTypes";
import Bubble from "@c/Bubble";
import Navigator from "@c/Navigator";
import Toolbar from "@c/Toolbar";

import "./index.less";

const Chat = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation("common");

  const { pid } = useParams<{ pid: string }>();

  const history = useHistoryStore((state) => state.history);
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const initSessionStore = useHistoryStore((state) => state.initSession);
  const addPendingMessage = useHistoryStore((state) => state.addPendingMessage);
  const shiftPendingMessage = useHistoryStore(
    (state) => state.shiftPendingMessage,
  );
  const status = useStatusStore((state) => state.status);
  const setStatus = useStatusStore((state) => state.setStatus);
  const clearStatus = useStatusStore((state) => state.clearStatus);
  const sessionId = useHistoryStore((state) => state.sessionId);
  const addMessage = useHistoryStore((state) => state.addMessage);
  const updateMessage = useHistoryStore((state) => state.updateMessage);

  useEffect(() => {
    // first time
    let puzzle_name = pid;
    if (!puzzle_name) {
      // random puzzle
      const randomPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
      puzzle_name = randomPuzzle.id;
    }

    // fake loading
    initSessionStore("unknown", Role.AGENT, {});
    setStatus(Status.GENERATING);
    initSession(puzzle_name as string, i18n.language).then((result) => {
      if (result) {
        const messageContents = result.messageContents;
        initSessionStore(result.sessionId, Role.AGENT, messageContents[0]);
        if (messageContents.length > 1) {
          for (let i = 1; i < messageContents.length; i++) {
            addPendingMessage(Role.AGENT, messageContents[i]);
          }
        }
        setStatus(Status.VOID);
      }
    });
    return () => {
      clearStatus();
    };
  }, [
    addPendingMessage,
    initSessionStore,
    clearHistory,
    clearStatus,
    setStatus,
    pid,
    i18n.language,
  ]);

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
    console.log("history", history);
    setTimeout(() => {
      scrollToBottom();
    }, 20);
  }, [history]);

  useEffect(() => {
    function showConfetti() {
      confetti({
        particleCount: 60,
        startVelocity: 30,
        angle: 100,
        spread: 25,
        gravity: 0.8,
        zIndex: 9999,
        scalar: 0.7,
        origin: {
          x: 0.7,
          y: 1, // Start from the bottom
        },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          startVelocity: 30,
          angle: 80,
          spread: 25,
          gravity: 0.8,
          zIndex: 9999,
          scalar: 0.7,
          origin: {
            x: 0.3,
            y: 1, // Start from the bottom
          },
        });
      }, 400);
    }
    if (status === Status.END) {
      showConfetti();
    }
  }, [status]);

  const sendMessage = (message: MessageContent) => {
    if (!sessionId) return;
    const userMessageId = addMessage(Role.USER, message);
    const agentMessageId = addMessage(Role.AGENT, {});
    setStatus(Status.GENERATING);
    chat(sessionId, message).then((response) => {
      if (response) {
        const { messageContents, info } = response;
        setStatus(Status.VOID);
        updateMessage(agentMessageId, messageContents[0]);

        if (info && info.end === "end") {
          setStatus(Status.END);
        }
        if (messageContents.length > 1) {
          for (let i = 1; i < messageContents.length; i++) {
            addPendingMessage(Role.AGENT, messageContents[i]);
          }
        }
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
    <div className="chat-page">
      <Navigator back />
      <div className="chat-content" ref={containerRef}>
        {history.map((item, index: number) => (
          <Bubble
            key={item.id}
            {...item}
            autoPlay={item.role === Role.AGENT && index === history.length - 1}
            loading={
              item.role === Role.AGENT &&
              index === history.length - 1 &&
              status === Status.GENERATING
            }
            onNext={() => {
              if (index === history.length - 1) {
                shiftPendingMessage();
              }
            }}
          />
        ))}
      </div>
      <div className="warning">{t("AI warning")}</div>
      <Toolbar sendMessage={sendMessage} />
    </div>
  );
};
export default Chat;
