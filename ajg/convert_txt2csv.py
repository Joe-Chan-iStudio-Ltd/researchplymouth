import csv

# Define the input and output file names
input_file = 'data.txt'  # Replace with your actual input file name
output_file = 'data.csv'  # Output CSV file name

# Read the data from the text file
with open(input_file, 'r', encoding='utf-8') as file:
    lines = file.readlines()

# Process the lines to create CSV format
data = []
header = []

# Extract the header
for i in range(18):  # First 18 lines are header
    header.append(lines[i].strip())

# Initialize a temporary list to hold the current row
current_row = []

# Skip the first blank line after the header
start_index = 19  # Start processing data after the header and the blank line

# Extract data rows, handling blank lines
for i in range(start_index, len(lines)):
    line = lines[i].strip()
    
    if line:  # Non-blank line
        current_row.append(line)
    else:  # Blank line detected
        if current_row:  # If we have a current row, save it
            data.append(current_row)
            current_row = []  # Reset for the next row
            
# Add the last row if it exists
if current_row:
    data.append(current_row)

# Write to CSV
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(header)  # Write header
    for row in data:
        # Ensure the row has 18 columns
        while len(row) < 18:
            row.append('-')  # Fill with dashes if there are missing values
        csv_writer.writerow(row)  # Write each row of data

print(f'Converted to CSV and saved as {output_file}')