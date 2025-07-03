import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
from PIL import Image, UnidentifiedImageError
from io import BytesIO
import requests
import tempfile
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/verify-face")
async def verify_face(
    live_image: UploadFile = File(...),
    stored_url: str = Form(...)
):
    try:
        # Read and decode uploaded image
        live_bytes = await live_image.read()
        try:
            live_image_pil = Image.open(BytesIO(live_bytes)).convert("RGB")
        except UnidentifiedImageError:
            return JSONResponse({"error": "Invalid uploaded image format"}, status_code=400)

        # Fetch and decode stored image
        response = requests.get(stored_url)
        if response.status_code != 200:
            return JSONResponse({"error": "Could not fetch stored face image"}, status_code=400)

        try:
            stored_image_pil = Image.open(BytesIO(response.content)).convert("RGB")
        except UnidentifiedImageError:
            return JSONResponse({"error": "Invalid stored image format"}, status_code=400)

        # Create temp files that can be reopened for write on Windows
        live_tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        stored_tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        live_tmp.close()
        stored_tmp.close()

        try:
            live_image_pil.save(live_tmp.name)
            stored_image_pil.save(stored_tmp.name)

            # Perform face verification
            result = DeepFace.verify(
                img1_path=live_tmp.name,
                img2_path=stored_tmp.name,
                enforce_detection=False
            )
        finally:
            # Clean up temporary files
            os.unlink(live_tmp.name)
            os.unlink(stored_tmp.name)

        return JSONResponse({
            "match": result["verified"],
            "distance": result["distance"]
        }, status_code=200 if result["verified"] else 401)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)
