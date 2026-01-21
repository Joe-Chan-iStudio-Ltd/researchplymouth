#!/bin/bash

# Check if the correct number of arguments is provided
if [ $# -ne 3 ]; then
    echo "Usage: $0 <input_file> <source_path> <destination_path>"
    exit 1
fi

# Get the arguments
input_file="$1"
source_path="$2"
destination_path="$3"

# Initialize an output file name for validation
output_file="${input_file%.*}_pdf.txt"

# Initialize the output file
> "$output_file"  # Clear or create the output file

# Define color for error messages
RED='\033[0;31m'
NC='\033[0m'  # No Color

# Read the input file line by line
while IFS= read -r pdf_file; do
    # Remove unwanted characters from the file name
    cleaned_pdf_file=$(echo "$pdf_file" | tr -d ':' | tr -d '"' | tr -d "'" | tr -d '?' | tr -d '!' | \
        tr -d '‘' | tr -d '’' | tr -d '“' | tr -d '”' | tr -d '/' | tr -d '\')

    # Check if a period is needed at the end
    if [[ "$cleaned_pdf_file" != *"."* ]]; then
        cleaned_pdf_file="$cleaned_pdf_file."
    fi
    
    # Append the pdf extension
    cleaned_pdf_file="${cleaned_pdf_file}pdf"

    # Check the source file path
    source_file="$source_path/$cleaned_pdf_file"

    # Check to ensure the file exists before attempting to copy
    if [ -f "$source_file" ]; then
        # Perform the copying from source to destination
        cp "$source_file" "$destination_path/"
        echo "Copied: $source_file to $destination_path/"
    else
        echo -e "${RED}File not found:${NC} $source_file"
    fi
    
    # Append the cleaned PDF file name to the output file
    echo "$cleaned_pdf_file" >> "$output_file"

done < "$input_file"

echo "Processing completed. Output written to '$output_file'."
