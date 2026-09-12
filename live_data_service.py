import os
import time
import requests
import pandas as pd
from dotenv import load_dotenv


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

API_KEY = os.getenv("STAYING_API_KEY")
BASE_URL = "https://api.stayingapi.com/v1"


def _headers():
    if not API_KEY:
        raise RuntimeError(
            "STAYING_API_KEY was not loaded from .env"
        )

    return {
        "Authorization": f"Bearer {API_KEY}"
    }


def search_stays(
    location,
    check_in,
    check_out,
    adults=2,
    children=0,
    currency="USD"
):
    response = requests.get(
        f"{BASE_URL}/search",
        headers=_headers(),
        params={
            "location": location,
            "checkIn": check_in,
            "checkOut": check_out,
            "adults": adults,
            "children": children,
            "currency": currency,
            "platforms": "airbnb,booking,vrbo,google",
            "limit": 20
        },
        timeout=30
    )

    response.raise_for_status()

    return response.json()


def normalize_stays(response_data):

    rows = []

    for stay in response_data.get("data", []):

        price = stay.get("price") or {}
        location = stay.get("location") or {}

        rating = stay.get("guestRating")
        rating_scale = stay.get("ratingScale")

        if rating is not None and rating_scale:
            rating_5 = (rating / rating_scale) * 5
        else:
            rating_5 = None

        rows.append({
            "id": stay.get("id"),
            "platform": stay.get("platform"),
            "platform_listing_id": stay.get(
                "platformListingId"
            ),

            "name": stay.get("name"),
            "property_type": stay.get("propertyType"),

            "city": location.get("city"),
            "region": location.get("region"),
            "country": location.get("country"),
            "address": location.get("address"),

            "latitude": location.get("lat"),
            "longitude": location.get("lng"),

            "rating": rating_5,
            "review_count": stay.get("reviewCount", 0),

            "max_occupancy": stay.get("maxOccupancy"),
            "bedrooms": stay.get("bedrooms"),
            "bathrooms": stay.get("bathrooms"),

            "amenities": stay.get("amenities", []),

            "nightly_price": price.get("nightlyPrice"),
            "total_price": price.get("totalPrice"),
            "currency": price.get("currency"),

            "image": (
                stay.get("images", [None])[0]
                if stay.get("images")
                else None
            ),

            "booking_url": (
                price.get("url")
                or stay.get("url")
            )
        })

    return pd.DataFrame(rows)

def _wait_for_job(
    job_id,
    timeout=180,
    interval=3
):
    """
    Poll a StayingAPI async job until it completes.
    """

    start_time = time.time()

    while time.time() - start_time < timeout:

        response = requests.get(
            f"{BASE_URL}/jobs/{job_id}",
            headers=_headers(),
            timeout=30
        )

        response.raise_for_status()

        payload = response.json()
        data = payload.get("data", {})

        status = data.get("status")

        if status == "completed":

            result = data.get("result")

            if result is None:
                raise RuntimeError(
                    "Price comparison completed "
                    "without a result."
                )

            return result

        if status in {
            "failed",
            "cancelled",
            "expired"
        }:
            raise RuntimeError(
                f"Price comparison job {status}."
            )

        time.sleep(interval)

    raise TimeoutError(
        "Price comparison took too long."
    )

def compare_prices(
    name,
    location,
    check_in,
    check_out,
    adults=2,
    children=0,
    currency="USD"
):
    """
    Compare one property across available providers.

    Uses Google-resolution mode because search results
    do not necessarily contain IDs for the same property
    on several different platforms.
    """

    response = requests.get(
        f"{BASE_URL}/price-compare",
        headers=_headers(),
        params={
            "name": name,
            "location": location,
            "checkIn": check_in,
            "checkOut": check_out,
            "adults": adults,
            "children": children,
            "currency": currency
        },
        timeout=30
    )

    # Live uncached requests may be asynchronous.
    if response.status_code == 202:

        payload = response.json()

        job_id = (
            payload
            .get("data", {})
            .get("jobId")
        )

        if not job_id:
            raise RuntimeError(
                "Price comparison started but "
                "no job ID was returned."
            )

        return _wait_for_job(job_id)

    response.raise_for_status()

    return response.json()


def normalize_price_comparison(response_data):
    """
    Convert the price comparison response into
    a simple DataFrame.
    """

    # Depending on whether the response came directly
    # or through an async job, we may receive either
    # the full envelope or the comparison data itself.
    data = response_data.get(
        "data",
        response_data
    )

    offers = data.get("offers", [])

    rows = []

    for offer in offers:

        total_price = offer.get("totalPrice")

        rows.append({
            "platform": (
                offer.get("ota")
                or offer.get("platform")
                or "Unknown"
            ),

            "nightly_price": offer.get(
                "nightlyPrice"
            ),

            "total_price": total_price,

            "currency": offer.get(
                "currency",
                data.get("currency")
            ),

            "booking_url": offer.get("url"),

            "is_cheapest": False
        })

    comparison_df = pd.DataFrame(rows)

    if comparison_df.empty:

        return {
            "property": data.get("property"),
            "minimum_price": data.get("min"),
            "median_price": data.get("median"),
            "offers": comparison_df
        }

    comparison_df = comparison_df.sort_values(
        by="total_price",
        ascending=True,
        na_position="last"
    ).reset_index(drop=True)

    valid_prices = comparison_df[
        "total_price"
    ].dropna()

    if not valid_prices.empty:

        cheapest_index = (
            comparison_df["total_price"].idxmin()
        )

        comparison_df.loc[
            cheapest_index,
            "is_cheapest"
        ] = True

    return {
        "property": data.get("property"),
        "minimum_price": data.get("min"),
        "median_price": data.get("median"),
        "currency": data.get("currency"),
        "offers": comparison_df
    }