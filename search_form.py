import streamlit as st
from datetime import date, timedelta


def render_search_form():

    st.subheader("🔍 Find your stay")

    st.caption(
        "Search live accommodation options across multiple platforms."
    )

    # ---------------------------
    # Destination
    # ---------------------------

    destination = st.text_input(
        "📍 Destination",
        placeholder="e.g. New York, Paris, Tokyo"
    )

    # ---------------------------
    # Dates
    # ---------------------------

    col1, col2 = st.columns(2)

    today = date.today()

    with col1:
        check_in = st.date_input(
            "📅 Check-in",
            value=today + timedelta(days=7),
            min_value=today
        )

    with col2:
        check_out = st.date_input(
            "📅 Check-out",
            value=today + timedelta(days=10),
            min_value=today + timedelta(days=1)
        )

    # ---------------------------
    # Guests
    # ---------------------------

    st.markdown("#### 👥 Guests")

    col3, col4 = st.columns(2)

    with col3:
        adults = st.number_input(
            "Adults",
            min_value=1,
            max_value=16,
            value=2
        )

    with col4:
        children = st.number_input(
            "Children",
            min_value=0,
            max_value=10,
            value=0
        )

    # ---------------------------
    # Currency
    # ---------------------------

    st.markdown("#### 💱 Currency")

    currency_options = {
        "USD ($)": "USD",
        "EUR (€)": "EUR",
        "GBP (£)": "GBP",
        "INR (₹)": "INR"
    }

    selected_currency = st.selectbox(
        "Choose currency",
        list(currency_options.keys()),
        label_visibility="collapsed"
    )

    currency = currency_options[selected_currency]

    currency_symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "INR": "₹"
    }

    symbol = currency_symbols[currency]

    # ---------------------------
    # Budget
    # ---------------------------

    st.markdown("#### 💰 Budget per night")

    col5, col6 = st.columns(2)

    with col5:
        min_price = st.number_input(
            f"Minimum price ({symbol})",
            min_value=0,
            max_value=50000,
            value=50,
            step=10
        )

    with col6:
        max_price = st.number_input(
            f"Maximum price ({symbol})",
            min_value=1,
            max_value=50000,
            value=350,
            step=10
        )

    # ---------------------------
    # Property preferences
    # ---------------------------

    col7, col8 = st.columns(2)

    with col7:
        property_type = st.selectbox(
            "🏠 Property Type",
            [
                "Any",
                "Apartment",
                "House",
                "Villa",
                "Hotel",
                "Condo",
                "Cabin"
            ]
        )

    with col8:
        bedrooms = st.number_input(
            "🛏️ Minimum Bedrooms",
            min_value=0,
            max_value=20,
            value=1
        )

    # ---------------------------
    # Rating
    # ---------------------------

    min_rating = st.slider(
        "⭐ Minimum Guest Rating",
        min_value=0.0,
        max_value=5.0,
        value=4.0,
        step=0.1
    )

    # ---------------------------
    # Search button
    # ---------------------------

    st.write("")

    search = st.button(
        "🔎 Search Stays",
        type="primary",
        use_container_width=True
    )

    if not search:
        return None

    # ---------------------------
    # Validation
    # ---------------------------

    if not destination.strip():
        st.error("Please enter a destination.")
        return None

    if check_out <= check_in:
        st.error("Check-out must be after check-in.")
        return None

    if min_price > max_price:
        st.error(
            "Minimum price cannot be greater than maximum price."
        )
        return None

    # ---------------------------
    # Return filters
    # ---------------------------

    return {
        "location": destination.strip(),

        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),

        "adults": int(adults),
        "children": int(children),

        "currency": currency,

        "min_price": min_price,
        "max_price": max_price,

        "property_type": property_type.lower(),
        "bedrooms": int(bedrooms),

        "min_rating": min_rating
    }