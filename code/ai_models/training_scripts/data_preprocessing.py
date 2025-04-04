import pandas as pd

def preprocess_data(file_path):
    df = pd.read_csv(file_path)
    
    # Feature engineering
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['value_eth'] = df['value'] / 1e18
    
    # Calculate transaction frequency
    freq = df.groupby('from_address').size().reset_index(name='frequency')
    df = df.merge(freq, on='from_address')
    
    return df[['from_address', 'value_eth', 'gas_price', 'hour', 'frequency']]