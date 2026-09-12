import streamlit as st
import pandas as pd
import base64
import html

from live_data_service import (
    compare_prices,
    normalize_price_comparison
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

    st.markdown(
        f"<style>{css}</style>",
        unsafe_allow_html=True
    )


# ============================================================
# HERO
# ============================================================

def get_image_base64(image_path):

    with open(image_path, "rb") as image_file:

        return base64.b64encode(
            image_file.read()
        ).decode()


def show_hero(image_path):

    encoded = get_image_base64(image_path)

    hero_html = (
        f'<div class="hero" '
        f'style="background-image: '
        f'linear-gradient('
        f'90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.25)'
        f'), '
        f'url(\'data:image/jpg;base64,{encoded}\');">'

        f'<div class="hero-title">'
        f'FindMyFlat'
        f'</div>'

        f'<div class="hero-subtitle">'
        f'Find the right stay, compare options across '
        f'platforms, and book wherever you prefer.'
        f'</div>'

        f'</div>'
    )

    st.markdown(
        hero_html,
        unsafe_allow_html=True
    )


# ============================================================
# HELPERS
# ============================================================

def format_price(value, currency):

    if value is None or pd.isna(value):
        return "Price unavailable"

    currency_symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "INR": "₹"
    }

    symbol = currency_symbols.get(
        currency,
        f"{currency} "
    )

    return f"{symbol}{value:,.0f}"


def platform_name(platform):

    names = {
        "airbnb": "Airbnb",
        "booking": "Booking.com",
        "booking.com": "Booking.com",
        "vrbo": "Vrbo",
        "google": "Google Hotels",
        "google_hotels": "Google Hotels",
        "expedia": "Expedia"
    }

    platform = str(platform).lower()

    return names.get(
        platform,
        platform.title()
    )


# ============================================================
# PRICE COMPARISON
# ============================================================

