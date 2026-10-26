from datetime import date, timedelta

import streamlit as st


def render_search_form():

    render_search_intro()

    st.markdown(
        '<div class="search-card">',
        unsafe_allow_html=True
    )

    # ========================================================
    # MAIN SEARCH
    # ========================================================

    st.markdown(
        """
        <div class="search-card-heading">
            <div class="search-card-kicker">
                PLAN YOUR STAY
            </div>

            <h2>
                Where are you going?
            </h2>

            <p>
                Tell us what you're looking for and we'll
                find the strongest options available.
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )

    destination = st.text_input(
        "Destination",
        placeholder="e.g. New Delhi, Paris, Tokyo",
        label_visibility="visible"
    )

    col1, col2 = st.columns(
        2,
        gap="medium"
    )

    with col1:

        check_in = st.date_input(
            "Check-in",
            value=date.today() + timedelta(days=7),
            min_value=date.today()
        )

    with col2:

        check_out = st.date_input(
            "Check-out",
            value=date.today() + timedelta(days=10),
            min_value=date.today() + timedelta(days=1)
        )

    col3, col4, col5 = st.columns(
        3,
        gap="medium"
    )

    with col3:

        adults = st.number_input(
            "Adults",
            min_value=1,
            max_value=20,
            value=2,
            step=1
        )

    with col4:

        children = st.number_input(
            "Children",
            min_value=0,
            max_value=10,
            value=0,
            step=1
        )

    with col5:

        currency_options = {
            "INR (₹)": "INR",
            "USD ($)": "USD",
            "EUR (€)": "EUR",
            "GBP (£)": "GBP"
        }

        selected_currency = st.selectbox(
            "Currency",
            list(currency_options.keys())
        )

        currency = currency_options[
            selected_currency
        ]

    # ========================================================
    # FILTERS
    # ========================================================

    st.markdown(
        """
        <div class="filter-heading">
            Refine your search
        </div>
        """,
        unsafe_allow_html=True
    )

    col1, col2, col3, col4 = st.columns(
        4,
        gap="medium"
    )

    with col1:

        min_price = st.number_input(
            "Minimum / night",
            min_value=0,
            value=0,
            step=500
        )

    with col2:

        max_price = st.number_input(
            "Maximum / night",
            min_value=0,
            value=10000,
            step=500
        )

    with col3:

        property_type = st.selectbox(
            "Property type",
            [
                "Any",
                "Apartment",
                "House",
                "Villa",
                "Hotel",
                "Private room"
            ]
        )

    with col4:

        bedrooms = st.number_input(
            "Minimum bedrooms",
            min_value=0,
            max_value=10,
            value=0,
            step=1
        )

    min_rating = st.slider(
        "Minimum guest rating",
        min_value=0.0,
        max_value=5.0,
        value=0.0,
        step=0.1
    )

    st.markdown(
        '<div class="search-action">',
        unsafe_allow_html=True
    )

    search_clicked = st.button(
        "Search stays  →",
        use_container_width=True
    )

    st.markdown(
        '</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '</div>',
        unsafe_allow_html=True
    )

    if not search_clicked:
        return None

    if not destination.strip():

        st.error(
            "Please enter a destination."
        )

        return None

    if check_out <= check_in:

        st.error(
            "Check-out must be after check-in."
        )

        return None

    if (
        max_price > 0
        and min_price > max_price
    ):

        st.error(
            "Maximum price must be greater than minimum price."
        )

        return None

    return {
        "location": destination.strip(),
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
        "adults": int(adults),
        "children": int(children),
        "currency": currency,
        "min_price": (
            int(min_price)
            if min_price > 0
            else None
        ),
        "max_price": (
            int(max_price)
            if max_price > 0
            else None
        ),
        "property_type": property_type.lower(),
        "bedrooms": int(bedrooms),
        "min_rating": float(min_rating)
    }


def render_search_intro():

    st.markdown(
        """
        <section class="search-intro">

            <div class="search-intro-kicker">
                SEARCH · COMPARE · CHOOSE
            </div>

            <h2>
                Find a stay that actually fits.
            </h2>

            <p>
                Search live accommodation options,
                compare providers, and decide where
                you want to book.
            </p>

        </section>
        """,
        unsafe_allow_html=True
    )