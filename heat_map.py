import pandas as pd
import plotly.express as px

# Load the DataFrame from the CSV file
df = pd.read_csv("prepared_data.csv")

# Filter the DataFrame for a specific genre (e.g., "Action")
genre_to_plot = 'Action'
filtered_df = df[df['Genre'] == genre_to_plot]

# Create a heatmap using Plotly Express
fig = px.choropleth(
    filtered_df,
    locations="Country",
    locationmode="ISO-3",
    color="Popularity",
    hover_name="Country",
    color_continuous_scale=px.colors.sequential.Plasma,
    title=f"Popularity of {genre_to_plot} Movies by Country"
)

# Show the plot
fig.show()

# Save the plot to an HTML file
fig.write_html("heatmap_genre_action.html")
