import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

router = APIRouter()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

class Location(BaseModel):
    lat: float
    lng: float

class VerifyRequest(BaseModel):
    alertId: str
    text: str
    location: Location

@router.post("/verify")
def verify_incident(req: VerifyRequest):
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI spam filter for an emergency SOS system. Your job is to read user reports and decide if they are genuine emergencies or fake/spam. Respond ONLY with a valid JSON object containing exactly two keys: 'verified' (boolean, True if genuine, False if fake/spam) and 'spam_score' (float between 0.0 and 1.0, where 1.0 means 100% spam/fake, 0.0 means 0% spam)."
                },
                {
                    "role": "user",
                    "content": req.text
                }
            ],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        response_json_str = completion.choices[0].message.content
        response_data = json.loads(response_json_str)
        
        verified = response_data.get("verified", True)
        spam_score = response_data.get("spam_score", 0.02)
        
        return {"verified": bool(verified), "spam_score": float(spam_score)}
    except Exception as e:
        print(f"Groq API Error: {str(e)}")
        # Fallback to true if API fails
        return {"verified": True, "spam_score": 0.02}
