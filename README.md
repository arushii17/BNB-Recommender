# BNB-Recommender

## Run the React app

The React app is the primary UI. It uses the existing Python search and
recommendation code through the local API.

1. Create and activate a Python environment:
   `python -m venv .venv`, then `.\.venv\Scripts\Activate.ps1`
2. Install the Python dependencies: `python -m pip install -r requirements.txt`
3. Install the frontend dependencies: `npm install`
4. Start the Python API in one terminal: `npm run api`
5. Start the React UI in another terminal: `npm run dev`
6. Open the Vite URL printed in the terminal (usually <http://localhost:5173>).

Set `STAYING_API_KEY` in `.env` for live searches and rate comparisons. For
production, run `npm run build`, then, with the Python environment activated,
start the API with `python -m uvicorn api:app --host 0.0.0.0 --port 8000`; the
API serves the compiled React app from `dist/`.

The previous Streamlit UI is still available separately with
`streamlit run app.py`.