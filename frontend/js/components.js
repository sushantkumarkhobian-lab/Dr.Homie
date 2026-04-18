// components.js

// Mock Data
const doctors = [
    { name: "Dr. Sarah Johnson", specialty: "Cardiologist", exp: "12 years", rating: 4.9, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Dr. Aravind Patel", specialty: "Neurologist", exp: "15 years", rating: 4.8, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Dr. Emily Chen", specialty: "Pediatrician", exp: "8 years", rating: 4.7, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300" },
    { name: "Dr. Michael Brown", specialty: "General Physician", exp: "20 years", rating: 5.0, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300" },
];

const medicines = [
    { id: 1, name: "Paracetamol 500mg", price: "₹30", type: "Tablet", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200" },
    { id: 2, name: "Vitamin C Supplements", price: "₹150", type: "Supplement", image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=200" },
    { id: 3, name: "Cough Syrup", price: "₹120", type: "Syrup", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=200" },
    { id: 4, name: "N95 Mask (Pack of 5)", price: "₹200", type: "Equipment", image: "https://images.unsplash.com/photo-1585776245991-cf79dd40e2c7?auto=format&fit=crop&q=80&w=200" },
];

// Render Functions
function renderDoctors() {
    const container = document.querySelector('#doctors');
    if (!container) return;

    let html = `
        <h2 class="text-4xl font-bold mb-8 text-center text-gradient">Certified Doctors</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
    `;

    doctors.forEach(doc => {
        html += `
            <div class="glass-panel p-4 flex flex-col items-center text-center hover:bg-white/5 transition-all group">
                <div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary group-hover:scale-105 transition-transform">
                    <img src="${doc.image}" alt="${doc.name}" class="w-full h-full object-cover">
                </div>
                <h3 class="text-xl font-bold">${doc.name}</h3>
                <p class="text-primary text-sm">${doc.specialty}</p>
                <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>${doc.exp} exp</span>
                    <span>•</span>
                    <span class="text-yellow-400">★ ${doc.rating}</span>
                </div>
                <button onclick="openBooking('${doc.name}')" class="mt-4 w-full bg-gray-700 hover:bg-primary hover:text-black py-2 rounded-full font-bold transition-colors">
                    Book Appointment
                </button>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function renderMedicines() {
    const container = document.querySelector('#medicines');
    if (!container) return;

    let html = `
        <h2 class="text-4xl font-bold mb-8 text-center text-gradient">Online Pharmacy</h2>
        <div class="flex justify-end max-w-6xl mx-auto mb-4">
             <button class="bg-primary text-black px-4 py-2 rounded-full font-bold flex items-center gap-2">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i> Cart <span id="cart-count">0</span>
             </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
    `;

    medicines.forEach(med => {
        html += `
            <div class="glass-panel p-4 flex flex-col hover:bg-white/5 transition-all">
                <div class="h-40 rounded-xl overflow-hidden mb-4 bg-gray-800">
                    <img src="${med.image}" alt="${med.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-lg">${med.name}</h3>
                        <p class="text-xs text-gray-400">${med.type}</p>
                    </div>
                    <span class="text-primary font-bold">${med.price}</span>
                </div>
                <button onclick="addToCart(${med.id})" class="mt-auto w-full border border-primary text-primary hover:bg-primary hover:text-black py-2 rounded-lg font-bold transition-colors">
                    Add to Cart
                </button>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// Cart Logic
window.cart = [];
window.addToCart = function (id) {
    const item = medicines.find(m => m.id === id);
    if (item) {
        window.cart.push(item);
        const btn = document.getElementById('cart-count');
        if (btn) btn.innerText = window.cart.length;

        // Simple Toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg animate-bounce z-50';
        toast.innerText = 'Added to Cart!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderDoctors();
    renderMedicines();
    if (window.lucide) window.lucide.createIcons();
});

// Booking Logic
window.openBooking = function (doctorName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-full max-w-md relative">
            <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 class="text-2xl font-bold mb-4">Book with ${doctorName}</h2>
            <form onsubmit="handleBooking(event, '${doctorName}')" class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Date</label>
                    <input type="date" required class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-primary outline-none">
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Time</label>
                    <select required class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-primary outline-none">
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>02:00 PM</option>
                        <option>04:00 PM</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Patient Name</label>
                    <input type="text" required placeholder="John Doe" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:border-primary outline-none">
                </div>
                <button type="submit" class="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                    Confirm Appointment
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

window.handleBooking = function (e, doctorName) {
    e.preventDefault();
    const date = e.target.querySelector('input[type="date"]').value;
    const time = e.target.querySelector('select').value;
    const patient = e.target.querySelector('input[type="text"]').value;

    const appointment = { doctor: doctorName, date, time, patient, timestamp: new Date().toISOString() };

    // Save to LocalStorage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));

    // Close Modal
    e.target.closest('.fixed').remove();

    // Success Message
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg z-50';
    toast.innerText = 'Appointment Booked Successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
