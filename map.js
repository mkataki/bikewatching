import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
console.log("Mapbox GL JS Loaded:", mapboxgl);
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
mapboxgl.accessToken = 'pk.eyJ1IjoibWVnaGEta2F0YWtpIiwiYSI6ImNtN2UxODM4ejA4bTUyc3B2Z3B2a2Zza3EifQ.3TEKfXtZd-QSp7sxm9YT4g';

// // Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-71.09415, 42.36027], // [longitude, latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18 // Maximum allowed zoom
  });

  map.on('load', async () => { 
    // Boston bike lanes
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
    });
    map.addLayer({
      id: 'bike-lanes-boston',
      type: 'line',
      source: 'boston_route',
      paint: {
        'line-color': '#FF1493',
        'line-width': 3,
        'line-opacity': 0.5
      }
    });
  
    // Cambridge bike lanes
    map.addSource('cambridge_bike', {
      type: 'geojson',
      data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
    });
    map.addLayer({
      id: 'bike-lanes-cambridge',
      type: 'line',
      source: 'cambridge_bike',
      paint: {
        'line-color': '#FF1493',
        'line-width': 3,
        'line-opacity': 0.5
      }
    });
    let jsonData;
    const svg = d3.select('#map').select('svg');
    try {
        // Load stations JSON
        const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
        const jsonData = await d3.json(jsonurl);
        let stations = jsonData.data.stations;
        
        // Load trips CSV data
        const trips = await d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv');
        
        // Aggregate traffic data:
        // Count arrivals using the end_station_id
        const arrivals = d3.rollup(
          trips,
          v => v.length,
          d => d.end_station_id
        );
        // Count departures using the start_station_id
        const departures = d3.rollup(
          trips,
          v => v.length,
          d => d.start_station_id
        );
        
        // Enrich each station with traffic data
        stations = stations.map(station => {
          // Adjust this identifier based on your station JSON (e.g., station.short_name or station.Number)
          let id = station.short_name;
          station.arrivals = arrivals.get(id) ?? 0;
          station.departures = departures.get(id) ?? 0;
          station.totalTraffic = station.arrivals + station.departures;
          return station;
        });
        
        // Define a square-root scale for circle radii based on total traffic
        const radiusScale = d3
          .scaleSqrt()
          .domain([0, d3.max(stations, d => d.totalTraffic)])
          .range([0, 25]);
        
        // Append circles for each station
        const circles = svg.selectAll('circle')
          .data(stations)
          .enter()
          .append('circle')
          .attr('fill', 'steelblue')
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .attr('opacity', 0.8)
          .each(function(d) {
            // Add <title> for browser tooltips
            d3.select(this)
              .append('title')
              .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
          });
        
        // Function to update circle positions and sizes
        function updatePositions() {
          circles
            .attr('cx', d => {
              // Adjust property names if your station data uses different keys (e.g., "Long" and "Lat")
              const point = map.project([+d.lon, +d.lat]);
              return point.x;
            })
            .attr('cy', d => {
              const point = map.project([+d.lon, +d.lat]);
              return point.y;
            })
            .attr('r', d => radiusScale(d.totalTraffic));
        }
        
        // Initial update and binding to map events
        updatePositions();
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
        map.on('moveend', updatePositions);
        
        console.log('Enriched Stations:', stations);
        console.log('Loaded Station Data:', jsonData);
      } catch (error) {
        console.error('Error loading or processing data:', error);
      }      
  });
  function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
    const { x, y } = map.project(point);  // Project to pixel coordinates
    return { cx: x, cy: y };  // Return as object for use in SVG attributes
  }

