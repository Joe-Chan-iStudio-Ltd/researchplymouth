#!/bin/bash

# Check if the input file is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <input_file>"
    exit 1
fi

# Get the input file name from the first argument
input_file="$1"

# Remove the file extension to create the output file name
output_file="${input_file%.*}_cleaned.md"

# Initialize the output file
> "$output_file"  # Clear the output file

# Read the file line by line
while IFS=$'\t' read -r part1 part2 part3; do
    # Remove unwanted characters from the second part
    cleaned_part2=$(echo "$part2" | tr -d ':' | tr -d '"' | tr -d "'" | tr -d '?' | tr -d '!' | \
        tr -d '‘' | tr -d '’' | tr -d '“' | tr -d '”' | tr -d '/' | tr -d '\')
    
    # Concatenate the parts
    result="$part1$cleaned_part2$part3"
    
    # Append the result to the output markdown file
    echo "$result" >> "$output_file"
done < "$input_file"

echo "Output written to '$output_file'."
