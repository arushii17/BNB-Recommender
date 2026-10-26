import json
import os
from datetime import date
from pathlib import Path
from statistics import median
from typing import Literal

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator, model_validator

from live_data_service import (
    compare_prices,
    normalize_price_comparison,
    normalize_stays,
    search_stays,
)
from recommendation_engine import get_live_recommendations


class SearchRequest(BaseModel):
    location: str = Field(min_length=1, max_length=200)
    check_in: date
    check_out: date
    adults: int = Field(default=2, ge=1, le=20)
    children: int = Field(default=0, ge=0, le=10)
    currency: Literal["USD", "EUR", "GBP", "INR"] = "USD"
    min_price: float | None = Field(default=None, ge=0)
    max_price: float | None = Field(default=None, ge=0)
    property_type: str = "any"
    bedrooms: int = Field(default=0, ge=0, le=10)
    min_rating: float = Field(default=0, ge=0, le=5)

    @field_validator("location")
    @classmethod
    def strip_location(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Enter a destination.")
        return value

    @model_validator(mode="after")
    def validate_dates_and_prices(self):
        if self.check_out <= self.check_in:
            raise ValueError("Check-out must be after check-in.")
        if (
            self.max_price is not None
            and self.min_price is not None
            and self.max_price < self.min_price
        ):
            raise ValueError("Maximum price must be greater than minimum price.")
        return self


class PriceComparisonRequest(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    location: str = Field(min_length=1, max_length=300)
    check_in: date
    check_out: date
    adults: int = Field(default=2, ge=1, le=20)
    children: int = Field(default=0, ge=0, le=10)
    currency: Literal["USD", "EUR", "GBP", "INR"] = "USD"

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("Check-out must be after check-in.")
        return self


app = FastAPI(title="FindMyFlat API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _nights(check_in: date, check_out: date) -> int:
    return (check_out - check_in).days


def _number(value, default: float = 0) -> float:
    return default if value is None else float(value)


def _stay_records(frame, location: str, currency: str, nights: int) -> list[dict]:
    rows = json.loads(frame.to_json(orient="records"))
    stays = []

    for index, row in enumerate(rows):
        platform = str(row.get("platform") or "unknown").lower()
        nightly_price = _number(row.get("nightly_price"))
        amenities = row.get("amenities")
        if not isinstance(amenities, list):
            amenities = []

        stay = {
            "id": str(row.get("id") or f"{platform}-{index}"),
            "name": str(row.get("name") or "Unnamed stay"),
            "platform": platform,
            "property_type": str(row.get("property_type") or "other").lower(),
            "city": str(row.get("city") or location),
            "region": str(row.get("region") or ""),
            "country": str(row.get("country") or ""),
            "address": str(row.get("address") or ""),
            "latitude": _number(row.get("latitude")),
            "longitude": _number(row.get("longitude")),
            "rating": _number(row.get("rating")),
            "review_count": int(_number(row.get("review_count"))),
            "max_occupancy": int(_number(row.get("max_occupancy"))),
            "bedrooms": int(_number(row.get("bedrooms"))),
            "bathrooms": int(_number(row.get("bathrooms"))),
            "amenities": [str(amenity) for amenity in amenities],
            "nightly_price": nightly_price,
            "total_price": _number(row.get("total_price"), nightly_price * nights),
            "currency": currency,
            "image": str(row.get("image") or "/images/logo/logo-icon.svg"),
            "booking_url": str(row.get("booking_url") or ""),
        }

        for optional_field in ("match_score", "distance_from_ideal"):
            value = row.get(optional_field)
            if value is not None:
                stay[optional_field] = float(value)

        stays.append(stay)

    return stays


def _raise_service_error(error: RuntimeError) -> None:
    status_code = 503 if "STAYING_API_KEY" in str(error) else 502
    raise HTTPException(status_code=status_code, detail=str(error)) from error


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/search")
def search(request: SearchRequest):
    try:
        response = search_stays(
            location=request.location,
            check_in=request.check_in.isoformat(),
            check_out=request.check_out.isoformat(),
            adults=request.adults,
            children=request.children,
            currency=request.currency,
        )
    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail="The live stay provider could not be reached.",
        ) from error
    except RuntimeError as error:
        _raise_service_error(error)

    listings = normalize_stays(response)
    top_three, all_results = get_live_recommendations(
        df=listings,
        min_price=request.min_price,
        max_price=request.max_price,
        property_type=request.property_type,
        bedrooms=request.bedrooms,
        min_rating=request.min_rating,
    )
    nights = _nights(request.check_in, request.check_out)

    return {
        "top3": _stay_records(top_three, request.location, request.currency, nights),
        "results": _stay_records(all_results, request.location, request.currency, nights),
        "nights": nights,
    }


@app.post("/api/compare")
def price_comparison(request: PriceComparisonRequest):
    try:
        response = compare_prices(
            name=request.name,
            location=request.location,
            check_in=request.check_in.isoformat(),
            check_out=request.check_out.isoformat(),
            adults=request.adults,
            children=request.children,
            currency=request.currency,
        )
    except requests.Timeout as error:
        raise HTTPException(
            status_code=504,
            detail="The price comparison request timed out.",
        ) from error
    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail="The live price provider could not be reached.",
        ) from error
    except TimeoutError as error:
        raise HTTPException(status_code=504, detail=str(error)) from error
    except RuntimeError as error:
        _raise_service_error(error)

    normalized = normalize_price_comparison(response)
    offer_rows = json.loads(normalized["offers"].to_json(orient="records"))
    offers = [
        {
            "platform": str(row.get("platform") or "unknown").lower(),
            "platform_display_name": str(row.get("platform") or "Unknown"),
            "nightly_price": _number(row.get("nightly_price")),
            "total_price": _number(row.get("total_price")),
            "currency": str(row.get("currency") or request.currency),
            "booking_url": str(row.get("booking_url") or ""),
            "is_cheapest": bool(row.get("is_cheapest")),
        }
        for row in offer_rows
    ]
    totals = [offer["total_price"] for offer in offers if offer["total_price"] > 0]
    maximum_price = max(totals) if totals else 0
    for offer in offers:
        offer["savings_vs_max"] = maximum_price - offer["total_price"]

    return {
        "property_id": request.name,
        "property_name": request.name,
        "location": request.location,
        "check_in": request.check_in.isoformat(),
        "check_out": request.check_out.isoformat(),
        "nights": _nights(request.check_in, request.check_out),
        "currency": request.currency,
        "minimum_price": min(totals) if totals else 0,
        "median_price": median(totals) if totals else 0,
        "maximum_price": maximum_price,
        "offers": offers,
    }


dist_directory = Path(__file__).resolve().parent / "dist"
if dist_directory.is_dir():
    app.mount("/", StaticFiles(directory=dist_directory, html=True), name="frontend")
