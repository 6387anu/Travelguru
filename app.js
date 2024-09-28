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
        image: "https://www.justahotels.com/wp-content/uploads/2023/07/Manali-Travel-Guide.jpg",
        coordinates: [32.2432, 77.1892]  // Latitude, Longitude of Manali
    },
    goa: {
        title: "Goa Itinerary",
        description: "Relax on the beautiful beaches of Goa. Explore the vibrant nightlife, visit historical forts, and savor delicious seafood. Don't miss the famous beaches like Baga and Anjuna.",
        image: "https://images.unsplash.com/photo-1569034797434-b168fbcf7fcc?q=80&w=2908&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        coordinates: [15.2993, 74.1240]  // Latitude, Longitude of Goa
    },
    jaipur: {
        title: "Jaipur Itinerary",
        description: "Visit the Amber Fort, City Palace, and Hawa Mahal. Experience the rich history and culture of the Pink City. Enjoy shopping in local markets and savor traditional Rajasthani cuisine.",
        image: "https://assets.vogue.in/photos/5ce41ea8b803113d138f5cd2/16:9/w_1920,h_1080,c_limit/Jaipur-Travel-Shopping-Restaurants.jpg",
        coordinates: [26.9124, 75.7873]  // Latitude, Longitude of Jaipur
    },
    leh: {
        title: "Leh Ladakh Itinerary",
        description: "Arrive in Leh, acclimatize, visit Leh Palace and Shanti Stupa.Drive to Nubra Valley via Khardung La, explore Diskit Monastery and Hunder Sand Dunes.Visit Pangong Lake, return to Leh, and depart.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQeCA2YnVG40Sw0p0JLt-eylrn4MmQ0-5gYw&s",
        
    },
    kerala: {
        title: "Kerala Itinerary",
        description: "Kerala, known as “God’s Own Country,” offers a diverse range of attractions. Munnar’s tea plantations and misty hills provide a serene escape, while Alleppey’s backwaters and houseboats showcase the region’s tranquil beauty. Kochi blends colonial charm with modernity, and Thekkady’s Periyar Wildlife Sanctuary offers a chance to connect with nature. Varkala and Kovalam boast pristine beaches, ideal for relaxation, while Wayanad’s lush greenery and Kumarakom’s birdlife make them perfect for nature lovers. Together, these destinations capture the essence of Kerala’s rich landscapes, wildlife, and cultural heritage.",
        image: "https://images.unsplash.com/photo-1647502586545-940ff9ac45c1?q=80&w=2954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        
    },
    ooty: {
        title: "Ooty Itinerary",
        description: "Ooty, often referred to as the “Queen of Hill Stations,” is a charming destination nestled in the Nilgiri Hills. Famous for its sprawling tea gardens, scenic viewpoints like Doddabetta Peak, and the tranquil Ooty Lake, the town offers a refreshing escape into nature. Botanical Gardens and Rose Garden showcase vibrant flora, while a ride on the Nilgiri Mountain Railway provides stunning views of the rolling hills. Nearby attractions like Pykara Lake and waterfalls add to its serene beauty. Ooty’s cool climate, lush greenery, and peaceful ambiance make it a perfect getaway for nature lovers and travelers seeking relaxation.",
        image: "https://images.unsplash.com/photo-1565315527461-d1d090885aed?q=80&w=3123&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    varanasi: {
        title: "Varanasi Itinerary",
        description: "Varanasi, one of the world’s oldest living cities, is a spiritual and cultural heart of India. Situated along the sacred Ganges River, it is known for its ghats where pilgrims perform rituals, with the Ganga Aarti at Dashashwamedh Ghat being a mesmerizing daily spectacle. The ancient Kashi Vishwanath Temple is a major draw for devotees. Varanasi’s narrow lanes are filled with vibrant markets, traditional weavers, and historic temples. The city’s unique atmosphere, steeped in spirituality, history, and rituals, offers an unforgettable experience for those seeking both cultural depth and spiritual reflection.",
        image: "https://images.unsplash.com/photo-1708961370545-5f00499a1808?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    darjeeling: {
        title: "Darjeeling Itinerary",
        description: "Darjeeling, often called the “Queen of the Himalayas,” is a scenic hill station known for its breathtaking views of snow-capped peaks, including Mount Kanchenjunga. Famous for its lush tea gardens, the town offers a serene retreat amidst rolling green hills. The Darjeeling Himalayan Railway, a UNESCO World Heritage Site, offers a nostalgic toy train ride through picturesque landscapes. Popular attractions include Tiger Hill for sunrise views, the Peace Pagoda, and the bustling Mall Road. With its cool climate, colonial charm, and a blend of cultures, Darjeeling is a perfect destination for nature lovers and adventure seekers alike.",
        image: "https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2023/12/23/d78745e603cd28bcb03d90f73c4d5fed_1000x1000.jpg",
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
                    routeWhileDragging: false
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
destinationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const destinationAddress = destinationInput.value;

    if (!userLocation) {
        alert("Please allow location access to find routes.");
        return;
    }

    // Show the spinner while fetching the route
    showSpinner();

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationAddress)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const destinationLatLng = [data[0].lat, data[0].lon];

                if (routingControl) {
                    map.removeControl(routingControl);
                }

                routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation.lat, userLocation.lng),
                        L.latLng(destinationLatLng[0], destinationLatLng[1])
                    ],
                    routeWhileDragging: true
                }).addTo(map);

                // Hide the spinner after the route is loaded
                routingControl.on('routesfound', function(e) {
                    hideSpinner(); // Hide the spinner once the route is displayed
                    const routes = e.routes;
                    const summary = routes[0].summary;
                    
                    routeInstructions.innerHTML = `
                        <h3>Route Summary</h3>
                        <p>Distance: ${(summary.totalDistance / 1000).toFixed(2)} km</p>
                        <p>Estimated Time: ${(summary.totalTime / 60).toFixed(2)} minutes</p>
                    `;

                    const steps = routes[0].instructions;
                    const instructionsList = steps.map(step => `<li>${step.text}</li>`).join('');
                    routeInstructions.innerHTML += `
                        <h3>Step-by-Step Instructions</h3>
                        <ul>${instructionsList}</ul>
                    `;
                });
            } else {
                hideSpinner(); // Hide the spinner if no destination is found
                alert("Could not find the location. Please try again.");
            }
        })
        .catch(error => {
            hideSpinner(); // Hide the spinner in case of error
            console.error('Error fetching destination location:', error);
            alert("An error occurred while trying to find the destination. Please try again.");
        });
});