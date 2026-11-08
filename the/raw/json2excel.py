import argparse
import json
import os
import pandas as pd


def convert_json_to_excel():
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(
        description="Convert a JSON file to an Excel (.xlsx) file dynamically."
    )
    parser.add_argument(
        "json_file", help="Path to the input JSON file (e.g., data.json)"
    )

    args = parser.parse_args()
    json_path = args.json_file

    # Verify that the input file exists
    if not os.path.isfile(json_path):
        print(f"Error: The file '{json_path}' does not exist.")
        return

    # Automatically determine the output path by changing the extension to .xlsx
    base_path, _ = os.path.splitext(json_path)
    excel_path = base_path + ".xlsx"

    try:
        # Load the JSON data
        with open(json_path, "r", encoding="utf-8") as file:
            json_data = json.load(file)

        # Extract rows (handles root list or root dictionary containing a 'data' key)
        records = (
            json_data.get("data", json_data)
            if isinstance(json_data, dict)
            else json_data
        )

        # Flatten nested structures (like 'cta_button') dynamically into columns
        df = pd.json_normalize(records)

        # Save to Excel
        df.to_excel(excel_path, index=False)
        print(f"Success! Converted '{json_path}' -> '{excel_path}'")

    except Exception as e:
        print(f"An error occurred during conversion: {e}")


if __name__ == "__main__":
    convert_json_to_excel()
