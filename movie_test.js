// movie_test.js

const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
        console.log(this.responseText);
    }
});

xhr.open('GET', 'https://streaming-availability.p.rapidapi.com/shows/%7Btype%7D/%7Bid%7D');
xhr.setRequestHeader('x-rapidapi-key', config.apiKey);  // Access the API key from config.js
xhr.setRequestHeader('x-rapidapi-host', 'streaming-availability.p.rapidapi.com');

xhr.send(data);

