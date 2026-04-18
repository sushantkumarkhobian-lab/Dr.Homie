export class ClinicMap {
    constructor() {
        this.map = null;
        this.userMarker = null;
        this.clinicMarkers = [];
        this.mockClinics = []; // Will be generated based on location
    }

    init() {
        // Initialize Basemaps
        setTimeout(() => this.initMap(), 100);
        this.setupGeolocation();
        // Initial render with placeholder data if needed, or wait for location
        this.renderList();
    }

    initMap() {
        const mapContainer = document.getElementById('basemap-view');
        if (!mapContainer) return;

        // Default view (zoom out initially)
        // @ts-ignore
        this.map = L.map('basemap-view').setView([20.5937, 78.9629], 5); // India center default

        // Add Dark Mode or Standard OpenStreetMap tiles
        // Using CartoDB Dark Matter for "tech/medical" feel or standard OSM
        // Standard OSM: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
        // CartoDB Dark: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png

        // @ts-ignore
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        // Fix for map not sizing correctly if hidden initially
        // @ts-ignore
        setTimeout(() => this.map.invalidateSize(), 500);
    }

    setupGeolocation() {
        const btn = document.getElementById('locate-btn');
        if (btn) {
            btn.onclick = () => {
                btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Locating...`;
                if (window.lucide) window.lucide.createIcons();

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => this.handleSuccess(position),
                        (error) => this.handleError(btn)
                    );
                } else {
                    alert("Geolocation is not supported by this browser.");
                }
            };
        }
    }

    async fetchRealClinics(lat, lng) {
        // Use Overpass API to get real hospitals and clinics within 5km
        const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:5000,${lat},${lng});
              node["amenity"="clinic"](around:5000,${lat},${lng});
              way["amenity"="hospital"](around:5000,${lat},${lng});
              way["amenity"="clinic"](around:5000,${lat},${lng});
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            if (!response.ok) throw new Error("Overpass API Failed");

            const data = await response.json();
            this.processOverpassData(data, lat, lng);
        } catch (e) {
            console.error("Failed to fetch real clinics:", e);
            alert("Could not fetch real data. Showing demo data instead.");
            // Fallback to random if API fails
            this.generateNearbyClinics(lat, lng);
        }
    }

    processOverpassData(data, userLat, userLng) {
        const elements = data.elements.filter(e => e.tags && (e.tags.name || e.tags['name:en']));

        // Take top 10 closest
        this.mockClinics = elements.map(e => {
            const hasLat = e.lat !== undefined;
            // For ways (buildings), we'd need center calc, but for simplicity filter to nodes or use approximate
            // If it's a way, we skip or need complex logic. Let's try to stick to nodes preferably or use first node ref if available in simple mode.
            // Actually, Overpass "center" out meta-data is better. Let's stick to simple nodes for this prototype or robustly handle it?
            // To keep it simple and working: we only map nodes that have lat/lon directly.
            if (!hasLat) return null;

            const dist = this.calculateDistance(userLat, userLng, e.lat, e.lon);
            return {
                name: e.tags.name || e.tags['name:en'] || "Unknown Clinic",
                type: e.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic',
                rating: (3.5 + Math.random() * 1.5).toFixed(1), // Random rating as OSM doesn't have it
                distance: `${dist.toFixed(1)} km`,
                time: `${Math.ceil(dist * 5)} min`, // Rough estimate 5 min per km driving
                lat: e.lat,
                lng: e.lon,
                rawDist: dist
            };
        }).filter(e => e !== null).sort((a, b) => a.rawDist - b.rawDist).slice(0, 10);

        if (this.mockClinics.length === 0) {
            alert("No clinics found nearby in OpenStreetMap. Generating demo data.");
            this.generateNearbyClinics(userLat, userLng);
            return;
        }

        this.updateMapMarkers();
        this.renderList(true);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    generateNearbyClinics(lat, lng) {
        // Fallback: Generate random clinics around the user's location
        const types = ['Emergency', 'General', 'Dental', 'Specialist', 'Pharmacy'];
        const names = ['City Care (Demo)', 'Sunrise Health (Demo)', 'Green Cross (Demo)', 'HealthHub (Demo)'];

        this.mockClinics = Array.from({ length: 5 }, (_, i) => {
            const latOffset = (Math.random() - 0.5) * 0.04;
            const lngOffset = (Math.random() - 0.5) * 0.04;
            return {
                name: `${names[i % names.length]}`,
                type: types[i % types.length],
                rating: (4.0 + Math.random()).toFixed(1),
                distance: `${(Math.abs(latOffset + lngOffset) * 111).toFixed(1)} km`,
                time: `${Math.floor(Math.random() * 20 + 5)} min`,
                lat: lat + latOffset,
                lng: lng + lngOffset
            };
        });
        this.updateMapMarkers();
        this.renderList();
    }

    updateMapMarkers() {
        if (!this.map) return;

        // Clear old markers
        this.clinicMarkers.forEach(m => this.map.removeLayer(m));
        this.clinicMarkers = [];

        // Add new markers
        this.mockClinics.forEach(clinic => {
            // @ts-ignore
            const marker = L.marker([clinic.lat, clinic.lng]).addTo(this.map);
            marker.bindPopup(`<b>${clinic.name}</b><br>${clinic.type}<br>⭐ ${clinic.rating}<br>${clinic.distance}`);
            this.clinicMarkers.push(marker);
        });
    }

    handleSuccess(position) {
        const { latitude, longitude } = position.coords;
        const btn = document.getElementById('locate-btn');

        if (this.map) {
            // @ts-ignore
            this.map.setView([latitude, longitude], 14);

            // User Marker
            if (this.userMarker) {
                this.userMarker.setLatLng([latitude, longitude]);
            } else {
                // @ts-ignore
                this.userMarker = L.marker([latitude, longitude], {
                    // @ts-ignore
                    icon: L.divIcon({
                        className: 'user-marker-icon',
                        html: '<div style="background-color: #00f2ea; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 10px #00f2ea;"></div>',
                        iconSize: [12, 12]
                    })
                }).addTo(this.map);
            }
            // @ts-ignore
            L.popup().setLatLng([latitude, longitude]).setContent("You are here").openOn(this.map);

            // Fetch Real Data
            this.fetchRealClinics(latitude, longitude);
        }

        if (btn) {
            btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Location Found`;
            btn.classList.replace('bg-blue-500', 'bg-green-500');
        }
        if (window.lucide) window.lucide.createIcons();
    }

    handleError(btn) {
        alert("Location access denied or failed. Using default view.");
        if (btn) {
            btn.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4"></i> Use My Location`;
        }
        if (window.lucide) window.lucide.createIcons();
    }

    renderList() {
        const listContainer = document.getElementById('clinic-list');
        if (!listContainer) return;

        if (this.mockClinics.length === 0) {
            listContainer.innerHTML = `<div class="text-center text-gray-500 py-4">Click "Use My Location" to find nearby clinics.</div>`;
            return;
        }

        listContainer.innerHTML = this.mockClinics.map(clinic => `
            <div class="glass-panel p-4 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group"
                 onclick="document.dispatchEvent(new CustomEvent('panMap', {detail: {lat: ${clinic.lat}, lng: ${clinic.lng}}}))">
                <div>
                    <h3 class="font-bold text-lg group-hover:text-primary transition-colors">${clinic.name}</h3>
                    <div class="text-sm text-gray-400 flex items-center gap-2">
                        <span class="bg-white/10 px-2 py-0.5 rounded text-xs">${clinic.type}</span>
                        <span>•</span>
                        <span>${clinic.rating} ⭐</span>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xl font-bold text-primary">${clinic.distance}</div>
                    <div class="text-xs text-gray-500">${clinic.time}</div>
                </div>
                <button class="bg-primary text-black p-2 rounded-full hover:scale-110 transition-transform" 
                    title="Navigate" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${clinic.lat},${clinic.lng}', '_blank'); event.stopPropagation();">
                    <i data-lucide="navigation" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');

        // Add listener for list click panning if not already added (simple version)
        if (!this.listListenerAdded) {
            document.addEventListener('panMap', (e) => {
                // @ts-ignore
                if (this.map && e.detail) this.map.setView([e.detail.lat, e.detail.lng], 16);
            });
            this.listListenerAdded = true;
        }

        if (window.lucide) window.lucide.createIcons();
    }
}
