import { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const suggestedQuestions = [
    "How many days annual leave do employees get?",
    "What pension contribution does the company provide?",
    "Is MFA mandatory?",
    "How often must cyber security training be completed?",
    "Who provides internet access?"
  ];

  const documents = [
    "Employee Handbook",
    "Benefits Guide",
    "IT Security Policy",
    "Cyber Security Guide",
    "Remote Working Policy"
  ];

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question
    };

    setMessages(prev => [...prev, userMessage]);

    const currentQuestion = question;

    setQuestion("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: currentQuestion
          })
        }
      );

      const data = await response.json();
      console.log("API Response:", data);
      
      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        source: data.source
      };

      setMessages(prev => [
        ...prev,
        assistantMessage
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to connect to the backend."
        }
      ]);
    }
  };

  return (
    <div className="h-screen bg-slate-100">

      <div className="bg-slate-900 text-white p-4 text-2xl font-bold">
        🤖 Support Centre AI Copilot
      </div>

      <div className="flex h-[calc(100vh-72px)]">

        {/* Sidebar */}
        <div className="w-80 bg-white border-r p-4">

          <h2 className="font-bold mb-4">
            Documents
          </h2>

          {documents.map((doc) => (
            <div
              key={doc}
              className="mb-2 flex gap-2"
            >
              <input
                type="checkbox"
                defaultChecked
              />
              <span>{doc}</span>
            </div>
          ))}

          <hr className="my-6" />

          <h2 className="font-bold mb-4">
            Suggested Questions
          </h2>

          <select
            className="w-full border rounded p-2"
            onChange={(e) =>
              setQuestion(e.target.value)
            }
          >
            <option value="">
              Select a question...
            </option>

            {suggestedQuestions.map((q) => (
              <option
                key={q}
                value={q}
              >
                {q}
              </option>
            ))}
          </select>

        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">

          <div className="flex-1 overflow-auto p-6">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`mb-4 flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-xl rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white shadow"
                  }`}
                >

                  <div className="font-bold mb-2">
                    {message.role === "user"
                      ? "You"
                      : "Assistant"}
                  </div>

                  <div>
                    {message.content}
                </div>

                    {
                      message.source && (
                        <div className="mt-2 text-xs text-slate-500">
                          📄 {message.source}
                        </div>
                      )
                    }

                </div>

              </div>

            ))}

          </div>

          {/* Input */}
          <div className="bg-white border-t p-4 flex gap-2">

            <input
              className="flex-1 border rounded p-3"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  askQuestion();
                }
              }}
            />

            <button
              className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700"
              onClick={askQuestion}
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;