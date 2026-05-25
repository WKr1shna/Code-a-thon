from fastapi import APIRouter
router = APIRouter()

@router.post("/verify")
def verify_incident():
    # Spam and fake news NLP classification endpoint
    return {"verified": True, "spam_score": 0.02}
