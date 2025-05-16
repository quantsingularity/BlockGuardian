import os
from dotenv import load_dotenv
from app import create_app

load_dotenv() # Load environment variables from .env file

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)

