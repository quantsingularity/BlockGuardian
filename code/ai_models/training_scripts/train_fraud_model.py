import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

def train_model():
    # Load and preprocess data
    df = pd.read_csv('../../resources/datasets/transaction_history.csv')
    X = df[['value', 'gas_price', 'frequency']]
    
    # Feature scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train Isolation Forest model
    model = IsolationForest(n_estimators=100, contamination=0.01)
    model.fit(X_scaled)
    
    # Save model and scaler
    joblib.dump(model, '../../fraud_detection_model.pkl')
    joblib.dump(scaler, '../../scaler.pkl')

if __name__ == '__main__':
    train_model()