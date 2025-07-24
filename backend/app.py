from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch
import uuid
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Load Hugging Face model (only once)
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(
    model_id, torch_dtype=torch.float16
).to("cuda" if torch.cuda.is_available() else "cpu")

# Ensure output folder exists
OUTPUT_DIR = "generated_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route("/api/generate", methods=["POST"])
def generate_image():
    data = request.get_json()
    prompt = data.get("prompt")
    resolution = data.get("resolution", "512x512")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        width, height = map(int, resolution.split("x"))

        # Generate image
        image = pipe(prompt, height=height, width=width).images[0]
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        image.save(filepath)

        return send_file(filepath, mimetype="image/png")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
