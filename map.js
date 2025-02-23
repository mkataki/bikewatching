// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
// Set your Mapbox access token here
// import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
// mapboxgl.accessToken = 'pk.eyJ1IjoibWVnaGEta2F0YWtpIiwiYSI6ImNtN2UxODM4ejA4bTUyc3B2Z3B2a2Zza3EifQ.3TEKfXtZd-QSp7sxm9YT4g';
// console.log("Mapbox GL JS Loaded:", mapboxgl);
// // Initialize the map
// const map = new mapboxgl.Map({
//     container: 'map', // ID of the div where the map will render
//     style: 'mapbox://styles/mapbox/streets-v12', // Map style
//     center: [-71.09415, 42.36027], // [longitude, latitude]
//     zoom: 12, // Initial zoom level
//     minZoom: 5, // Minimum allowed zoom
//     maxZoom: 18 // Maximum allowed zoom
//   });

// map.on('load', async () => {

//     // Add the data source for Boston bike lanes
//     map.addSource('boston_route', {
//         type: 'geojson',
//         data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
//     });

//     // Add a layer to visualize the Boston bike lanes
//     map.addLayer({
//         id: 'bike-lanes-boston',
//         type: 'line',
//         source: 'boston_route',
//         paint: {
//         'line-color': 'green',
//         'line-width': 3,
//         'line-opacity': 0.4
//         }
//     });

//     // Add the data source for Cambridge bike lanes
//     map.addSource('cambridge_bike', {
//         type: 'geojson',
//         data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
//     });

//     // Add a layer to visualize the Cambridge bike lanes
//     map.addLayer({
//         id: 'bike-lanes-cambridge',
//         type: 'line',
//         source: 'cambridge_bike',
//         paint: {
//         'line-color': 'blue',
//         'line-width': 3,
//         'line-opacity': 0.4
//         }
//     }); 
//     let jsonData;
//     try {
//     const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    
//     // Await JSON fetch and assign to the outer jsonData variable
//     jsonData = await d3.json(jsonurl);
//     console.log('Loaded JSON Data:', jsonData);

//     // Extract the stations array from the fetched data
//     let stations = jsonData.data.stations;
//     console.log('Stations Array:', stations);
//     } catch (error) {
//     console.error('Error loading JSON:', error);
//     }
// });
