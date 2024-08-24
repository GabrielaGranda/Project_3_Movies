import requests
import json
import pandas as pd
from pathlib import Path

# Authentication and setup
url = "https://api.themoviedb.org/3/authentication"

headers = {
    "accept": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NGM2ODUzYmEyYzQxMDI0OWYwNTMxNGZhNWQyMmM1OSIsIm5iZiI6MTcyNDExMjM3MS40MTYzMzEsInN1YiI6IjY2YmVhODU5OGMzZDhlOTkzODk3YjAwYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gILOgAZ4hRAJ3stsNClyNxZ3WoJE9G_VlkqO-fkD6Go"
}

# Fetch initial movie list (based on popularity)
all_results = []
for i in range(1, 100):  # Adjust range as needed
    discovery = f'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page={i}&sort_by=popularity.desc'
    response = requests.get(discovery, headers=headers)
    data = response.json()
    all_results.extend(data['results'])

# Save all discovered movies to data.json
with open('data.json', 'w') as json_file:
    json.dump(all_results, json_file, indent=4)  # indent=4 for pretty printing

# Load data.json to a dataframe
df_file = pd.read_json(Path("data.json"))
df = df_file[["id"]]

# Fetch initial movie list (based on popularity)
all_results = []
for i in range(1, 100):  # Adjust range as needed
    discovery = f'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page={i}&sort_by=popularity.desc'
    response = requests.get(discovery, headers=headers)
    data = response.json()
    all_results.extend(data['results'])

# Save all discovered movies to data.json
with open('data.json', 'w') as json_file:
    json.dump(all_results, json_file, indent=4)  # indent=4 for pretty printing

# Load data.json to a dataframe
df_file = pd.read_json(Path("data.json"))
df = df_file[["id"]]

# Fetch detailed data for each movie
all_results_2 = []
for index, j in enumerate(df['id'], start=1):
    # Print progress message
    print(f"Fetching data for movie {index} of {len(df['id'])}...")

    discovery_2 = f'https://api.themoviedb.org/3/movie/{j}?language=en-US'
    response_2 = requests.get(discovery_2, headers=headers)
    data_2 = response_2.json()
    
    # Filter out movies with null or 0 values for the specified fields
    if (
        data_2.get('imdb_id') and  # Ensure IMDb ID is not null
        data_2.get('belongs_to_collection') is not None and  # Ensure collection is not null
        data_2.get('budget') and data_2.get('budget') > 0 and  # Ensure budget is greater than 0
        data_2.get('revenue') and data_2.get('revenue') > 0 and # Ensure revenue is greater than 0
        data_2.get('vote_average') and data_2.get('vote_average') > 0 and  # Ensure vote average is greater than 0
        data_2.get('vote_count') and data_2.get('vote_count') > 0  # Ensure vote count is greater than 0
    ):
        all_results_2.append(data_2)

# Save the filtered results to data_2.json
if all_results_2:
    with open('data_2.json', 'w') as json_file:
        json.dump(all_results_2, json_file, indent=4)  # indent=4 for pretty printing
    print("All pages saved to data_2.json successfully!")
else:
    print("No valid data found to save.")