import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
mapboxgl.accessToken = 'pk.eyJ1IjoibWVnaGEta2F0YWtpIiwiYSI6ImNtN2UxODM4ejA4bTUyc3B2Z3B2a2Zza3EifQ.3TEKfXtZd-QSp7sxm9YT4g';
let timeFilter = -1; 
let trips = []; 
let stations = [];
let circles; 
let radiusScale; 
let stationFlow = d3.scaleQuantize().domain([0, 1]).range([0, 0.5, 1]);




// // Initialize the map
const map = new mapboxgl.Map({
    container: 'map', // ID of the div where the map will render
    style: 'mapbox://styles/mapbox/streets-v12', // Map style
    center: [-71.09415, 42.36027], // [longitude, latitude]
    zoom: 12, // Initial zoom level
    minZoom: 5, // Minimum allowed zoom
    maxZoom: 18 // Maximum allowed zoom
  });

    function computeStationTraffic(stations, trips) {
    // Compute departures
    const departures = d3.rollup(
        trips, 
        (v) => v.length, 
        (d) => d.start_station_id
    );

    // Computed arrivals as you did in step 4.2
    const arrivals = d3.rollup(
      trips,
      v => v.length,
      d => d.end_station_id
    );
  
    // Update each station..
    return stations.map((station) => {
      let id = station.short_name;
      station.arrivals = arrivals.get(id) ?? 0;
      station.departures = departures.get(id) ?? 0;
      station.totalTraffic = station.arrivals + station.departures;
      return station;
  });
}
  
function getCoords(station) {
  const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
  const { x, y } = map.project(point);  // Project to pixel coordinates
  return { cx: x, cy: y };  // Return as object for use in SVG attributes
}
function formatTime(minutes) {
  const date = new Date(0, 0, 0, 0, minutes);  // Set hours & minutes
  return date.toLocaleString('en-US', { timeStyle: 'short' }); // Format as HH:MM AM/PM
}
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
function filterTripsbyTime(trips, timeFilter) {
  return timeFilter === -1 
    ? trips // If no filter is applied (-1), return all trips
    : trips.filter((trip) => {
        // Convert trip start and end times to minutes since midnight
        const startedMinutes = minutesSinceMidnight(trip.started_at);
        const endedMinutes = minutesSinceMidnight(trip.ended_at);
        
        // Include trips that started or ended within 60 minutes of the selected time
        return (
          Math.abs(startedMinutes - timeFilter) <= 60 ||
          Math.abs(endedMinutes - timeFilter) <= 60
        );
    });
}
function minutesSinceMidnight(date) {
  return date.getHours() * 60 + date.getMinutes();
}

  map.on('load', async () => { 
    const timeSlider = document.getElementById('time-slider');
    const selectedTime = document.getElementById('selected-time');
    const anyTimeLabel = document.getElementById('any-time');
    let timeFilter = -1; 
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
        
        // Load trips CSV data
        trips = await d3.csv(
          'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv',
          (trip) => {
            trip.started_at = new Date(trip.started_at);
            trip.ended_at = new Date(trip.ended_at);
            return trip;
          },
        );
        stations = computeStationTraffic(jsonData.data.stations, trips);
    
        radiusScale = d3
          .scaleSqrt()
          .domain([0, d3.max(stations, d => d.totalTraffic)])
          .range([0, 25]);


        circles = svg.selectAll('circle')
        .data(stations, (d) => d.short_name)
        .enter()
        .append('circle')
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
        .style('--departure-ratio', d => stationFlow(d.departures / d.totalTraffic))
        .each(function (d) {
            d3.select(this).append('title')
                .text(d.totalTraffic + " trips (" + d.departures + " departures, " + d.arrivals + " arrivals)");
        });

      updatePositions();
          
        

        
        // Initial update and binding to map events
        updatePositions();
        
        console.log('Enriched Stations:', stations);
        console.log('Loaded Station Data:', jsonData);
      } catch (error) {
        console.error('Error loading or processing data:', error);
      }  
      // Select the slider and display elements
      


      // Event listener to update time display
      function updateTimeDisplay() {
        timeFilter = Number(timeSlider.value); // Get slider value
    
        if (timeFilter === -1) {
            selectedTime.textContent = '';
            anyTimeLabel.style.display = 'block'; 
            selectedTime.textContent = formatTime(timeFilter); 
            anyTimeLabel.style.display = 'none'; 
        }
  
        updateScatterPlot(timeFilter);
    }
    
      timeSlider.addEventListener('input', updateTimeDisplay);
      updateTimeDisplay();
      function updateScatterPlot(timeFilter) {

        if (trips.length === 0 || stations.length === 0) return;
    
        const filteredTrips = filterTripsbyTime(trips, timeFilter);
        const filteredStations = computeStationTraffic(stations, filteredTrips);
   
        radiusScale.range(timeFilter === -1 ? [0, 25] : [3, 50]);
    
    
        circles
            .data(filteredStations, (d) => d.short_name)
            .join('circle')
            .attr('r', (d) => radiusScale(d.totalTraffic))
            .style('--departure-ratio', d => stationFlow(d.departures / d.totalTraffic));
    }
    
  

    



          
  });


  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);