def render_price_comparison(
    listing,
    search_filters
):

    property_name = listing.get("name")

    city = listing.get("city")
    region = listing.get("region")
    country = listing.get("country")

    location_parts = [
        str(value)
        for value in [
            city,
            region,
            country
        ]
        if pd.notna(value) and value
    ]

    property_location = ", ".join(
        location_parts
    )

    if not property_location:

        property_location = (
            search_filters["location"]
        )

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

            comparison = (
                normalize_price_comparison(
                    response
                )
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

    st.markdown("#### 💰 Price comparison")

    if len(offers) == 1:

        st.caption(
            "Only one provider offer was "
            "available for this property."
        )

    else:

        st.caption(
            f"{len(offers)} provider offers found. "
            "Prices are compared using total stay cost."
        )

    for _, offer in offers.iterrows():

        platform = platform_name(
            offer.get(
                "platform",
                "Unknown"
            )
        )

        total = format_price(
            offer.get("total_price"),
            offer.get(
                "currency",
                search_filters["currency"]
            )
        )

        is_cheapest = offer.get(
            "is_cheapest",
            False
        )

        if is_cheapest:

            st.success(
                f"🏆 Best price — "
                f"{platform}: {total}"
            )

        else:

            st.write(
                f"**{platform}** — {total}"
            )

        booking_url = offer.get(
            "booking_url"
        )

        if (
            booking_url
            and pd.notna(booking_url)
        ):

            st.link_button(
                f"View deal on {platform} ↗",
                booking_url,
                use_container_width=True
            )


# ============================================================
# RECOMMENDATION CARD
# ============================================================

def recommendation_card_html(
    listing,
    position
):

    if position == 1:

        badge = "🏆 Best Match"
        badge_class = (
            "rank-badge best-badge"
        )

    elif position == 2:

        badge = "🥈 #2 Recommendation"
        badge_class = "rank-badge"

    else:

        badge = "🥉 #3 Recommendation"
        badge_class = "rank-badge"

    listing_name = listing.get(
        "name"
    )

    if (
        listing_name is None
        or pd.isna(listing_name)
    ):

        listing_name = "Unnamed Listing"

    listing_name = html.escape(
        str(listing_name)
    )

    city = listing.get("city")
    region = listing.get("region")
    country = listing.get("country")

    location_parts = [
        str(value)
        for value in [
            city,
            region,
            country
        ]
        if pd.notna(value) and value
    ]

    location = ", ".join(
        location_parts
    )

    if not location:

        location = "Location unavailable"

    location = html.escape(
        location
    )

    property_type = listing.get(
        "property_type",
        "Property"
    )

    if (
        property_type is None
        or pd.isna(property_type)
    ):

        property_type = "Property"

    property_type = str(
        property_type
    ).title()

    platform = platform_name(
        listing.get(
            "platform",
            ""
        )
    )

    rating = listing.get(
        "rating"
    )

    if (
        rating is None
        or pd.isna(rating)
    ):

        rating_text = "No rating"

    else:

        rating_text = (
            f"{float(rating):.2f} / 5"
        )

    reviews = listing.get(
        "review_count",
        0
    )

    if (
        reviews is None
        or pd.isna(reviews)
    ):

        reviews = 0

    bedrooms = listing.get(
        "bedrooms"
    )

    if (
        bedrooms is None
        or pd.isna(bedrooms)
    ):

        bedrooms_text = (
            "Not specified"
        )

    else:

        bedrooms_text = str(
            int(bedrooms)
        )

    bathrooms = listing.get(
        "bathrooms"
    )

    if (
        bathrooms is None
        or pd.isna(bathrooms)
    ):

        bathrooms_text = (
            "Not specified"
        )

    else:

        bathrooms_text = (
            f"{float(bathrooms):g}"
        )

    currency = listing.get(
        "currency",
        ""
    )

    nightly_price = format_price(
        listing.get(
            "nightly_price"
        ),
        currency
    )

    total_price = format_price(
        listing.get(
            "total_price"
        ),
        currency
    )

    match_score = listing.get(
        "match_score",
        0
    )

    if (
        match_score is None
        or pd.isna(match_score)
    ):

        match_score = 0

    return (
        f'<div class="recommendation-card">'

        f'<div class="{badge_class}">'
        f'{badge}'
        f'</div>'

        f'<div class="listing-title">'
        f'{listing_name}'
        f'</div>'

        f'<div class="listing-location">'
        f'📍 {location}'
        f'</div>'

        f'<div class="listing-price">'
        f'{nightly_price}'
        f'<span> / night</span>'
        f'</div>'

        f'<div class="listing-detail">'
        f'🌐 <b>{platform}</b><br>'
        f'🏠 {property_type}<br>'
        f'⭐ {rating_text} '
        f'({int(reviews):,} reviews)<br>'
        f'🛏️ {bedrooms_text} bedroom(s)<br>'
        f'🚿 {bathrooms_text} bathroom(s)<br>'
        f'💳 Total stay: {total_price}'
        f'</div>'

        f'</div>'
    )


# ============================================================
# TOP RECOMMENDATIONS
# ============================================================

def render_top_recommendations(
    top_3,
    search_filters
):

    if top_3.empty:
        return

    st.header(
        "⭐ Top picks for you"
    )

    st.caption(
        "These stays satisfy your selected "
        "requirements and ranked highest "
        "among the available options."
    )

    columns = st.columns(
        len(top_3),
        gap="large"
    )

    for index, (_, listing) in enumerate(
        top_3.iterrows()
    ):

        with columns[index]:

            st.markdown(
                recommendation_card_html(
                    listing,
                    index + 1
                ),
                unsafe_allow_html=True
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
                "💰 Compare Prices",
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

    comparison_listing = (
        st.session_state.get(
            "comparison_listing"
        )
    )

    if comparison_listing:

        st.divider()

        st.subheader(
            f"💰 Compare prices — "
            f"{comparison_listing.get('name', 'Property')}"
        )

        render_price_comparison(
            comparison_listing,
            search_filters
        )


# ============================================================
# RESULTS TABLE
# ============================================================

def render_results_table(
    all_results
):

    st.write("")
    st.write("")

    st.header(
        "🏘️ All matching properties"
    )

    st.caption(
        f"Browse all {len(all_results):,} stays "
        "that satisfy your requirements."
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
        "match_score",
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
            display_df[
                "platform"
            ].apply(
                platform_name
            )
        )

    rename_map = {
        "name": "Property",
        "platform": "Platform",
        "city": "City",
        "property_type": (
            "Property Type"
        ),
        "nightly_price": (
            "Nightly Price"
        ),
        "total_price": (
            "Total Price"
        ),
        "currency": "Currency",
        "rating": "Rating / 5",
        "review_count": "Reviews",
        "bedrooms": "Bedrooms",
        "match_score": (
            "Match Score"
        ),
        "booking_url": (
            "Booking Link"
        )
    }

    display_df = display_df.rename(
        columns=rename_map
    )

    if "Rating / 5" in display_df.columns:

        display_df[
            "Rating / 5"
        ] = display_df[
            "Rating / 5"
        ].round(2)

    if "Match Score" in display_df.columns:

        display_df[
            "Match Score"
        ] = display_df[
            "Match Score"
        ].round(1)

    column_config = {}

    if (
        "Booking Link"
        in display_df.columns
    ):

        column_config[
            "Booking Link"
        ] = (
            st.column_config.LinkColumn(
                "View Stay",
                display_text="Open ↗"
            )
        )

        row_height = 35
        header_height = 38

        table_height = (
            header_height
            + len(display_df) * row_height
        )

        table_height = min(
            table_height,
            520
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

    st.write("")
    st.write("")

    st.header(
        "🗺️ Explore the area"
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
            😕 No properties matched your requirements.

            Try:
            - Increasing your maximum budget
            - Lowering the minimum guest rating
            - Reducing minimum bedrooms
            - Choosing "Any" property type
            """
        )

        return

    st.success(
    f"✅ {len(all_results):,} properties match your requirements. "
    f"Showing the top {min(3, len(top_3))} recommendations below."
)

    render_top_recommendations(
        top_3,
        search_filters
    )

    render_results_table(
        all_results
    )

    render_map(
        all_results
    )