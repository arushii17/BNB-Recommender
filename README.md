# FindMyFlat — AI-Powered Stay Search & Price Comparison

FindMyFlat is a full-stack accommodation search and recommendation platform that combines **real-time stay data, multi-criteria ranking, and cross-platform price comparison** into one interface.

Instead of searching individual booking platforms separately, users can enter their destination, dates, guests, budget and preferences and receive ranked accommodation recommendations.

## ✨ Key Features

- 🔎 **Real-time stay search** across multiple accommodation platforms
- 🏠 Aggregates listings from **Airbnb, Booking.com, Vrbo and Google Hotels**
- 🎯 **Multi-criteria recommendation engine** based on price, guest rating and review volume
- 💰 **Cross-platform price comparison** to identify the lowest available offer
- 🎛️ Advanced filtering by:
  - Budget
  - Property type
  - Bedrooms
  - Minimum rating
  - Dates
  - Adults and children
  - Currency
- 📊 Converts heterogeneous listing data into a unified structure for comparison
- ⚡ Handles live API responses and asynchronous job-based requests
- 🌐 React-based interactive frontend with a Python backend

## 🧠 Recommendation Algorithm

FindMyFlat does not simply sort properties by rating or price.

Each listing is evaluated using three core features:

- Nightly price
- Guest rating
- Review count

The features are normalized using **Min-Max scaling**.

The system then constructs an ideal profile:

```text
[low price, high rating, high review count]
```

and calculates the **Euclidean distance** between each listing and this ideal profile.

Listings closer to the ideal profile receive higher match scores.

The system then ranks the listings and surfaces the **Top 3 recommendations**.

### Ranking Pipeline

```text
Live Listings
      ↓
Data Normalization
      ↓
User Preference Filtering
      ↓
Feature Scaling
      ↓
Ideal-Profile Distance
      ↓
Match Score
      ↓
Top Recommendations
```

## 💰 Price Comparison

For a selected property, FindMyFlat can compare offers across booking platforms and identify the lowest total price.

The comparison considers the **total booking price**, rather than relying only on nightly rates, helping users account for differences in fees and other pricing components.

## 🏗️ Architecture

```text
React Frontend
      │
      │ POST /api/search
      ▼
Python Backend
      │
      ├── Search & Validation
      │
      ├── StayingAPI
      │
      ├── Data Normalization
      │
      └── Recommendation Engine
              │
              ├── Filtering
              ├── Feature Scaling
              └── Ranking
```

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend & Data
- Python
- REST APIs
- Pandas
- NumPy
- Scikit-learn

### External Data
- StayingAPI
- Airbnb
- Booking.com
- Vrbo
- Google Hotels

## 📁 Project Structure

```text
FindMyFlat/
├── api.py
├── live_data_service.py
├── recommendation_engine.py
├── agent.py
├── requirements.txt
├── .env
├── .gitignore
│
├── src/
│   ├── components/
│   └── ...
│
├── package.json
├── vite.config.*
└── index.html
```

## 🚀 Running Locally

### Backend

Create and activate a Python virtual environment:

```bash
python -m venv env
```

Windows:

```bash
.\env\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Add your StayingAPI key to `.env`:

```env
STAYING_API_KEY=your_key_here
```

Start the Python backend using the project's configured API server command.

### Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## 🔐 Environment Variables

Never commit API keys or other credentials.

Example:

```env
STAYING_API_KEY=your_key_here
```

The `.env` file should remain in `.gitignore`.

## 📌 What Makes FindMyFlat Different?

Traditional accommodation search requires users to manually compare listings across multiple platforms.

FindMyFlat combines:

**Real-time data aggregation + preference filtering + algorithmic recommendation + cross-platform price comparison**

into a single workflow.

The recommendation system is also designed around an explicit **ideal-profile distance metric**, allowing recommendations to balance affordability, quality and social proof rather than optimizing for only one factor.

## 👩‍💻 Author

**Arushi Bhat**

B.Tech CSE (Data Science)  
The NorthCap University

GitHub: [arushii17](https://github.com/arushii17)
