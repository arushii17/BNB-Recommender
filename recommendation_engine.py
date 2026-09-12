import numpy as np
from sklearn.preprocessing import MinMaxScaler


def filter_live_listings(
    df,
    min_price=None,
    max_price=None,
    property_type="any",
    bedrooms=0,
    min_rating=0.0
):
    """
    Hard-filter live listings using the user's requirements.
    Only listings that satisfy all selected constraints remain.
    """

    results = df.copy()

    if min_price is not None:
        results = results[
            results["nightly_price"].notna()
            & (results["nightly_price"] >= min_price)
        ]

    if max_price is not None:
        results = results[
            results["nightly_price"].notna()
            & (results["nightly_price"] <= max_price)
        ]

    if property_type and property_type.lower() != "any":
        results = results[
            results["property_type"]
            .fillna("")
            .str.lower()
            == property_type.lower()
        ]

    if bedrooms is not None and bedrooms > 0:
        results = results[
            results["bedrooms"].fillna(0) >= bedrooms
        ]

    if min_rating is not None:
        results = results[
            results["rating"].notna()
            & (results["rating"] >= min_rating)
        ]

    return results.reset_index(drop=True)


def rank_live_listings(df):
    """
    Rank eligible live listings.

    Ranking considers:
    - Lower nightly price
    - Higher guest rating
    - Higher review count

    No manually selected feature weights are used.
    Listings are ranked by distance from an ideal profile.
    """

    if df.empty:
        return df

    ranked = df.copy()

    # Fill missing review counts safely
    ranked["review_count"] = (
        ranked["review_count"]
        .fillna(0)
    )

    features = [
        "nightly_price",
        "rating",
        "review_count"
    ]

    # Drop any remaining rows with missing ranking values
    ranked = ranked.dropna(
        subset=[
            "nightly_price",
            "rating"
        ]
    ).copy()

    if ranked.empty:
        return ranked

    scaler = MinMaxScaler()

    normalized = scaler.fit_transform(
        ranked[features]
    )

    ranked["price_norm"] = normalized[:, 0]
    ranked["rating_norm"] = normalized[:, 1]
    ranked["reviews_norm"] = normalized[:, 2]

    # Ideal listing:
    # lowest price
    # highest rating
    # highest review count
    ideal_profile = np.array([
        0.0,
        1.0,
        1.0
    ])

    listing_vectors = ranked[
        [
            "price_norm",
            "rating_norm",
            "reviews_norm"
        ]
    ].values

    ranked["distance_from_ideal"] = np.linalg.norm(
        listing_vectors - ideal_profile,
        axis=1
    )

    max_distance = ranked[
        "distance_from_ideal"
    ].max()

    if max_distance == 0:
        ranked["match_score"] = 100.0

    else:
        ranked["match_score"] = (
            1
            - ranked["distance_from_ideal"]
            / max_distance
        ) * 100

    ranked["match_score"] = (
        ranked["match_score"]
        .round(1)
    )

    ranked = ranked.sort_values(
        by=[
            "distance_from_ideal",
            "rating",
            "review_count"
        ],
        ascending=[
            True,
            False,
            False
        ]
    )

    return ranked.reset_index(drop=True)


def get_live_recommendations(
    df,
    min_price=None,
    max_price=None,
    property_type="any",
    bedrooms=0,
    min_rating=0.0
):
    """
    Complete live recommendation flow.

    Step 1:
    Hard-filter listings using user requirements.

    Step 2:
    Rank only eligible listings.

    Step 3:
    Return top 3 and all matching listings.
    """

    filtered = filter_live_listings(
        df=df,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        bedrooms=bedrooms,
        min_rating=min_rating
    )

    ranked = rank_live_listings(
        filtered
    )

    top_3 = ranked.head(3)

    return top_3, ranked