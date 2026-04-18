export class AvailableDoctorsService {
    constructor() {
        this.doctors = [];
        this.apiUrl = "https://ectodermal-wirily-mekhi.ngrok-free.dev/api/doctor/all";

        // Image mapping for specialties
        // Image mapping for specialties
        this.specialtyImages = {
            "Cardiology": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&auto=format&fit=crop&q=60",
            "Dermatology": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&auto=format&fit=crop&q=60",
            "Neurology": "https://images.unsplash.com/photo-1559757131-43d9718a9113?w=400&h=300&auto=format&fit=crop&q=60",
            "Orthopedics": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&auto=format&fit=crop&q=60",
            "Pediatrics": "https://images.unsplash.com/photo-1516575334481-f85287c2c81d?w=400&h=300&auto=format&fit=crop&q=60",
            "Psychiatry": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=300&auto=format&fit=crop&q=60",
            "General Doctor": "https://images.unsplash.com/photo-1537368910025-bc005caeb1d8?w=400&h=300&auto=format&fit=crop&q=60",
            "ENT": "https://images.unsplash.com/photo-1628525792942-88ec0c38865c?w=400&h=300&auto=format&fit=crop&q=60",
            "Gynecology": "https://images.unsplash.com/photo-1563852089456-9d32420db5e3?w=400&h=300&auto=format&fit=crop&q=60",
            "default": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&auto=format&fit=crop&q=60"
        };

        // Emoji mapping for fallback
        this.specialtyEmojis = {
            "Cardiology": "🫀",
            "Dermatology": "🧖‍♀️",
            "Neurology": "🧠",
            "Orthopedics": "🦴",
            "Pediatrics": "👶",
            "Psychiatry": "🛋️",
            "General Doctor": "🩺",
            "ENT": "👂",
            "Gynecology": "👩‍⚕️",
            "default": "👨‍⚕️"
        };
    }

    init() {
        this.fetchDoctors();
        this.setupFilters();
        this.setupBookingHandlers();
    }

    async fetchDoctors() {
        const grid = document.getElementById('available-doctors-grid');
        if (!grid) return;

        grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-400 animate-pulse">Loading available doctors...</div>`;

        try {
            // Attempt fetch
            const response = await fetch(this.apiUrl, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) throw new Error("API Failed");
            const data = await response.json();

            this.doctors = data;
            this.renderDoctors(this.doctors);

        } catch (error) {
            console.error("Failed to fetch doctors:", error);
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                <div>Unable to load doctors at this time.</div>
                <div class="text-sm opacity-70 mt-1">Please verify your connection or try again later.</div>
            </div>`;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    renderDoctors(list) {
        const grid = document.getElementById('available-doctors-grid');
        if (!grid) return;

        if (list.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-gray-500">No doctors found for this category.</div>`;
            return;
        }

        grid.innerHTML = list.map(doc => {
            const spec = doc.speciality || doc.specialty || "General Doctor";
            const img = this.specialtyImages[spec] || this.specialtyImages["default"];
            const emoji = this.specialtyEmojis[spec] || this.specialtyEmojis["default"];

            return `
            <div class="glass-panel overflow-hidden group hover:bg-white/5 transition-all relative">
                <div class="h-48 overflow-hidden relative bg-gray-800">
                    <img src="${img}" alt="${spec}" 
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onerror="this.outerHTML='<div class=\'w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 select-none\'>${emoji}</div>'">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
                    <div class="absolute bottom-4 left-4 right-4 pointer-events-none">
                        <h3 class="text-xl font-bold text-white truncate">${doc.name}</h3>
                        <div class="text-primary text-sm font-semibold uppercase tracking-wider">${spec}</div>
                    </div>
                </div>
                
                <div class="p-6 space-y-3">
                    <div class="flex items-center gap-3 text-gray-400 text-sm">
                        <i data-lucide="mail" class="w-4 h-4 text-primary"></i>
                        <span class="truncate">${doc.email}</span>
                    </div>
                    <div class="flex items-center gap-3 text-gray-400 text-sm">
                        <i data-lucide="phone" class="w-4 h-4 text-primary"></i>
                        <span>${doc.phone}</span>
                    </div>

                    <button 
                        class="book-appointment-btn w-full mt-4 bg-primary/10 hover:bg-primary hover:text-black text-primary border border-primary/50 font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                        data-id="${doc._id || doc.id}" 
                        data-name="${doc.name}">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        Book Appointment
                    </button>
                </div>
            </div>
                `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    setupFilters() {
        const container = document.getElementById('doctor-filters');
        if (!container) return;

        const filters = ["All", "Cardiology", "Dermatology", "Neurology", "Orthopedics", "Pediatrics", "Psychiatry", "General Doctor", "ENT", "Gynecology"];

        container.innerHTML = filters.map(f => `
            <button class="filter-btn px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap ${f === 'All' ? 'bg-primary text-black font-bold border-primary' : 'text-gray-300'}"
                data-filter="${f}">
                ${f}
            </button>
        `).join('');

        // Event Delegation for Filters
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            // Update UI
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-primary', 'text-black', 'font-bold', 'border-primary');
                b.classList.add('text-gray-300', 'border-white/10');
            });
            btn.classList.remove('text-gray-300', 'border-white/10');
            btn.classList.add('bg-primary', 'text-black', 'font-bold', 'border-primary');

            // Filter Data
            const filter = btn.dataset.filter;
            if (filter === 'All') {
                this.renderDoctors(this.doctors);
            } else {
                const filtered = this.doctors.filter(d => (d.speciality || d.specialty) === filter);
                this.renderDoctors(filtered);
            }
        });

        // Event Delegation for Booking Button
        const grid = document.getElementById('available-doctors-grid');
        if (grid) {
            grid.addEventListener('click', (e) => {
                const btn = e.target.closest('.book-appointment-btn');
                if (!btn) return;

                const id = btn.dataset.id;
                const name = btn.dataset.name;
                this.openBookingModal(id, name);
            });
        }
    }

    setupBookingHandlers() {
        // Handle Booking Form Submission
        const form = document.getElementById('booking-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.innerText;
                btn.innerText = "Booking...";
                btn.disabled = true;

                const formData = new FormData(e.target);
                const payload = {
                    doctorId: formData.get('doctorId'),
                    userEmail: formData.get('userEmail'),
                    time: new Date(formData.get('time')).toISOString() // Convert to ISO string as per example
                };

                try {
                    const response = await fetch('https://ectodermal-wirily-mekhi.ngrok-free.dev/api/appointment/book', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'ngrok-skip-browser-warning': 'true'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        alert('Appointment Booked Successfully!');
                        document.getElementById('booking-modal').classList.add('hidden');
                        form.reset();
                    } else {
                        throw new Error('Booking failed');
                    }
                } catch (error) {
                    console.error('Booking Error:', error);
                    alert('Failed to book appointment. Please check connection and try again.');
                } finally {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            };
        }
    }

    openBookingModal(docId, docName) {
        const modal = document.getElementById('booking-modal');
        const nameEl = document.getElementById('booking-doctor-name');
        const idInput = document.getElementById('booking-doctor-id');

        if (modal && nameEl && idInput) {
            nameEl.innerText = `With ${docName} `;
            idInput.value = docId;
            modal.classList.remove('hidden');
        }
    }
}
