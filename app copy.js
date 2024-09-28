// Custom Cursor
const customCursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
    customCursor.style.zIndex = 1000;  // Ensure the cursor is on top of everything
});

// Global variables for map and routing
let userLocation = null;
let routingControl = null;

// Initialize Map (Leaflet)
const map = L.map('map').setView([20.5937, 78.9629], 5); // Centered over India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Get user's current location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        userLocation = { lat, lng: lon }; // Store user's current location

        const userMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup("You are here!")
            .openPopup();
        map.setView([lat, lon], 13); // Zoom in on user's location

        // Optional: Add a circle around the user's location
        L.circle([lat, lon], {
            color: 'blue',
            radius: 500
        }).addTo(map);
    }, () => {
        alert("Unable to retrieve your location.");
    });
} else {
    alert("Geolocation is not supported by this browser.");
}

// Itineraries Data (with coordinates for routing)
const itineraries = {
    manali: {
        title: "Manali Itinerary",
        description: "Experience the serene beauty of Manali. Explore the Rohtang Pass, Solang Valley, and enjoy adventure sports like paragliding and skiing. Visit the Hadimba Temple and relax in the natural hot springs of Vashisht.",
        image: "https://via.placeholder.com/600x400?text=Manali",
        coordinates: [32.2432, 77.1892]  // Latitude, Longitude of Manali
    },
    goa: {
        title: "Goa Itinerary",
        description: "Relax on the beautiful beaches of Goa. Explore the vibrant nightlife, visit historical forts, and savor delicious seafood. Don't miss the famous beaches like Baga and Anjuna.",
        image: "https://via.placeholder.com/600x400?text=Goa",
        coordinates: [15.2993, 74.1240]  // Latitude, Longitude of Goa
    },
    jaipur: {
        title: "Jaipur Itinerary",
        description: "Visit the Amber Fort, City Palace, and Hawa Mahal. Experience the rich history and culture of the Pink City. Enjoy shopping in local markets and savor traditional Rajasthani cuisine.",
        image: "https://via.placeholder.com/600x400?text=Jaipur",
        coordinates: [26.9124, 75.7873]  // Latitude, Longitude of Jaipur
    },
    // Add other destinations similarly with coordinates
};

// Event listeners for "View Details" buttons
const detailsButtons = document.querySelectorAll('.details-btn');
const detailsContainer = document.getElementById('destination-details');
const detailsTitle = document.getElementById('details-title');
const detailsImage = document.getElementById('details-image');
const detailsDescription = document.getElementById('details-description');
const closeDetailsButton = document.querySelector('.close-details');

detailsButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const destination = e.target.closest('.card').dataset.destination;
        const itinerary = itineraries[destination];
        if (itinerary) {
            detailsTitle.textContent = itinerary.title;
            detailsImage.src = itinerary.image; // Set image source
            detailsDescription.textContent = itinerary.description;
            detailsContainer.classList.add('active'); // Show details container with animation

            // Add route from current location to the destination
            if (userLocation) {
                if (routingControl) {
                    map.removeControl(routingControl); // Remove any existing route
                }

                routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation.lat, userLocation.lng),  // User's current location
                        L.latLng(itinerary.coordinates[0], itinerary.coordinates[1])  // Destination coordinates
                    ],
                    routeWhileDragging: true
                }).addTo(map);
            }
        }
    });
});

// Close details section on 'X' click
closeDetailsButton.addEventListener('click', () => {
    detailsContainer.classList.remove('active'); // Hide details container with animation
});

// Close details if user clicks outside of the details content
window.addEventListener('click', (e) => {
    if (e.target === detailsContainer) {
        detailsContainer.classList.remove('active'); // Hide details container with animation
    }
});

// Handle Destination Input and Route Calculation
const destinationForm = document.getElementById('destination-form');
const destinationInput = document.getElementById('destination-input');
const routeInstructions = document.getElementById('route-instructions');

destinationForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission
    const destinationAddress = destinationInput.value;

    if (!userLocation) {
        alert("Please allow location access to find routes.");
        return;
    }

    // Geocode destination address to get its coordinates
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationAddress)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                const destinationLatLng = [data[0].lat, data[0].lon];
                
                if (routingControl) {
                    map.removeControl(routingControl); // Remove any existing route
                }

                routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation.lat, userLocation.lng),  // User's current location
                        L.latLng(destinationLatLng[0], destinationLatLng[1])  // Destination coordinates from geocoding
                    ],
                    routeWhileDragging: true
                }).addTo(map);

                // Listen for route found and display instructions
                routingControl.on('routesfound', function(e) {
                    const routes = e.routes;
                    const summary = routes[0].summary;

                    // Display summary of route (distance and time)
                    routeInstructions.innerHTML = `
                        <h3>Route Summary</h3>
                        <p>Distance: ${(summary.totalDistance / 1000).toFixed(2)} km</p>
                        <p>Estimated Time: ${(summary.totalTime / 60).toFixed(2)} minutes</p>
                    `;

                    // Detailed instructions for each step
                    const steps = routes[0].instructions;
                    const instructionsList = steps.map(step => `<li>${step.text}</li>`).join('');
                    routeInstructions.innerHTML += `
                        <h3>Step-by-Step Instructions</h3>
                        <ul>${instructionsList}</ul>
                    `;
                });

            } else {
                alert("Could not find the location. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error fetching destination location:', error);
            alert("An error occurred while trying to find the destination. Please try again.");
        });
});