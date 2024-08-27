import json
import pandas as pd
from collections import defaultdict  # Add this import

# Load the JSON data
with open('data_2.json', 'r') as file:  # Replace with your actual JSON file path
    data = json.load(file)

# Step 1: Data Aggregation
country_genre_popularity = defaultdict(lambda: defaultdict(float))

for movie in data:
    popularity = movie['popularity']
    countries = movie['origin_country']
    genres = movie['genres']
    
    for country in countries:
        for genre in genres:
            genre_name = genre['name']
            country_genre_popularity[country][genre_name] += popularity

country_genre_popularity = {k: dict(v) for k, v in country_genre_popularity.items()}

# Step 2: Convert the Data to a DataFrame
rows = []

for country, genres in country_genre_popularity.items():
    for genre, popularity in genres.items():
        rows.append({"Country": country, "Genre": genre, "Popularity": popularity})

df = pd.DataFrame(rows)

# Let's inspect the DataFrame
print(df.head())

# Save this DataFrame to a CSV for easier inspection if needed
df.to_csv("prepared_data.csv", index=False)
