"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageURL, setImageURL] = useState("https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D");
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
    <main className="min-h-screen bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white px-4 py-10 flex flex-col items-center transition-all duration-500">

      <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 shadow-2xl rounded-xl p-6">
         <div className="flex justify-between items-start">
             
              <h1 className="text-4xl font-bold mb-6 text-center">🎨 AI Image Generator</h1>
               <ThemeToggle />
         </div>
        

        <div className="space-y-4">
          {/* Prompt Box */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Imagine a magical forest with glowing animals..."
            className="w-full p-3 text-lg rounded-lg border border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 bg-gray-50 dark:bg-zinc-800 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
          />

          {/* Resolution Selector */}
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full p-2 text-sm rounded border border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-700"
          >
            <option value="512x512">512 x 512</option>
            <option value="768x768">768 x 768</option>
            <option value="1024x1024">1024 x 1024</option>
          </select>

          {/* Generate Button */}
          <button
            onClick={generateImage}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg text-lg font-semibold transition transform hover:scale-105 hover:shadow-xl active:scale-95 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Generating..." : "Generate Image 🚀"}
          </button>
        </div>

        {/* Image Display */}
        {imageURL && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="p-1 rounded-xl border-4 border-dashed border-indigo-400 animate-pulse hover:animate-none transition-all">
              <image
                src={imageURL}
                alt="Generated"
                className="rounded-lg shadow-lg w-[400px] border border-gray-300 dark:border-zinc-600"
              />
            </div>

            <button
              onClick={downloadImage}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 hover:ring-2 hover:ring-green-400 hover:shadow-lg active:scale-95"
            >
              ⬇️ Download Image
            </button>
          </div>
        )}

        {/* Prompt History */}
        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3">🕘 History</h2>
            <ul className="space-y-2">
              {history.map((item, i) => (
                <li
                  key={i}
                  className="bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded p-2 text-sm"
                >
                  <span className="font-medium">{item.timestamp}</span>: {item.prompt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
