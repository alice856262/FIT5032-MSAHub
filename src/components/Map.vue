<template>
  <div class="container mt-3 mb-5">
    <h1>Map</h1>
    <p>Set your start and end points, customise route options, and receive step-by-step directions.</p>
    <p>Blue pins indicate neurology hospitals, clinics, or rehabilitation centers.</p>

    <!-- Map Container with Sidebar Overlay -->
    <div class="map-container" role="region" aria-label="Map displaying locations and routes">
      <div ref="mapContainer" class="map" aria-label="Map" aria-live="polite"></div>

      <!-- Sidebar for Trip Information -->
      <div v-if="tripInfo" class="trip-info-sidebar" role="region" aria-label="Trip Information">
        <button @click="closeTripInfo" class="btn btn-danger btn-sm close-btn" aria-label="Close Trip Information">×</button>
        <h5><strong>Trip Information</strong></h5>
        <p style="line-height: 1.0"><strong>Distance:</strong> {{ tripInfo.distance }} km</p>
        <p style="line-height: 1.0"><strong>Duration:</strong> {{ tripInfo.duration }}</p>
        <h6>Turn-by-Turn Instructions:</h6>
        <ul class="steps" aria-label="Turn-by-Turn Instructions">
          <li v-for="(step, index) in tripInfo.steps" :key="index">
            {{ index + 1 }}. {{ step }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Controls for Search and Route -->
    <div class="row controls">
      <div class="col-md-6 col-sd-6"> 
        <div>
          <h4>Search Location</h4>
          <label for="search-location" class="sr-only">Search Location</label>
          <input 
            id="search-location" 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search places of interest..." 
            @input="fetchSuggestions" 
            class="form-control" 
            aria-autocomplete="list"
            aria-controls="suggestions-list"
            role="combobox" />
          <ul id="suggestions-list" v-if="suggestions.length > 0" class="suggestions-list" role="listbox" aria-label="Search Suggestions">
            <li v-for="(suggestion, index) in suggestions" 
              :key="index" 
              @click="selectSuggestion(suggestion)"
              role="option"
              @keydown.enter="selectSuggestion(suggestion)">
              {{ suggestion.place_name }}
            </li>
          </ul>
          <div class="buttons">
            <button class="btn btn-primary mt-2" @click="searchPlace" aria-label="Search for location">Search</button>
            <button class="btn btn-secondary mt-2" @click="clearSearch" aria-label="Clear search results">Clear</button>
          </div>
        </div>
      </div>  

      <!-- Start and End Point with Custom Options -->
      <div class="col-md-6 col-sd-6">
        <div>
          <h4>Search Route</h4>
          <label for="start-location" class="sr-only">Start Location</label>
          <input 
            id="start-location" 
            type="text" 
            v-model="startPlaceName" 
            placeholder="Start location" 
            @input="fetchSuggestionsFor('start')" 
            class="form-control mb-2" 
            aria-autocomplete="list"
            aria-controls="start-suggestions-list"
            role="combobox" />
          <ul id="start-suggestions-list" v-if="startSuggestions.length > 0" class="suggestions-list" role="listbox" aria-label="Start Location Suggestions">
            <li v-for="(suggestion, index) in startSuggestions" 
              :key="index" 
              @click="setStartPoint(suggestion)"
              role="option"
              @keydown.enter="setStartPoint(suggestion)">
              {{ suggestion.place_name }}
            </li>
          </ul>

          <label for="end-location" class="sr-only">End Location</label>
          <input 
            id="end-location" 
            type="text" 
            v-model="endPlaceName" 
            placeholder="End location" 
            @input="fetchSuggestionsFor('end')" 
            class="form-control mb-2" 
            aria-autocomplete="list"
            aria-controls="end-suggestions-list"
            role="combobox" />
          <ul id="end-suggestions-list" v-if="endSuggestions.length > 0" class="suggestions-list" role="listbox" aria-label="End Location Suggestions">
            <li v-for="(suggestion, index) in endSuggestions" 
              :key="index" 
              @click="setEndPoint(suggestion)"
              role="option"
              @keydown.enter="setEndPoint(suggestion)">
              {{ suggestion.place_name }}
            </li>
          </ul>

          <!-- Custom Route Options -->
          <div class="route-options mt-3">
            <label for="transportation">Transportation Method:</label>
            <select id="transportation" v-model="transportation" class="form-control mb-2" aria-label="Select transportation method">
              <option value="driving">Driving</option>
              <option value="walking">Walking</option>
              <option value="cycling">Cycling</option>
            </select>

            <label for="departureTime">Departure Time:</label>
            <input 
              id="departureTime" 
              type="datetime-local" 
              v-model="departureTime" 
              class="form-control mb-2"
              aria-label="Select departure time" />

            <label>Route Preferences:</label>
            <div class="preferences" role="group" aria-label="Route Preferences">
              <label>
                <input type="checkbox" v-model="avoidOptions.toll" /> Avoid Toll
              </label>
              <label>
                <input type="checkbox" v-model="avoidOptions.motorway" /> Avoid Motorway
              </label>
              <label>
                <input type="checkbox" v-model="avoidOptions.ferry" /> Avoid Ferry
              </label>
              <label>
                <input type="checkbox" v-model="avoidOptions.unpaved" /> Avoid Unpaved
              </label>
            </div>
            <div class="buttons">
              <button @click="getRoute" class="btn btn-primary mt-3" aria-label="Get route">Get Route</button>
              <button @click="clearRoute" class="btn btn-secondary mt-3" aria-label="Clear route">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { token } from '../config/mapboxConfig.js';
import { db } from '../config/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';

export default {
  name: 'Maps',
  data() {
    return {
      map: null,
      searchQuery: '',
      startPoint: '', // Coordinates for start point
      endPoint: '', // Coordinates for end point
      startPlaceName: '',
      endPlaceName: '',
      transportation: 'driving', // Default transportation method
      departureTime: '',
      avoidOptions: { toll: false, motorway: false, ferry: false, unpaved: false },
      suggestions: [],
      startSuggestions: [],
      endSuggestions: [],
      pins: [],
      tripInfo: null, // Trip information for the selected route
      startMarker: null, // Marker for start point
      endMarker: null, // Marker for end point
      hospitalMarkers: [], // Markers for hospital locations
    };
  },
  methods: {
    initializeMap() {
      mapboxgl.accessToken = token;

      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11', // Map style
        center: [144.9631, -37.8136], // Initial map center [longitude, latitude] (Melbourne, Australia)
        zoom: 12, // Initial zoom level
      });

      // Add navigation control to the map (zoom and rotation controls)
      this.map.addControl(new mapboxgl.NavigationControl());

      // Load and display hospital locations
      this.loadHospitalLocations();
    },
    async loadHospitalLocations() {
      try {
        const querySnapshot = await getDocs(collection(db, 'hospitals'));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.location && data.location.longitude && data.location.latitude) {
            // Create a marker for each hospital
            const marker = new mapboxgl.Marker({ color: 'blue' })
              .setLngLat([data.location.longitude, data.location.latitude])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <p>${data.name}</p>
                <p>Phone: ${data.phone}</p>`))
              .addTo(this.map);
            this.hospitalMarkers.push(marker);
          } else {
            console.warn(`Hospital data for ${doc.id} is missing coordinates.`);
          }
        });
      } catch (error) {
        console.error('Error loading hospital locations:', error);
      }
    },
    // Fetch location suggestions from Mapbox based on searchQuery
    async fetchSuggestions() {
      if (this.searchQuery.trim() === '') {
        this.suggestions = [];
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        this.suggestions = data.features || [];
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    },
    // Fetch location suggestions from Mapbox based on searchQuery, but specific to start or end locations
    async fetchSuggestionsFor(field) {
      const query = field === 'start' ? this.startPlaceName : this.endPlaceName;
      if (query.trim() === '') {
        this[`${field}Suggestions`] = [];
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        this[`${field}Suggestions`] = data.features || [];
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    },
    // Add a pin point for a selected location and adjust the map view
    selectSuggestion(suggestion) {
      this.addPin(suggestion);
      this.searchQuery = suggestion.place_name;
      this.suggestions = [];

      // Adjust the map to the selected location
      const { center, bbox } = suggestion;
      if (bbox) {
        // If the location has a bounding box, fit the map to the bounds
        const [minLng, minLat, maxLng, maxLat] = bbox;
        this.map.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          {
            padding: 20,
            maxZoom: 15, // Maximum zoom level when fitting bounds
          }
        );
      } else {
        // If no bounding box, center the map on the location's coordinates
        this.map.flyTo({
          center: center,
          zoom: 14, // Set a suitable zoom level for the selected location
          essential: true,
        });
      }
    },
    searchPlace() {
      if (this.searchQuery.trim() === '') {
        alert('Please enter a location to search.');
        return;
      }
      this.fetchSuggestions();  // fetch suggestions based on the search query
    },
    clearSearch() {
      this.searchQuery = '';
      this.suggestions = [];
      this.pins.forEach(pin => pin.marker.remove());
      this.pins = [];  // clear the pins array
    },
    addPin(suggestion) {
      const { center, place_name } = suggestion;
      const [longitude, latitude] = center;

      // Add a marker to the map
      const marker = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(this.map);

      // Add to the pins array
      this.pins.push({
        marker,
        place_name,
        coordinates: center,
      });
    },
    // Set startPoint to the coordinates of the selected start location
    setStartPoint(suggestion) {
      const { center, place_name } = suggestion;
      this.startPoint = `${center[0]},${center[1]}`;  // Set coordinates
      this.startPlaceName = place_name;
      this.startSuggestions = [];  // Clear suggestions

      // Add start marker to the map
      if (this.startMarker) {
        this.startMarker.remove();  // Remove previous marker
      }
      this.startMarker = new mapboxgl.Marker({ color: 'green' })
        .setLngLat(center)
        .addTo(this.map);
    },
    // Set endPoint to the coordinates of the selected end location
    setEndPoint(suggestion) {
      const { center, place_name } = suggestion;
      this.endPoint = `${center[0]},${center[1]}`;  // Set coordinates
      this.endPlaceName = place_name;
      this.endSuggestions = [];  // Clear suggestions

      // Add end marker to the map
      if (this.endMarker) {
        this.endMarker.remove();  // Remove previous marker
      }
      this.endMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(center)
        .addTo(this.map);
    },
    async getRoute() {
      try {
        if (!this.startPoint || !this.endPoint) {
          alert('Please enter both start and end points.');
          return;
        }

        // Build avoid parameters string
        const avoidParams = Object.keys(this.avoidOptions)
          .filter((key) => this.avoidOptions[key])
          .map((key) => key)
          .join(',');

        // Format departure time correctly
        let formattedDepartureTime = '';
        if (this.departureTime) {
          // Format to: YYYY-MM-DDThh:mm:ssZ
          const date = new Date(this.departureTime);
          formattedDepartureTime = date.toISOString().split('.')[0] + 'Z';
        }

        // Create URL for the Mapbox Directions API
        let url = `https://api.mapbox.com/directions/v5/mapbox/${this.transportation}/${this.startPoint};${this.endPoint}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

        // Add "exclude" and "depart_at" parameters to the URL if avoidParams and formattedDepartureTime were defined
        if (avoidParams) {
          url += `&exclude=${avoidParams}`;
        }
        if (formattedDepartureTime) {
          url += `&depart_at=${formattedDepartureTime}`;
        }

        console.log('API Request URL:', url);

        // Send the request to the Mapbox API
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response Error:', errorText);
          throw new Error('Failed to fetch directions.');
        }

        // Parse response to JSON format
        const data = await response.json();
        if (!data.routes || data.routes.length === 0) {
          throw new Error('No route found.');
        }
        const route = data.routes[0].geometry;

        // Remove any existing route layer
        if (this.map.getLayer('route')) {
          this.map.removeLayer('route');
        }
        if (this.map.getSource('route')) {
          this.map.removeSource('route');
        }

        // Add the new route layer
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,  // set the data to the route geometry from the response
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b9ddd',
            'line-width': 5,
          },
        });

        // Fit the map to the route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.coordinates.forEach((coord) => {
          bounds.extend(coord);
        });
        this.map.fitBounds(bounds, {
          padding: 20,
        });

        // Display trip information (distance and duration)
        this.tripInfo = {
          distance: (data.routes[0].distance / 1000).toFixed(2), // Convert meters to kilometers
          duration: data.routes[0].duration >= 3600 
            ? `${(data.routes[0].duration / 3600).toFixed(2)} hours` // Convert seconds to hours if >= 60 mins
            : `${(data.routes[0].duration / 60).toFixed(2)} minutes`, // Convert seconds to minutes if < 60 mins
          steps: data.routes[0].legs[0].steps.map(
            (step) => `${step.maneuver.instruction} (${(step.distance / 1000).toFixed(2)} km)`
          ),
        };
      } catch (error) {
        console.error('Error getting route:', error);
        alert(error.message);
      }
    },
    clearRoute() {
      // Clear the route layer and reset the trip information
      if (this.map.getLayer('route')) {
        this.map.removeLayer('route');
      }
      if (this.map.getSource('route')) {
        this.map.removeSource('route');
      }
      this.tripInfo = null; // Reset trip information
      this.startMarker?.remove(); // Remove start marker
      this.endMarker?.remove(); // Remove end marker
      this.startPoint = '';
      this.endPoint = '';
      this.startPlaceName = '';
      this.endPlaceName = '';
    },
    closeTripInfo() {
      this.tripInfo = null;
    },
  },
  mounted() {
    this.initializeMap();  // run initializeMap() when the component is mounted, setting up the initial map and loading data
  },
};
</script>

<style scoped>
.container {
  padding: 30px;
  border-radius: 10px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 1.125rem;
  line-height: 1.6;
}

.btn-primary {
  background-color: #e5533d;
  border-color: #e5533d;
}

.btn-primary:hover {
  background-color: #c94431;
  border-color: #c94431;
}

.map-container {
  position: relative;
  height: 500px;
  width: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
}

.map {
  height: 100%;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.trip-info-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  background-color: #f8e2b9;
  padding: 20px;
  border-radius: 10px 0 0 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  height: 100%; /* Full height */
  overflow-y: auto;
}

.trip-info-sidebar .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.controls {
  margin: 0 auto;
  text-align: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.form-control {
  margin-bottom: 10px;
}

.suggestions-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  position: absolute;
  width: 100%;
  max-width: 500px;
  overflow-x: auto;
  z-index: 10;
}
    
.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

.buttons {
  display: flex;
  justify-content: space-between;
}
    
.route-options {
  text-align: left;
}

.preferences {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.trip-info {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.steps {
  list-style: none;
  padding: 0;
}
    
.steps li {
  margin-bottom: 5px;
}

@media (max-width: 400px) {
  .suggestions-list {
    max-width: 90%; /* Use a percentage for small screens */
  }
}
</style>
  