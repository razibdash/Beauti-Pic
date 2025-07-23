// app/api/generate/route.js
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { prompt, resolution } = await req.json();
  const [width, height] = resolution.split("x").map(Number);

  if (!prompt) {
    return new Response(JSON.stringify({ error: "No prompt" }), { status: 400 });
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${process.env.MODEL_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height },
        options: { wait_for_model: true },
      }),
    }
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to generate image" }), { status: 500 });
  }

  const blob = await response.blob();
  return new Response(blob, {
    headers: { "Content-Type": "image/png" },
  });
}
