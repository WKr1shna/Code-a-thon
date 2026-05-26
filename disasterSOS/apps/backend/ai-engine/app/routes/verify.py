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
            "score": 0.95,
            "spam_probability": 0.05,
            "breakdown": {
                "explanation": "Simulated verification (no GROQ_API_KEY found)",
                "spam_probability": 0.05
            }
        }
    
    try:
        client = Groq(api_key=api_key)
        system_prompt = (
            "You are an emergency response AI validating incoming citizen incident reports to filter out spam, hoaxes, advertising, or fake news.\n"
            "Analyze the text carefully. Evaluate the spam likelihood based on specificity, urgency, vocabulary, and relevance to public safety/natural disasters.\n"
            "Respond ONLY with a valid JSON object containing exactly these keys:\n"
            "- 'spam_probability': (float between 0.0 and 1.0, where 0.0 means a 100% genuine and urgent emergency alert that requires immediate rescue, and 1.0 means it is definitely spam, advertising, random chatter, or a hoax)\n"
            "- 'verified': (boolean, set to true if spam_probability < 0.3, otherwise false)\n"
            "- 'explanation': (string, a brief sentence explaining why the alert is classified with this probability)"
        )
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Incident description to analyze: \"{payload.text}\""}
            ],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        
        result_content = chat_completion.choices[0].message.content
        result_json = json.loads(result_content)
        
        spam_prob = result_json.get("spam_probability", 0.1)
        score = 1.0 - spam_prob
        
        return {
            "verified": result_json.get("verified", spam_prob < 0.3),
            "score": score,
            "spam_probability": spam_prob,
            "breakdown": {
                "explanation": result_json.get("explanation", "Verified by prompt-based AI Engine"),
                "spam_probability": spam_prob,
                "model": "llama-3.1-8b-instant"
            }
        }
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        return {
            "verified": True,
            "score": 0.85,
            "spam_probability": 0.15,
            "breakdown": {
                "explanation": f"AI Engine Fallback (Error: {str(e)})",
                "spam_probability": 0.15,
                "model": "llama-3.1-8b-instant"
            }
        }
