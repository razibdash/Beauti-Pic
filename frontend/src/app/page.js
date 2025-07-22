"use client";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [resolution, setResolution] = useState("512x512");

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setImageURL(null);
    toast.loading("Generating image...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, resolution }),
      });

      if (!res.ok) throw new Error("Image generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageURL(url);
      toast.dismiss();
      toast.success("Image generated!");

      setHistory((prev) => [
        { prompt, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    } catch (err) {
      toast.dismiss();
      toast.error("Generation failed");
    }

    setLoading(false);
  };

  const downloadImage = () => {
    if (!imageURL) return;
    const a = document.createElement("a");
    a.href = imageURL;
    a.download = "generated-image.png";
    a.click();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">🎨 AI Image Generator</h1>

      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your image..."
          className="w-full p-2 border border-gray-300 rounded"
        />

        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="512x512">512 x 512</option>
          <option value="768x768">768 x 768</option>
          <option value="1024x1024">1024 x 1024</option>
        </select>

        <button
          onClick={generateImage}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {imageURL && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <Image
            src={imageURL}
            alt="Generated"
            className="rounded shadow-lg w-[400px] border"
          />
          <button
            onClick={downloadImage}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ⬇️ Download Image
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-10 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">🕘 History</h2>
          <ul className="space-y-1 text-sm">
            {history.map((item, i) => (
              <li key={i} className="bg-white p-2 rounded border text-gray-700">
                <strong>{item.timestamp}</strong>: {item.prompt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

