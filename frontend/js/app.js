// app.js

// Imports
import { MedicalAgent } from './agent.js';
import { ClinicMap } from './map.js';
import { PharmacyService } from './pharmacy.js?v=99';
import { IoTService } from './iot.js';
import { ContentService } from './content.js';
import { AvailableDoctorsService } from './available_doctors.js';


// Initialize Lucide Icons
// @ts-ignore
if (window.lucide) {
    window.lucide.createIcons();
}

// Global Router Logic
function handleRouting() {
    const hash = window.location.hash || '#home';
    const sections = document.querySelectorAll('.page-section');

    // Hide all sections
    sections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });

    // Show active section
    const activeSection = document.querySelector(hash);
    if (activeSection) {
        activeSection.classList.remove('hidden');
        activeSection.classList.add('active');

        // Scroll to top
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
    } else {
        // Fallback to home
        document.querySelector('#home').classList.remove('hidden');
    }
}

// Scroll Animation Logic
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

// --- SERVICE INITIALIZATION ---

let agent, mapService, pharmacyService, iotService, contentService, availableDoctorsService;

async function initServices() {
    console.log("Initializing Services...");

    // 1. Agent
    if (!agent) {
        agent = new MedicalAgent();
    }

    // 2. Map
    if (!mapService && document.getElementById('map')) {
        mapService = new ClinicMap();
        mapService.init();
    }

    // 3. Pharmacy
    if (!pharmacyService && document.getElementById('medicines')) {
        pharmacyService = new PharmacyService();
        pharmacyService.init();
    }

    // 4. IoT
    if (!iotService && document.getElementById('iot-dashboard')) {
        iotService = new IoTService();
        iotService.init();
    }

    // 5. Content (News/Schemes)
    if (!contentService && document.getElementById('schemes')) {
        contentService = new ContentService();
        contentService.init();
    }

    // 6. Available Doctors
    if (!availableDoctorsService && document.getElementById('available-doctors-grid')) {
        availableDoctorsService = new AvailableDoctorsService();
        availableDoctorsService.init();
        window.availableDoctorsService = availableDoctorsService; // Expose for onclick handlers
    }
}

// --- REGISTER LOGIC ---
function handleRegister(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Registering...";
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        specialty: formData.get('speciality'),
        phone: formData.get('phone'),
        email: formData.get('email')
    };

    // API Call
    fetch('https://ectodermal-wirily-mekhi.ngrok-free.dev/api/doctor/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                alert('Registration Successful! Your details have been submitted for verification.');
                document.getElementById('register-modal').classList.add('hidden');
                e.target.reset();
            } else {
                alert('Registration failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Connection error. Could not verify with server, but form logic is valid.');
        })
        .finally(() => {
            btn.innerText = originalText;
            btn.disabled = false;
        });
}


// --- CHAT LOGIC ---

const chatOutput = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(role, text) {
    if (!chatOutput) return;

    const div = document.createElement('div');
    div.className = "flex items-start gap-4 animate-fade-in mb-4";

    if (role === 'user') {
        div.innerHTML = `
            <div class="flex-1"></div>
            <div class="bg-primary/20 border border-primary/50 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                ${text}
            </div>
            <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold border border-white/20">
                <i data-lucide="user" class="w-6 h-6"></i>
            </div>
        `;
    } else {
        // Agent JSON Logic
        let content = text;
        try {
            if (text.trim().startsWith('{')) {
                const data = JSON.parse(text);
                content = `
                    <div class="mb-2 font-bold text-primary text-xs tracking-widest uppercase flex items-center gap-2">
                        <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        ${(data.reasoning_stage || 'RESPONSE').replace('_', ' ')}
                    </div>
                    <div class="mb-4 text-base leading-relaxed">${data.user_message.replace(/\n/g, '<br>')}</div>
                    
                    ${data.top_conditions && data.top_conditions.length > 0 ? `
                        <div class="mt-4 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <p class="text-red-400 text-[10px] font-bold uppercase mb-3 flex items-center gap-2">
                                <i data-lucide="alert-circle" class="w-3 h-3"></i> Analysis Only
                            </p>
                            <ul class="space-y-2">
                                ${data.top_conditions.map(c =>
                    `<li class="flex justify-between items-center text-sm group">
                                        <span class="text-gray-300 group-hover:text-white transition-colors">${c.name}</span>
                                        <div class="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-gradient-to-r from-primary to-secondary" style="width: ${c.probability}%"></div>
                                        </div>
                                        <span class="font-mono text-xs text-primary ml-2">${c.probability}%</span>
                                     </li>`
                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `;
            }
        } catch (e) {
            console.error("JSON Rendering Error", e);
        }

        div.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,242,234,0.3)]">
                <i data-lucide="bot" class="w-6 h-6"></i>
            </div>
            <div class="bg-gray-800/80 backdrop-blur border border-white/10 p-5 rounded-2xl rounded-tl-none max-w-[90%] shadow-xl">
                ${content}
            </div>
        `;
    }

    chatOutput.appendChild(div);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    chatInput.value = '';

    // Typing Indicator
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = "flex items-center gap-2 ml-14 text-primary text-xs animate-pulse mb-4";
    typingDiv.innerHTML = `<i data-lucide="activity" class="w-4 h-4 animate-spin"></i> PRE-CLINICAL REASONING ENGINE ACTIVE...`;
    chatOutput.appendChild(typingDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
    if (window.lucide) window.lucide.createIcons();

    // Process
    const response = await agent.processMessage(text);

    document.getElementById(typingId)?.remove();
    appendMessage('model', JSON.stringify(response));
}

// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    // Router
    handleRouting();
    window.addEventListener('hashchange', handleRouting);

    // Observer
    const hiddenElements = document.querySelectorAll('.fade-in-up');
    hiddenElements.forEach((el) => observer.observe(el));

    // Services
    initServices();

    // Register Handler
    const regForm = document.getElementById('register-form');
    if (regForm) regForm.onsubmit = handleRegister;

    // Chat Bindings
    if (sendBtn) sendBtn.onclick = handleSend;
    if (chatInput) chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // Re-run icons
    if (window.lucide) window.lucide.createIcons();
});
