import os
import html

import pandas as pd
import streamlit as st

from live_data_service import (
    compare_prices,
    normalize_price_comparison,
)


# ============================================================
# HTML RENDERING
# ============================================================

def render_html(content):
    """
    Render custom HTML safely in Streamlit.
    """
    if hasattr(st, "html"):
        st.html(content)
    else:
        st.markdown(
            content,
            unsafe_allow_html=True
        )


# ============================================================
# CSS
# ============================================================

def load_css(css_path):
    with open(
        css_path,
        "r",
        encoding="utf-8"
    ) as f:
        css = f.read()

    render_html(
        f"<style>{css}</style>"
    )


# ============================================================
# HERO
# ============================================================

def show_hero():
    """
    Clean FindMyFlat hero.
    No external image.
    No sunrise illustration.
    """

    render_html(
        """
        <section class="fmf-hero">

            <nav class="fmf-nav">

                <div class="fmf-brand">

                    <div class="fmf-brand-mark">
                        ⌂
                    </div>

                    <div>
                        <div class="fmf-brand-name">
                            FindMyFlat
                        </div>

                        <div class="fmf-brand-caption">
                            smarter stay search
                        </div>
                    </div>

                </div>

                <div class="fmf-nav-right">
                    Search&nbsp;&nbsp; · &nbsp;&nbsp;Compare&nbsp;&nbsp; · &nbsp;&nbsp;Choose
                </div>

            </nav>


            <div class="fmf-hero-content">

                <div class="fmf-hero-kicker">
                    SMART STAY SEARCH
                </div>

                <h1>
                    Find the right stay.<br>
                    <span>Compare where it's cheapest.</span>
                </h1>

                <p>
                    Search accommodation across multiple platforms,
                    compare prices, and book wherever you prefer.
                </p>

                <div class="fmf-hero-points">

                    <div>
                        <span>01</span>
                        Multiple platforms
                    </div>

                    <div>
                        <span>02</span>
                        One comparison
                    </div>

                    <div>
                        <span>03</span>
                        Your choice
                    </div>

                </div>

            </div>

        </section>
        """
    )


# ============================================================
# HELPERS
# ============================================================

def format_price(value, currency):
    if value is None or pd.isna(value):
        return "Price unavailable"

    symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "INR": "₹",
    }

    symbol = symbols.get(
        currency,
        f"{currency} "
    )

    return f"{symbol}{float(value):,.0f}"


def platform_name(platform):
    names = {
        "airbnb": "Airbnb",
        "booking": "Booking.com",
        "booking.com": "Booking.com",
        "vrbo": "Vrbo",
        "google": "Google Hotels",
        "google_hotels": "Google Hotels",
        "expedia": "Expedia",
    }

    platform = str(platform).lower()

    return names.get(
        platform,
        platform.title()
    )


def safe_text(value, fallback="—"):
    if value is None:
        return fallback

    try:
        if pd.isna(value):
            return fallback
    except Exception:
        pass

    text = str(value).strip()

    return text if text else fallback


def safe_number(value, fallback=0):
    if value is None:
        return fallback

    try:
        if pd.isna(value):
            return fallback
    except Exception:
        pass

    try:
        return float(value)
    except Exception:
        return fallback


def get_location(listing):
    parts = []

    for key in [
        "city",
        "region",
        "country"
    ]:
        value = listing.get(key)

        if value is not None:
            try:
                if pd.isna(value):
                    continue
            except Exception:
                pass

            value = str(value).strip()

            if value:
                parts.append(value)

    if parts:
        return ", ".join(parts)

    return "Location unavailable"


def get_property_image(listing):
    image = listing.get("image")

    if image is None:
        return None

    try:
        if pd.isna(image):
            return None
    except Exception:
        pass

    image = str(image).strip()

    return image if image else None


# ============================================================
# RECOMMENDATION CARD
# ============================================================

