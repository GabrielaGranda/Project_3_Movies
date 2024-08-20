import requests
import json


url = "https://api.themoviedb.org/3/authentication"

headers = {
    "accept": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NGM2ODUzYmEyYzQxMDI0OWYwNTMxNGZhNWQyMmM1OSIsIm5iZiI6MTcyNDExMjM3MS40MTYzMzEsInN1YiI6IjY2YmVhODU5OGMzZDhlOTkzODk3YjAwYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gILOgAZ4hRAJ3stsNClyNxZ3WoJE9G_VlkqO-fkD6Go"
}

response = requests.get(url, headers=headers)

print(response.text)

#listo to append movies
all_results = []

for i in range (1,100):
    discovery = f'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page={i}&sort_by=popularity.desc'
    # Send the GET request
    response = requests.get(discovery, headers=headers)
    data = response.json()
    all_results.extend(data['results'])


with open('data.json', 'w') as json_file:
    json.dump(all_results, json_file, indent=4)  # indent=4 for pretty printing

print("All pages saved to data.json successfully!")


