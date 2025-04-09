from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from config import settings
import pymongo
from datetime import datetime
import uuid

app = FastAPI(title="DeFi Fraud Detection API")

# MongoDB connection
try:
    client = pymongo.MongoClient(settings.MONGODB_URI)
    db = client.fraud_detection
    transactions_collection = db.transactions
    alerts_collection = db.alerts
    risk_reports_collection = db.risk_reports
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

class Transaction(BaseModel):
    tx_hash: str
    value: float
    sender: str
    receiver: str
    timestamp: int

@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/analyze")
async def analyze_transaction(tx: Transaction):
    # Placeholder for ML analysis
    risk_score = 0.85  # This would come from ML model in production
    flagged = risk_score > 0.7
    
    # Store transaction in MongoDB
    transaction_data = {
        "tx_hash": tx.tx_hash,
        "value": tx.value,
        "sender": tx.sender,
        "receiver": tx.receiver,
        "timestamp": tx.timestamp,
        "risk_score": risk_score,
        "flagged": flagged,
        "created_at": datetime.now()
    }
    
    try:
        transactions_collection.insert_one(transaction_data)
        
        # If flagged, also add to alerts collection
        if flagged:
            alert_data = transaction_data.copy()
            alert_data["alert_id"] = str(uuid.uuid4())
            alerts_collection.insert_one(alert_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return {
        "tx_hash": tx.tx_hash,
        "risk_score": risk_score,
        "flagged": flagged
    }

@app.get("/transactions")
async def get_transactions(limit: int = 20, skip: int = 0):
    try:
        transactions = list(transactions_collection.find(
            {}, 
            {"_id": 0}
        ).sort("timestamp", -1).skip(skip).limit(limit))
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/alerts")
async def get_alerts(limit: int = 20, skip: int = 0):
    try:
        alerts = list(alerts_collection.find(
            {}, 
            {"_id": 0}
        ).sort("timestamp", -1).skip(skip).limit(limit))
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/risk-reports")
async def get_risk_reports(limit: int = 10, skip: int = 0):
    try:
        reports = list(risk_reports_collection.find(
            {}, 
            {"_id": 0}
        ).sort("timestamp", -1).skip(skip).limit(limit))
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/risk-reports")
async def create_risk_report(address: str):
    # This would be more sophisticated in production
    # Here we're just creating a sample report
    try:
        # Get transaction count for this address
        tx_count = transactions_collection.count_documents({
            "$or": [
                {"sender": address},
                {"receiver": address}
            ]
        })
        
        # Calculate risk score based on transaction history
        # This is a placeholder for more sophisticated analysis
        risk_score = min(0.1 + (tx_count * 0.05), 1.0)
        
        # Determine risk factors
        risk_factors = []
        if tx_count > 10:
            risk_factors.append("High transaction volume")
        if risk_score > 0.5:
            risk_factors.append("Suspicious transaction patterns")
        
        report = {
            "id": str(uuid.uuid4()),
            "address": address,
            "transaction_count": tx_count,
            "risk_score": risk_score,
            "risk_factors": risk_factors,
            "summary": f"Address {address} has been involved in {tx_count} transactions with a risk score of {risk_score:.2f}.",
            "timestamp": int(datetime.now().timestamp())
        }
        
        risk_reports_collection.insert_one(report)
        return {**report, "_id": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