def recommendation_card_html(
    listing,
    position
):

    name = safe_text(
        listing.get("name"),
        "Unnamed property"
    )

    location = get_location(
        listing
    )

    property_type = safe_text(
        listing.get("property_type"),
        "Property"
    ).title()

    platform = platform_name(
        listing.get("platform", "")
    )

    currency = safe_text(
        listing.get("currency"),
        ""
    )

    nightly_price = format_price(
        listing.get("nightly_price"),
        currency
    )

    total_price = format_price(
        listing.get("total_price"),
        currency
    )

    rating = listing.get("rating")

    if rating is None or pd.isna(rating):
        rating_text = "New"
    else:
        rating_text = f"{float(rating):.1f}"

    reviews = int(
        safe_number(
            listing.get("review_count"),
            0
        )
    )

    bedrooms = listing.get("bedrooms")

    if bedrooms is None:
        bedrooms_text = "—"
    else:
        try:
            bedrooms_text = str(
                int(bedrooms)
            )
        except Exception:
            bedrooms_text = "—"

    image = get_property_image(
        listing
    )

    safe_name = html.escape(
        name,
        quote=True
    )

    safe_location = html.escape(
        location,
        quote=True
    )

    safe_property_type = html.escape(
        property_type,
        quote=True
    )

    safe_platform = html.escape(
        platform,
        quote=True
    )

    if image:
        image_html = (
            f'<img src="{html.escape(image, quote=True)}" '
            f'alt="{safe_name}">'
        )
    else:
        image_html = """
            <div class="property-image-placeholder">
                <span>⌂</span>
            </div>
        """

    if position == 1:
        badge_html = """
            <div class="best-match-badge">
                ★ Best Match
            </div>
        """
    else:
        badge_html = ""

    return f"""
        <article class="property-card">

            <div class="property-image">
                {image_html}

                {badge_html}

            </div>

            <div class="property-body">

                <div class="property-topline">

                    <span class="property-platform">
                        {safe_platform}
                    </span>

                    <span class="property-rating">
                        ★ {rating_text}
                    </span>

                </div>

                <h3 class="property-name">
                    {safe_name}
                </h3>

                <div class="property-location">
                    {safe_location}
                </div>

                <div class="property-meta">

                    <span>
                        {safe_property_type}
                    </span>

                    <span>
                        {bedrooms_text} bedroom
                        {"s" if bedrooms_text != "1" else ""}
                    </span>

                    <span>
                        {reviews:,} reviews
                    </span>

                </div>

                <div class="property-footer">

                    <div>

                        <div class="property-price">
                            {nightly_price}
                            <span>/ night</span>
                        </div>

                        <div class="property-total">
                            {total_price} total stay
                        </div>

                    </div>

                </div>

            </div>

        </article>
    """


# ============================================================
# TOP RECOMMENDATIONS
# ============================================================

def render_top_recommendations(
    top_3,
    search_filters
):

    if top_3.empty:
        return

    location = safe_text(
        search_filters.get("location"),
        "your destination"
    )

    render_html(
        f"""
        <section class="results-section">

            <div class="section-intro">

                <div>
                    <div class="section-kicker">
                        RECOMMENDED FOR YOU
                    </div>

                    <h2>
                        Top stays in {html.escape(location)}
                    </h2>

                    <p>
                        Selected from the available options
                        based on your preferences.
                    </p>
                </div>

                <div class="result-count">
                    {len(top_3)} picks
                </div>

            </div>

        </section>
        """
    )

    columns = st.columns(
        len(top_3),
        gap="large"
    )

    for index, (_, listing) in enumerate(
        top_3.iterrows()
    ):

        with columns[index]:

            render_html(
                recommendation_card_html(
                    listing,
                    index + 1
                )
            )

            booking_url = listing.get(
                "booking_url"
            )

            platform = platform_name(
                listing.get(
                    "platform",
                    ""
                )
            )

            if (
                booking_url
                and pd.notna(booking_url)
            ):

                st.link_button(
                    f"View on {platform} ↗",
                    booking_url,
                    use_container_width=True
                )

            compare_clicked = st.button(
                "Compare prices",
                key=(
                    f"compare_"
                    f"{listing.get('id', index)}"
                ),
                use_container_width=True
            )

            if compare_clicked:

                st.session_state[
                    "comparison_listing"
                ] = listing.to_dict()


