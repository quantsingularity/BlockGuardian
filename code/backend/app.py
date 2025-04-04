from fastapi import FastAPI
from pydantic import BaseModel
from config import settings

app = FastAPI(title="DeFi Fraud Detection API")

class Transaction(BaseModel):
    tx_hash: str
    value: float
    sender: str
    receiver: str
    timestamp: int

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_transaction(tx: Transaction):
    # Placeholder for ML analysis
    return {
        "tx_hash": tx.tx_hash,
        "risk_score": 0.85,
        "flagged": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)