import pandas as pd
import json
from pathlib import Path
import plotly.graph_objects as go

# Load the data
data_path = Path("data_2.json")
with open(data_path) as f:
    movies_data = json.load(f)

# Normalize and preprocess the data
df = pd.json_normalize(movies_data, errors='ignore')
df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')
df['release_year'] = df['release_date'].dt.year

# Normalize and explode the genres field
df_genres = df.explode('genres')
df_genres = pd.concat([df_genres.drop(['genres'], axis=1), df_genres['genres'].apply(pd.Series)], axis=1)
df_genres = df_genres.rename(columns={'name': 'genre_name'})

# Keep all genres for each movie
df_genres = df_genres[['release_year', 'genre_name', 'original_title', 'popularity', 'revenue', 'origin_country']]

# Create a Plotly figure
fig = go.Figure()

# Define colors for each genre
colors = {
    genre: f'rgba({i*30 % 255}, {i*60 % 255}, {i*90 % 255}, 0.7)' 
    for i, genre in enumerate(df_genres['genre_name'].unique())
}

# Initialize traces for each genre
for genre in df_genres['genre_name'].unique():
    df_genre = df_genres[df_genres['genre_name'] == genre]
    trace = go.Scatter(
        x=df_genre['release_year'],
        y=df_genre['popularity'],
        mode='markers',
        text=df_genre.apply(
            lambda row: f"Title: {row['original_title']}<br>Revenue: ${row['revenue']:,}<br>Country: {row['origin_country']}",
            axis=1
        ),  # Detailed hover info
        name=genre,
        hoverinfo='text',
        marker=dict(size=8, color=colors[genre]),
        visible=False  # Start with all traces hidden
    )
    fig.add_trace(trace)

# Add dropdown menu for genres
fig.update_layout(
    title={
        'text': 'Movie Popularity by Genre and Year',
        'font': {'color': 'purple', 'size': 30}
    },
    xaxis_title='Year',
    yaxis_title='Popularity',
    updatemenus=[
        {
            'buttons': [
                {
                    'args': [{'visible': [genre == genre_button or genre_button == 'All' for genre in df_genres['genre_name'].unique()]}],
                    'label': genre_button,
                    'method': 'update'
                } for genre_button in ['All'] + list(df_genres['genre_name'].unique())
            ],
            'direction': 'down',
            'showactive': True,
            'x': 0.85,
            'xanchor': 'right',
            'y': 1.10,
            'yanchor': 'top'
        }
    ],
    showlegend=True  # Show the legend
)

# Save the figure as an HTML file
fig.write_html('genre_popularity.html')