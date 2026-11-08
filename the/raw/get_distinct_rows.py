import argparse
import pandas as pd


def export_distinct_country_codes(file_path):
    try:
        # Load only columns D and E using 0-indexed positions (3 and 4)
        df = pd.read_excel(file_path, usecols=[3, 4], header=0)

        # Drop rows where either column is empty (optional but recommended for clean JSON)
        df = df.dropna()

        # Remove duplicate rows to get distinct pairs
        distinct_df = df.drop_duplicates()

        # Sort the data by both columns alphabetically
        # Columns will be named after their headers in the Excel file
        sorted_df = distinct_df.sort_values(by=list(distinct_df.columns))

        # Save to country_codes.json orienting as a list of objects/records
        output_filename = "country_codes.json"
        sorted_df.to_json(output_filename, orient="records", indent=4)

        print(
            f"Successfully saved {len(sorted_df)} distinct sorted rows to {output_filename}"
        )

    except Exception as e:
        print(f"Error processing the file: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract unique, sorted rows from columns D and E to JSON."
    )
    parser.add_argument(
        "filename", help="The path to the source Excel file (.xlsx or .xls)"
    )
    args = parser.parse_args()

    export_distinct_country_codes(args.filename)
