# 🏠 FindMyFlat

**Find the right stay. Compare where it's cheapest. Book wherever you prefer.**

FindMyFlat is a multi-platform accommodation search and recommendation application that helps users discover stays based on their travel preferences, rank suitable properties, compare prices across accommodation providers, and redirect to the selected platform for booking.

The project is currently under active development. The core search, filtering, recommendation, and price-comparison pipeline has been implemented, while the final UI and AI-agent layer are still in progress.

---

## 🎯 Problem

Finding accommodation often requires searching across multiple platforms separately and comparing properties based on price, ratings, reviews, and other requirements.

FindMyFlat aims to simplify this process by creating a single search and recommendation layer across accommodation providers.

Instead of acting as a booking engine, the application:

1. Searches accommodation data across supported platforms.
2. Normalizes results into a common format.
3. Applies the user's hard requirements.
4. Ranks eligible properties.
5. Highlights the top recommendations.
6. Allows price comparison across providers.
7. Redirects the user to an external provider to continue booking.

---

## ✨ Current Features

### 🔍 Live Stay Search
Users can search using:

- Destination
- Check-in and check-out dates
- Number of adults and children
- Preferred currency
- Minimum and maximum nightly budget
- Property type
- Minimum bedrooms
- Minimum guest rating

### 🌐 Multi-Platform Data

The application integrates with **StayingAPI** to retrieve normalized accommodation data from supported travel platforms such as:

- Airbnb
- Booking.com
- Vrbo
- Google Hotels

### 🧹 Data Normalization

Provider responses are converted into a common internal structure containing fields such as:

- Property name
- Platform
- Location
- Property type
- Nightly price
- Total stay price
- Currency
- Guest rating
- Review count
- Bedrooms and bathrooms
- Coordinates
- Provider URL

This allows properties originating from different platforms to be processed through the same recommendation pipeline.

### 🎯 Hard Filtering

Properties are first filtered according to user requirements.

A property must satisfy the selected constraints before it can be considered for recommendation.

Current filters include:

- Budget range
- Property type
- Minimum bedrooms
- Minimum rating

This prevents a highly rated but unsuitable or over-budget property from being recommended.

### 🧠 Recommendation Engine

After filtering, eligible properties are ranked using:

- Nightly price
- Guest rating
- Review count

The features are normalized using `MinMaxScaler`.

Each property is compared with an ideal profile:

```text
Lower Price
Higher Rating
Higher Review Count
```

Euclidean distance is used to determine which properties are closest to this ideal profile.

The three highest-ranked properties are presented as the user's **Top 3 Recommendations**.

> The ranking score is relative to the properties available for the current search and should not be interpreted as a probability or model confidence score.

### 💰 Cross-Platform Price Comparison

Users can request a price comparison for a selected property.

The application uses the price-comparison endpoint to retrieve available offers from multiple providers and compares them using the **total stay price**.

Where available, users can then follow the provider link to continue their booking externally.

### 🗺️ Property Map

Listings containing valid latitude and longitude information can also be displayed geographically using Streamlit's map component.

---

## 🏗️ Current Architecture

```text
User Search
    │
    ▼
StayingAPI
    │
    ▼
Live Data Service
    │
    ▼
Normalized Listings
    │
    ▼
Hard Filters
    │
    ▼
Recommendation Engine
    │
    ▼
Top 3 Recommendations
    │
    ├──────────────► All Matching Properties
    │
    └──────────────► Price Comparison
                           │
                           ▼
                    External Provider
```

---

## 📁 Project Structure

```text
FindMyFlat/
│
├── app.py
├── search_form.py
├── live_data_service.py
├── recommendation_engine.py
├── ui_components.py
├── agent.py
├── requirements.txt
├── .env
│
├── assets/
│   ├── style.css
│   └── background-image.jpg
│
└── data/
    └── AB_NYC_2019.csv
```

### Main Components

**`app.py`**  
Main Streamlit application and application-state management.

**`search_form.py`**  
Handles destination, dates, guests, currency, budget, property type, bedroom, and rating inputs.

**`live_data_service.py`**  
Handles communication with StayingAPI, response normalization, asynchronous jobs, and price-comparison requests.

