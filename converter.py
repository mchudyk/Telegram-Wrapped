import csv
import json

csv_file = 'username_chat.csv'
json_file = 'username_chat.json'

csv_data = []
with open(csv_file, newline='', encoding='utf-8') as csvfile:
    csvreader = csv.DictReader(csvfile)
    for row in csvreader:
        csv_data.append(row)

with open(json_file, 'w', encoding='utf-8') as jsonfile:
    json.dump(csv_data, jsonfile, ensure_ascii=False, indent=4)

print(f'CSV data converted to JSON and saved as {json_file}')
