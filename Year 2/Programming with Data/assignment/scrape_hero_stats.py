import requests
from bs4 import BeautifulSoup
import csv

# Function to scrape data from a specific URL
def scrape_hero_stats(url, output_file):
    # Fetch the page content
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Locate the statistics table
    table = soup.find('table', {'class': 'wikitable'})

    # Extract the rows of the table
    rows = table.find_all('tr')

    # Define the headers and corresponding column indexes
    custom_headers = [
        "Hero", "Total Picks", "Total Wins", "Total Losses", "Win Rate", "Pick Rate", "Total Bans", "Ban Rate", "Total Picks and Bans", "Total Picks and Bans Rate"
    ]
    require_columns = [1, 2, 3, 4, 5, 6, 15, 16, 17, 18]

    # Prepare the data for the CSV
    data = []

    # Process table rows skipping the header
    for row in rows[1:]:
        cells = row.find_all('td')
        if len(cells) < max(require_columns):
            continue

        # Extract data
        filtered_row = [cells[index].text.strip() for index in require_columns]
        data.append(filtered_row)

    # Write to the CSV file
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(custom_headers)
        writer.writerows(data)

# URLs of the stats
swiss_url = 'https://liquipedia.net/mobilelegends/M6_World_Championship/Statistics/Swiss_Stage'
knockout_url = 'https://liquipedia.net/mobilelegends/M6_World_Championship/Statistics/Knockout_Stage'
overall_url = 'https://liquipedia.net/mobilelegends/M6_World_Championship/Statistics'

# Output file names
swiss_output = 'Swiss_Stage_Hero_Stats.csv'
knockout_output = 'Knockout_Stage_Hero_Stats.csv'
overall_output = 'Overall_Hero_Stats.csv'

# Scraping the data 
scrape_hero_stats(swiss_url, swiss_output)
scrape_hero_stats(knockout_url, knockout_output)
scrape_hero_stats(overall_url, overall_output)
