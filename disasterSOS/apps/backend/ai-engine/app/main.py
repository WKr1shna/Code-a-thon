from fastapi import FastAPI
from app.routes import verify, translate, predict

app = FastAPI(title="Disaster Response AI Engine")
app.include_router(verify.router, prefix="/ai")
app.include_router(translate.router, prefix="/ai")
app.include_router(predict.router, prefix="/ai")
