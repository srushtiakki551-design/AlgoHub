import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from "lucide-react";

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hi, How are you" }] },
    { role: "user", parts: [{ text: "I am Good" }] },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data) => {
    setErrorMsg(null);

    const userMessage = {
      role: "user",
      parts: [{ text: data.message }],
    };

    // FIX: Build new messages list BEFORE sending to server
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    reset();

    setLoading(true);
    try {
      const payload = {
        messages: newMessages,
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode,
      };

      const res = await axiosClient.post("/ai/chat", payload);

      const aiText = res?.data?.message || "No response from server";

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: aiText }] },
      ]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error from AI Chatbot");
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Error from AI Chatbot" }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble bg-base-200 text-base-content">
              {msg.parts?.[0]?.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 p-4 bg-base-100 border-t"
      >
        <div className="flex items-center">
          <input
            {...register("message", { required: true, minLength: 2 })}
            placeholder="Ask me anything"
            className="input input-bordered flex-1"
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-ghost ml-2"
            disabled={loading}
          >
            <Send size={20} />
          </button>
        </div>

        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
      </form>
    </div>
  );
}

export default ChatAi;
