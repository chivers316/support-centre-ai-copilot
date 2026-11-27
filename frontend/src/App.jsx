import { useState, useEffect } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "How many days annual leave do employees get?",
    "What pension contribution does the company provide?",
    "Is MFA mandatory?",
    "How often must cyber security training be completed?",
    "Who provides internet access?"
  ];

  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

    useEffect(() => {

      loadDocuments();

    }, []);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question
    };

    setMessages(prev => [...prev, userMessage]);

    const currentQuestion = question;

    setQuestion("");
    setLoading(true);

        console.log(
        "Selected Documents JSX: ",
            selectedDocuments
        );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
            body: JSON.stringify({
              question: currentQuestion,
              documents: selectedDocuments,
              history: messages
            })
        }
      );

      const data = await response.json();

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
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      await response.json();

      await loadDocuments();

      alert(`${file.name} uploaded successfully`);

    } catch (error) {

      console.error(error);

      alert("Upload failed");

    }
  };

  const loadDocuments = async () => {

      try {

          const response = await fetch(
              "http://127.0.0.1:8000/documents"
          );

          const data =
              await response.json();

          setDocuments(data.documents);
          setSelectedDocuments(data.documents);

      } catch (error) {

          console.error(
              "Unable to load documents",
              error
          );

      }
  };

  const deleteDocument = async (filename) => {

    const confirmed = window.confirm(
      `Delete ${filename}?`
    );

    if (!confirmed) return;

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/documents/${filename}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadDocuments();

    } catch (error) {

      console.error(error);

      alert("Failed to delete document");

    }
  };

  const toggleDocument = (document) => {

    setSelectedDocuments(prev => {

      if (prev.includes(document)) {
        return prev.filter(
          d => d !== document
        );
      }

      return [
        ...prev,
        document
      ];

    });

  };

  return (
    <div className="h-screen bg-slate-100">
      <div className="bg-slate-900 text-white p-4 text-2xl font-bold">
        🤖 Support Centre AI Copilot
      </div>

      <div className="flex h-[calc(100vh-72px)]">
        <div className="w-80 bg-white border-r p-4">
          <h2 className="font-bold mb-4">
            Documents
          </h2>

      {documents.map((doc) => (

        <div
          key={doc}
          className="mb-2 flex items-center justify-between"
        >

          <div className="flex gap-2">

            <input
              type="checkbox"
              checked={
                selectedDocuments.includes(doc)
              }
              onChange={() =>
                toggleDocument(doc)
              }
            />

            <span>{doc}</span>

          </div>

          <button
            onClick={() => deleteDocument(doc)}
            className="text-red-500 hover:text-red-700"
            title="Delete"
          >
            🗑
          </button>

        </div>

      ))}

          <div className="mt-6">

            <label
              className="block bg-blue-600 text-white text-center p-3 rounded cursor-pointer hover:bg-blue-700"
            >
              Upload PDF

              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={uploadFile}
              />

            </label>

          </div>

          <hr className="my-6" />

          <h2 className="font-bold mb-4">
            Suggested Questions
          </h2>

          <select
            className="w-full border rounded p-2"
            onChange={(e) => setQuestion(e.target.value)}
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
                  className={`max-w-3xl rounded-lg p-4 ${
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

                  {message.source && (
                    <div className="mt-3 border-t pt-2 text-xs text-slate-500">
                      📄 Source: {message.source}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white shadow rounded-lg p-4">
                  🤖 Assistant is thinking...
                </div>
              </div>
            )}
          </div>

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