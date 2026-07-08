import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";

type Message = {
  from: "user" | "bot";
  text: string;
};

const quickReplies = [
  "상품은 카테고리별로 Bag, Wallet, Accessory를 먼저 둘러보실 수 있어요.",
  "원데이 클래스는 가능한 날짜와 시간을 선택한 뒤 예약금 결제로 확정됩니다.",
  "배송비와 주문 정보는 결제 화면에서 최종 확인할 수 있어요."
];

function answerFor(question: string) {
  if (/예약|class|수업/i.test(question)) return quickReplies[1];
  if (/배송|결제|주문/i.test(question)) return quickReplies[2];
  if (/공방|위치|contact/i.test(question)) {
    return "h'our는 서울 광진구 광장로 67 1층에 있는 가죽공방입니다. Contact 페이지에서 문의 정보를 확인하실 수 있어요.";
  }
  return quickReplies[0];
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "안녕하세요. 상품, 예약, 배송, 공방 정보를 도와드릴게요." }
  ]);
  const [input, setInput] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { from: "user", text: question },
      { from: "bot", text: answerFor(question) }
    ]);
    setInput("");
  };

  if (!open) {
    return (
      <button className="chatbot-launcher" onClick={() => setOpen(true)} aria-label="AI 챗봇 열기">
        <MessageCircle size={22} />
      </button>
    );
  }

  return (
    <aside className="chatbot-panel" aria-label="AI 챗봇">
      <div className="chatbot-header">
        <div>
          <strong>h&apos;our guide</strong>
          <span>AI chatbot preview</span>
        </div>
        <button className="icon-button" onClick={() => setOpen(false)} aria-label="AI 챗봇 닫기">
          <X size={20} />
        </button>
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <p key={`${message.from}-${index}`} className={message.from}>
            {message.text}
          </p>
        ))}
      </div>
      <form className="chatbot-form" onSubmit={submit}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="질문을 입력하세요" />
        <button type="submit" aria-label="질문 보내기">
          <Send size={18} />
        </button>
      </form>
    </aside>
  );
}