# ============================================================
# PRICE COMPARISON
# ============================================================

def render_price_comparison(
    listing,
    search_filters
):

    property_name = safe_text(
        listing.get("name"),
        "Property"
    )

    property_location = get_location(
        listing
    )

    if property_location == "Location unavailable":
        property_location = search_filters[
            "location"
        ]

    try:

        with st.spinner(
            "Comparing prices across platforms..."
        ):

            response = compare_prices(
                name=property_name,
                location=property_location,
                check_in=search_filters[
                    "check_in"
                ],
                check_out=search_filters[
                    "check_out"
                ],
                adults=search_filters[
                    "adults"
                ],
                children=search_filters[
                    "children"
                ],
                currency=search_filters[
                    "currency"
                ]
            )

            comparison = normalize_price_comparison(
                response
            )

    except Exception as e:

        st.error(
            f"Could not compare prices: {e}"
        )

        return

    offers = comparison.get(
        "offers",
        pd.DataFrame()
    )

    if offers.empty:

        st.info(
            "No additional provider prices "
            "were available for this property."
        )

        return

    render_html(
        """
        <div class="comparison-section">

            <div class="section-kicker">
                PRICE COMPARISON
            </div>

            <h2>
                Where is it cheapest?
            </h2>

            <p class="comparison-description">
                Compare the total stay cost across
                available booking platforms.
            </p>

        </div>
        """
    )

    for _, offer in offers.iterrows():

        platform = platform_name(
            offer.get(
                "platform",
                "Unknown"
            )
        )

        currency = offer.get(
            "currency",
            search_filters["currency"]
        )

        total = format_price(
            offer.get("total_price"),
            currency
        )

        nightly = format_price(
            offer.get("nightly_price"),
            currency
        )

        is_cheapest = bool(
            offer.get(
                "is_cheapest",
                False
            )
        )

        if is_cheapest:
            status = """
                <span class="offer-best">
                    BEST PRICE
                </span>
            """
        else:
            status = ""

        render_html(
            f"""
            <div class="price-offer">

                <div class="offer-platform">
                    <div class="offer-platform-name">
                        {html.escape(platform)}
                    </div>

                    <div class="offer-nightly">
                        {nightly} / night
                    </div>
                </div>

                <div class="offer-price">
                    <strong>
                        {total}
                    </strong>

                    {status}
                </div>

            </div>
            """
        )

        booking_url = offer.get(
            "booking_url"
        )

        if (
            booking_url
            and pd.notna(booking_url)
        ):

            st.link_button(
                f"Book on {platform} ↗",
                booking_url,
                use_container_width=True
            )


# ============================================================
# RESULTS TABLE
# ============================================================

def render_results_table(
    all_results
):

    if all_results.empty:
        return

    render_html(
        f"""
        <section class="all-results-section">

            <div class="section-kicker">
                ALL MATCHES
            </div>

            <h2>
                More stays to explore
            </h2>

            <p>
                {len(all_results):,} properties
                matched your selected requirements.
            </p>

        </section>
        """
    )

    columns_to_show = [
        "name",
        "platform",
        "city",
        "property_type",
        "nightly_price",
        "total_price",
        "currency",
        "rating",
        "review_count",
        "bedrooms",
        "booking_url"
    ]

    available_columns = [
        column
        for column in columns_to_show
        if column in all_results.columns
    ]

    display_df = all_results[
        available_columns
    ].copy()

    if "platform" in display_df.columns:

        display_df["platform"] = (
            display_df["platform"].apply(
                platform_name
            )
        )

    rename_map = {
        "name": "Property",
        "platform": "Platform",
        "city": "City",
        "property_type": "Type",
        "nightly_price": "Night",
        "total_price": "Total",
        "currency": "Currency",
        "rating": "Rating",
        "review_count": "Reviews",
        "bedrooms": "Bedrooms",
        "booking_url": "Booking"
    }

    display_df = display_df.rename(
        columns=rename_map
    )

    if "Rating" in display_df.columns:

        display_df["Rating"] = (
            display_df["Rating"].round(1)
        )

    column_config = {}

    if "Booking" in display_df.columns:

        column_config["Booking"] = (
            st.column_config.LinkColumn(
                "View",
                display_text="Open ↗"
            )
        )

    table_height = min(
        520,
        70 + len(display_df) * 38
    )

    st.dataframe(
        display_df,
        use_container_width=True,
        hide_index=True,
        height=table_height,
        column_config=column_config
    )


