import argparse
import json
import os
import pandas as pd


def load_country_code_map(mapping_file="country_codes.json"):
    """Loads country_codes.json into memory and creates an explicit Country -> Code mapping."""
    if not os.path.isfile(mapping_file):
        print(
            f"Warning: Mapping file '{mapping_file}' not found. Codes will be left blank."
        )
        return {}

    try:
        with open(mapping_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list) and len(data) > 0:
            # Map explicitly using the exact JSON keys from your file
            # strip() removes accidental spaces, lower() ensures case-insensitivity
            code_dict = {
                str(item["Country"]).strip().lower(): str(item["Code"]).strip()
                for item in data
                if "Country" in item and "Code" in item
            }
            print(
                f"Successfully loaded {len(code_dict)} country mappings into memory."
            )
            return code_dict
    except Exception as e:
        print(f"Warning: Could not parse country codes from memory: {e}")

    return {}


def convert_json_to_excel():
    parser = argparse.ArgumentParser(
        description="Convert a JSON file to an Excel (.xlsx) file with custom rankings and mappings."
    )
    parser.add_argument(
        "json_file", help="Path to the input JSON file (e.g., data.json)"
    )

    args = parser.parse_args()
    json_path = args.json_file

    if not os.path.isfile(json_path):
        print(f"Error: The file '{json_path}' does not exist.")
        return

    base_path, _ = os.path.splitext(json_path)
    excel_path = base_path + ".xlsx"

    try:
        # 1. Load primary university data
        with open(json_path, "r", encoding="utf-8") as file:
            json_data = json.load(file)

        records = (
            json_data.get("data", json_data)
            if isinstance(json_data, dict)
            else json_data
        )
        df = pd.json_normalize(records)

        # 2. Extract and rename defined mappings
        field_mapping = {
            "rank_order": "#",
            "rank": "Rank",
            "name": "Institute",
            "location": "Country",
            "scores_overall": "Overall",
            "scores_teaching": "Teaching",
            "scores_research": "Research Environment",
            "scores_citations": "Research Quality",
            "scores_industry_income": "Industry",
            "scores_international_outlook": "International Outlook",
        }

        # Rename existing columns
        df = df.rename(columns=field_mapping)

        # Enforce numeric types for math metrics
        score_cols = [
            "Teaching",
            "Research Environment",
            "Research Quality",
            "Industry",
            "International Outlook",
        ]
        for col in score_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # 3. Calculations & Mapping Lookups
        # A. Calculated Total (Weighted Formula)
        calculated_sum = (
            (df["Teaching"] * 0.295)
            + (df["Research Environment"] * 0.29)
            + (df["Research Quality"] * 0.30)
            + (df["Industry"] * 0.04)
            + (df["International Outlook"] * 0.075)
        )
        df["Calculated Total"] = calculated_sum.round(2)

        # B. Map country string values to keys loaded in memory (using standardized keys)
        country_map = load_country_code_map()
        standardized_countries = (
            df["Country"].astype(str).str.strip().str.lower()
        )
        df["Code"] = standardized_countries.map(country_map).fillna("")

        # C. Local Country / National Rank Separation
        df["National Rank"] = (
            df.groupby("Country")["Calculated Total"]
            .rank(method="min", ascending=False)
            .astype(int)
        )

        # 4. Final Ordered Column Layout Sequence
        final_ordered_columns = [
            "#",
            "Rank",
            "Institute",
            "Code",
            "Country",
            "Overall",
            "Teaching",
            "Research Environment",
            "Research Quality",
            "Industry",
            "International Outlook",
            "Calculated Total",
            "National Rank",
        ]

        # Reindex spreadsheet framework layout sequence
        df = df.reindex(columns=final_ordered_columns)

        # Save output configuration to spreadsheet
        df.to_excel(excel_path, index=False)
        print(f"Success! Converted and structured '{json_path}' -> '{excel_path}'")

    except Exception as e:
        print(f"An error occurred during conversion: {e}")


if __name__ == "__main__":
    convert_json_to_excel()
