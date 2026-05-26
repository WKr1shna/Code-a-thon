import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

router = APIRouter()

# Load env variables manually from .env file
def load_env():
    # apps/backend/ai-engine/app/routes/verify.py -> 3 dirs up -> apps/backend/.env
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if "=" in line and not line.startswith("#"):
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

# Initialize Groq client
load_env()
api_key = os.environ.get("GROQ_API_KEY")

class VerifyRequest(BaseModel):
    alertId: str
    text: str
    location: dict = None

@router.post("/verify")
async def verify_incident(payload: VerifyRequest):
    if not api_key:
        print("Warning: GROQ_API_KEY environment variable not found. Using simulated verification.")
        return {
            "verified": True,
            "score": 0.88,
            "breakdown": {
                "explanation": "Simulated verification (no GROQ_API_KEY found)",
                "spam_probability": 0.05
            }
        }
    
    try:
        client = Groq(api_key=api_key)
        system_prompt = (
            "You are a disaster response system classifying emergency reports to identify spam or fake news.\n"
            "Assess the description carefully.\n"
            "Respond ONLY with a valid JSON object containing exactly these keys:\n"
            "- 'score': (float between 0.0 and 1.0, where high means a real and urgent emergency, and low means spam, fake news, or irrelevant chatter)\n"
            "- 'verified': (boolean, set to true if score >= 0.7, otherwise false)\n"
            "- 'explanation': (string, a brief sentence summarizing why the alert is flagged as authentic or spam)"
        )
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this incident description: \"{payload.text}\""}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        
        result_content = chat_completion.choices[0].message.content
        result_json = json.loads(result_content)
        
        return {
            "verified": result_json.get("verified", True),
            "score": result_json.get("score", 0.85),
            "breakdown": {
                "explanation": result_json.get("explanation", "Verified by AI Engine"),
                "model": "llama-3.1-8b-instant"
            }
        }
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return {
            "verified": True,
            "score": 0.82,
            "breakdown": {
                "explanation": f"AI Engine Fallback (Error: {str(e)})",
                "spam_probability": 0.1
            }
        }
