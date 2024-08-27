import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict
import pycountry
import numpy as np

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

# Step 3: Convert ISO-2 to ISO-3 Country Codes
def convert_iso2_to_iso3(code):
    try:
        return pycountry.countries.get(alpha_2=code).alpha_3
    except:
        return None

df['Country_ISO3'] = df['Country'].apply(convert_iso2_to_iso3)
df = df.dropna(subset=['Country_ISO3'])  # Drop rows where the conversion failed

# Step 4: Calculate Genre Diversity for Each Country
def calculate_diversity(genre_popularity):
    total_popularity = sum(genre_popularity.values())
    proportions = [popularity / total_popularity for popularity in genre_popularity.values()]
    entropy = -sum(p * np.log(p) for p in proportions if p > 0)
    return len(genre_popularity), entropy

country_genre_diversity = {}
for country, genres in country_genre_popularity.items():
    num_genres, diversity_score = calculate_diversity(genres)
    country_genre_diversity[country] = {
        "Num_Genres": num_genres,
        "Diversity_Score": diversity_score
    }

# Convert to DataFrame and Merge with Main DataFrame
diversity_df = pd.DataFrame.from_dict(country_genre_diversity, orient='index')
diversity_df.index.name = 'Country'
diversity_df.reset_index(inplace=True)

df = df.merge(diversity_df, on="Country", how="left")

# Step 5: Create the Heatmap with Enhanced Hover Information
genres = df['Genre'].unique()

fig = go.Figure()

for genre in genres:
    genre_df = df[df['Genre'] == genre]
    
    genre_df['hover_text'] = (
        "Country: " + genre_df['Country'] + "<br>" +
        "Popularity: " + genre_df['Popularity'].astype(str) + "<br>" +
        "Number of Genres: " + genre_df['Num_Genres'].astype(str) + "<br>" +
        "Diversity Score: " + genre_df['Diversity_Score'].round(2).astype(str)
    )
    
    fig.add_trace(
        go.Choropleth(
            locations=genre_df['Country_ISO3'],
            z=genre_df['Popularity'],
            locationmode='ISO-3',
            colorscale='Turbo',  # Use vibrant 'Turbo' color scale
            zmin=genre_df['Popularity'].min(),  # Adjust zmin
            zmax=genre_df['Popularity'].max(),  # Adjust zmax
            marker_line_color='darkgray',
            colorbar_title='Popularity',
            hoverinfo='text',  # Use custom hover text
            text=genre_df['hover_text'],
            visible=(genre == 'Action'),  # Show only the initial genre
            marker_opacity=0.75  # Add transparency to the color fill
        )
    )

# Add dropdown menu to switch between genres
fig.update_layout(
    updatemenus=[
        dict(
            buttons=[dict(label=genre, method="update", args=[{"visible": [g == genre for g in genres]}, {"title": f"Popularity of {genre} Movies by Country"}]) for genre in genres],
            direction="down",
            pad={"r": 10, "t": 10},
            showactive=True,
        ),
    ],
    title=f"Popularity of Action Movies by Country",
    title_x=0.5,
    margin={"r":0,"t":50,"l":0,"b":0},
)

# Show the plot
fig.show()

# Save the plot to an HTML file
fig.write_html("heatmap_genres_interactive_with_hover.html")