# ============================================================
# MAP
# ============================================================

def render_map(
    all_results
):

    required_columns = {
        "latitude",
        "longitude"
    }

    if not required_columns.issubset(
        all_results.columns
    ):
        return

    map_df = all_results[
        [
            "latitude",
            "longitude"
        ]
    ].dropna().copy()

    if map_df.empty:
        return

    render_html(
        """
        <section class="map-section">

            <div class="section-kicker">
                LOCATION
            </div>

            <h2>
                Explore the area
            </h2>

            <p>
                See where the matching stays are located.
            </p>

        </section>
        """
    )

    map_df.columns = [
        "lat",
        "lon"
    ]

    st.map(
        map_df,
        use_container_width=True
    )


# ============================================================
# COMPLETE RESULTS
# ============================================================

def render_results(
    top_3,
    all_results,
    search_filters
):

    if all_results.empty:

        st.warning(
            """
            No properties matched your requirements.

            Try increasing your maximum budget,
            lowering the minimum rating,
            reducing minimum bedrooms,
            or choosing any property type.
            """
        )

        return

    # Result summary
    location = safe_text(
        search_filters.get("location"),
        "your destination"
    )

    check_in = safe_text(
        search_filters.get("check_in"),
        ""
    )

    check_out = safe_text(
        search_filters.get("check_out"),
        ""
    )

    adults = search_filters.get(
        "adults",
        2
    )

    children = search_filters.get(
        "children",
        0
    )

    guests = adults + children

    render_html(
        f"""
        <div class="search-summary">

            <div>

                <div class="search-summary-kicker">
                    SEARCH RESULTS
                </div>

                <h1>
                    Stays in
                    {html.escape(location)}
                </h1>

                <p>
                    {html.escape(check_in)}
                    →
                    {html.escape(check_out)}
                    &nbsp; · &nbsp;
                    {guests} guest
                    {"s" if guests != 1 else ""}
                </p>

            </div>

            <div class="search-summary-count">
                <strong>
                    {len(all_results):,}
                </strong>
                <span>
                    matches
                </span>
            </div>

        </div>
        """
    )

    render_top_recommendations(
        top_3,
        search_filters
    )

    comparison_listing = (
        st.session_state.get(
            "comparison_listing"
        )
    )

    if comparison_listing:

        render_html(
            """
            <div class="comparison-divider"></div>
            """
        )

        render_html(
            f"""
            <section class="comparison-heading">

                <div class="section-kicker">
                    COMPARE THIS PROPERTY
                </div>

                <h2>
                    {html.escape(
                        safe_text(
                            comparison_listing.get(
                                "name"
                            ),
                            "Selected property"
                        )
                    )}
                </h2>

            </section>
            """
        )

        render_price_comparison(
            comparison_listing,
            search_filters
        )

    render_results_table(
        all_results
    )

    render_map(
        all_results
    )

    render_html(
        """
        <footer class="fmf-footer">

            <div class="fmf-footer-brand">
                FindMyFlat
            </div>

            <p>
                Search smarter. Compare better.
                Book where you prefer.
            </p>

        </footer>
        """
    )