**`recommendation_engine.py`**  
Applies hard filters and ranks eligible properties.

**`ui_components.py`**  
Contains reusable Streamlit components for displaying recommendations, comparison results, tables, maps, and other interface elements.

**`agent.py`**  
Reserved for the upcoming AI-agent layer.

---

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Language | Python |
| Frontend | Streamlit |
| Data Processing | Pandas, NumPy |
| Recommendation | Scikit-learn |
| API Integration | Requests |
| Environment Variables | python-dotenv |
| Accommodation Data | StayingAPI |

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd FindMyFlat
```

### 2. Create a virtual environment

```bash
python -m venv env
```

### 3. Activate the environment

#### Windows PowerShell

```powershell
.\env\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
source env/bin/activate
```

### 4. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 5. Configure the API key

Create a `.env` file in the project root:

```env
STAYING_API_KEY=your_staying_api_key
```

> Never commit your `.env` file or API keys to GitHub.

Make sure `.gitignore` contains:

```gitignore
.env
env/
__pycache__/
```

### 6. Run the application

```bash
python -m streamlit run app.py
```

---

## 🧪 Development & Testing

The project currently uses StayingAPI's sandbox environment during development.

Sandbox responses use deterministic test fixtures. Therefore, sandbox results may **not correspond to the destination, currency, properties, or provider links entered during a search**.

For example, searching for Delhi while using a sandbox key may still return predefined test properties from another location.

These responses are useful for testing:

- API integration
- Response normalization
- Filtering
- Recommendation logic
- Application state
- Error handling
- Price-comparison flow
- UI components

Real destination coverage, currencies, property matching, pricing, and redirects must be validated separately using live API requests.

---

## 🚧 Development Status

### Implemented

- [x] Multi-platform accommodation API integration
- [x] Dynamic destination search
- [x] Dynamic check-in/check-out dates
- [x] Guest selection
- [x] Currency selection
- [x] Budget filtering
- [x] Property-type filtering
- [x] Bedroom filtering
- [x] Minimum-rating filtering
- [x] Provider response normalization
- [x] Recommendation engine
- [x] Top 3 property ranking
- [x] All-results view
- [x] Map visualization
- [x] Provider redirects
- [x] Price-comparison integration
- [x] Streamlit session-state handling

### In Progress

- [ ] Final UI/UX redesign
- [ ] Live API validation
- [ ] Real-world provider-link validation
- [ ] Recommendation testing on live inventory
- [ ] Additional edge-case handling

### Planned

- [ ] AI travel/stay assistant
- [ ] Conversational search refinement
- [ ] Agent-based recommendation workflow
- [ ] Saved searches and personalized recommendations
- [ ] Price monitoring / alerts

---

## 🔄 Project Evolution

FindMyFlat originally began as a recommendation system using the **AB_NYC_2019 Airbnb dataset**.

The initial version explored accommodation recommendation using historical listing attributes such as price, reviews, availability, and location.

The project has since evolved into a **live multi-platform accommodation discovery and price-comparison system**.

The historical dataset is therefore no longer used as the primary inventory source for live searches. The current architecture retrieves accommodation data through APIs and processes it through a provider-independent recommendation pipeline.

---

## ⚠️ Important Notes

FindMyFlat is currently a development/portfolio project.

- It does not process bookings or payments.
- Booking is completed on external provider websites.
- Accommodation availability and pricing depend on upstream data providers.
- Sandbox API responses should not be interpreted as real travel inventory.
- Provider coverage and price-comparison availability may vary by property and location.

---

## 🔐 Security

API credentials are stored using environment variables and are excluded from version control.

Never commit:

```text
.env
API keys
Access tokens
Secrets
```

---

## 👩‍💻 Author

**Arushi Bhat**

B.Tech Computer Science & Engineering — Data Science  
Interested in Data Science, AI/ML, Software Engineering, and intelligent application development.

---

## 📌 Current Status

**Work in Progress 🚧**

The core accommodation search and recommendation pipeline is functional.

The next development phase focuses on completing the UI/UX, validating the application against live accommodation data, and subsequently extending FindMyFlat with an AI-agent layer.
