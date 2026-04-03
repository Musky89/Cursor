import io
import os
import hashlib
from pathlib import Path

import torch
from diffusers import AutoPipelineForText2Image
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OUTPUT_DIR = Path(__file__).parent / "generated"
OUTPUT_DIR.mkdir(exist_ok=True)

pipe = None


def get_pipe():
    global pipe
    if pipe is None:
        pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float32,
            variant=None,
        )
        pipe.to("cpu")
        pipe.set_progress_bar_config(disable=True)
    return pipe


class GenerateRequest(BaseModel):
    prompt: str
    width: int = 512
    height: int = 512
    steps: int = 4
    seed: int | None = None


@app.post("/generate")
def generate_image(req: GenerateRequest):
    prompt_hash = hashlib.sha256(req.prompt.encode()).hexdigest()[:16]
    seed = req.seed if req.seed is not None else int(prompt_hash, 16) % (2**32)
    filename = f"{prompt_hash}_{seed}.png"
    filepath = OUTPUT_DIR / filename

    if filepath.exists():
        return JSONResponse({"url": f"/images/{filename}", "cached": True})

    generator = torch.Generator("cpu").manual_seed(seed)
    p = get_pipe()
    result = p(
        prompt=req.prompt,
        num_inference_steps=req.steps,
        guidance_scale=0.0,
        width=req.width,
        height=req.height,
        generator=generator,
    )
    image = result.images[0]
    image.save(filepath)

    return JSONResponse({"url": f"/images/{filename}", "cached": False})


@app.get("/images/{filename}")
def serve_image(filename: str):
    filepath = OUTPUT_DIR / filename
    if not filepath.exists():
        return JSONResponse({"error": "not found"}, status_code=404)
    return FileResponse(filepath, media_type="image/png")


@app.get("/health")
def health():
    return {"status": "ok", "model": "sdxl-turbo", "device": "cpu"}
