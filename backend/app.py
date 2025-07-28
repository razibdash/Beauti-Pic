import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import requests
from PIL import Image
from io import BytesIO
from datetime import datetime
import cloudinary.uploader
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
load_dotenv()
# === Load environment variables ===
HF_TOKEN = os.environ.get("HF_TOKEN") or "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"

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)

# === Initialize API clients ===
client = InferenceClient(
    model="stabilityai/stable-diffusion-xl-base-1.0",
    token=HF_TOKEN
)

app = Flask(__name__)

@app.route("/")
def read_root():
    return {"message": "Hello, Flask"}

# === Logging function ===
def log_prompt(prompt: str, cloudinary_url: str):
    with open("image_log.csv", "a") as f:
        timestamp = datetime.now().isoformat()
        f.write(f'"{prompt}","{cloudinary_url}","{timestamp}"\n')

# === Flask route ===
@app.route("/generate-image/", methods=["POST"])
def generate_image():
    data = request.get_json()
    prompt = data.get("prompt")

    if not prompt:
        return jsonify({"error": "Missing prompt"}), 400

    # 1. Generate image from Hugging Face
    image = client.text_to_image(prompt)

    # Save image to bytes
    img_bytes = BytesIO()
    image.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    if not image:
        return jsonify({"error": "Failed to generate image"}), 500

    try:
        image = Image.open(BytesIO(img_bytes.getvalue()))
    except Exception as e:
        return jsonify({"error": f"Invalid image format: {str(e)}"}), 500

    # 2. Save locally
    image_path = "generated_image.png"
    image.save(image_path)
    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(img_bytes, folder="ai_images", public_id=f"image_{datetime.now().strftime('%Y%m%d%H%M%S')}")

    image_url = upload_result["secure_url"]

    return jsonify({
        "message": "Image generated and uploaded",
        "url": image_url
    })

# === Run the Flask app ===
if __name__ == '__main__':
    app.run(host="0.0.0.0", port= 8080, debug= True)
# === End of backend/app.py ===
