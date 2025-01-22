import http from "http";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import promptSync from "prompt-sync";
import {initializeFirebaseApp, uploadProcessData} from "./firebase.js";

console.log("Searching Spotify for song...");

const api = SpotifyApi.withClientCredentials(
    "7f8752719aa547999ff86661abc28745",
    "c614c2aa80054606a07b747c52557f80"
);

const prompt = promptSync();
let searchTerm = prompt(`Please enter a song: `);
const items = await api.search(searchTerm, ["track"]);

console.table(items.tracks.items.map((item) => ({
    name: item.name,
    artist: item.artists.map(artist => artist.name),
    id: item.id,
    explicit: item.explicit,
    popularity: item.popularity,
})));
const firstResult = items.tracks.items[0]
console.log(`Result found: 
  Name: ${firstResult.name}
  Artist: ${firstResult.artists.map(artist=> artist.name)}
  Song ID: ${firstResult.id}
  Album Cover: ${firstResult.album.images[0].url}\n`);

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World\n");
});

console.log("Fetching song details...");
const trackItems = await api.tracks.audioFeatures(firstResult.id);
const data = {
  name: firstResult.name,
  albumCover: firstResult.album.images[0].url,
  loudness: trackItems.loudness,
  tempo: trackItems.tempo,
  acousticness: trackItems.acousticness,
  danceability: trackItems.danceability,
  energy: trackItems.energy,
  instrumentalness: trackItems.instrumentalness,
  liveness: trackItems.liveness,
  speechiness: trackItems.speechiness,
  valence: trackItems.valence
};
console.table(data)
// console.log(data);
initializeFirebaseApp();
uploadProcessData(data, firstResult.id);
console.log("Uploading to database...");


const PORT = 3000;
server.listen(PORT, () => {
  // console.log(`Server running at http://localhost:${PORT}/`);
});