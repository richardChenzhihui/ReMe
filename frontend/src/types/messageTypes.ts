enum Role {
  AGENT = "agent",
  USER = "user",
}

interface MessageContent {
  text?: string;
  audio?: string;
  image?: string;
  images?: string[];
  html?: string;
  mode?: Mode;
}

function isKeyOfMessageContent(key: string): key is keyof MessageContent {
  return (
    ["text", "audio", "image", "images", "html"] as Array<keyof MessageContent>
  ).includes(key as keyof MessageContent);
}

enum Mode {
  DRAW = "draw",
  NEWS = "news",
}

interface Message extends MessageContent {
  id: string;
  role: Role;
}

export { isKeyOfMessageContent, Mode, Role };
export type { Message, MessageContent };
