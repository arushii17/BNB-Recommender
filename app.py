import os
import streamlit as st

from search_form import render_search_form

from live_data_service import (
    search_stays,
    normalize_stays
)

from recommendation_engine import (
    get_live_recommendations
)

from ui_components import (
    load_css,
    show_hero,
    render_results
)


st.set_page_config(
    page_title="FindMyFlat",
    page_icon="🏠",
    layout="wide"
)


def main():

    base_dir = os.path.dirname(
        os.path.abspath(__file__)
    )

    css_path = os.path.join(
        base_dir,
        "assets",
        "style.css"
    )

    image_path = os.path.join(
        base_dir,
        "assets",
        "artem-labunsky-RLqc0V-hssY-unsplash.jpg"
    )

    load_css(css_path)
    show_hero(image_path)

    # --------------------------------------------------------
    # SEARCH FORM
    # --------------------------------------------------------

    filters = render_search_form()

    # --------------------------------------------------------
    # NEW SEARCH
    # --------------------------------------------------------

    if filters is not None:

        # Remove old comparison when the user starts
        # a completely new search.
        st.session_state.pop(
            "comparison_listing",
            None
        )

        try:

            with st.spinner(
                "Searching stays across platforms..."
            ):

                response = search_stays(
                    location=filters["location"],
                    check_in=filters["check_in"],
                    check_out=filters["check_out"],
                    adults=filters["adults"],
                    children=filters["children"],
                    currency=filters["currency"]
                )

                df = normalize_stays(
                    response
                )

        except Exception as e:

            st.error(
                f"Could not fetch stays: {e}"
            )

            return

        # ----------------------------------------------------
        # API RETURNED NO RESULTS
        # ----------------------------------------------------

        if df.empty:

            st.warning(
                "No stays were returned for this search."
            )

            # Clear previous results so old properties
            # are not shown after an unsuccessful search.
            st.session_state.pop(
                "top_3",
                None
            )

            st.session_state.pop(
                "all_results",
                None
            )

            st.session_state.pop(
                "search_filters",
                None
            )

            return

        # ----------------------------------------------------
        # FILTER + RANK
        # ----------------------------------------------------

        top_3, all_results = (
            get_live_recommendations(
                df=df,
                min_price=filters["min_price"],
                max_price=filters["max_price"],
                property_type=filters[
                    "property_type"
                ],
                bedrooms=filters[
                    "bedrooms"
                ],
                min_rating=filters[
                    "min_rating"
                ]
            )
        )

        # ----------------------------------------------------
        # SAVE CURRENT SEARCH
        # ----------------------------------------------------

        st.session_state[
            "search_filters"
        ] = filters

        st.session_state[
            "top_3"
        ] = top_3

        st.session_state[
            "all_results"
        ] = all_results

    # --------------------------------------------------------
    # DISPLAY SAVED RESULTS
    # --------------------------------------------------------

    if (
        "top_3" in st.session_state
        and "all_results" in st.session_state
        and "search_filters" in st.session_state
    ):

        render_results(
            st.session_state[
                "top_3"
            ],
            st.session_state[
                "all_results"
            ],
            st.session_state[
                "search_filters"
            ]
        )


if __name__ == "__main__":
    main()