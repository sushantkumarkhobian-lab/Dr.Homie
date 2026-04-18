export class IoTService {
    constructor() {
        this.isConnected = false;
        this.intervalId = null;
    }

    init() {
        // Expose global toggle function
        window.toggleIoT = (btn) => this.toggle(btn);
    }

    toggle(btn) {
        this.isConnected = !this.isConnected;
        const dash = document.getElementById('iot-dashboard');

        // Visual Toggle
        const isActive = btn.classList.toggle('bg-primary');
        const knob = btn.querySelector('div');
        if (knob) knob.style.transform = isActive ? 'translateX(32px)' : 'translateX(0)';

        if (this.isConnected) {
            this.startSimulation(dash);
        } else {
            this.stopSimulation(dash);
        }
    }

    startSimulation(dash) {
        if (!dash) return;

        // Remove disabled state
        dash.classList.remove('opacity-50', 'pointer-events-none', 'grayscale');

        // Initial Render
        this.renderVitals(dash);

        // Start updates
        this.intervalId = setInterval(() => {
            this.renderVitals(dash);
        }, 2000);
    }

    stopSimulation(dash) {
        if (!dash) return;

        if (this.intervalId) clearInterval(this.intervalId);

        // Add disabled state
        dash.classList.add('opacity-50', 'pointer-events-none', 'grayscale');
        dash.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-center">
                <i data-lucide="wifi-off" class="w-16 h-16 mx-auto mb-4 text-gray-500"></i>
                <h3 class="text-2xl font-bold mb-2">Device Disconnected</h3>
                <p>Please toggle ON to connect to your wearable device.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }

    renderVitals(dash) {
        // Simulate random fluctuations
        const heartRate = 70 + Math.floor(Math.random() * 10);
        const spo2 = 97 + Math.floor(Math.random() * 3); // 97-99
        const temp = (98 + Math.random()).toFixed(1);

        dash.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <!-- Heart Rate -->
                <div class="bg-gray-800/50 p-8 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div class="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                    <div class="text-sm text-gray-400 uppercase tracking-widest mb-2 z-10">Heart Rate</div>
                    <div class="flex items-baseline gap-2 z-10">
                        <span class="text-6xl font-bold text-red-500">${heartRate}</span>
                        <span class="text-xl text-gray-500">BPM</span>
                    </div>
                    <i data-lucide="heart" class="w-24 h-24 absolute -bottom-4 -right-4 text-red-500/20 group-hover:scale-110 transition-transform"></i>
                    
                    <!-- Graph Simulation -->
                    <div class="w-full h-12 mt-6 flex item-end gap-1 items-end justify-center opacity-50">
                        ${[...Array(10)].map(() => `<div class="w-2 bg-red-500 rounded-t" style="height: ${Math.random() * 100}%"></div>`).join('')}
                    </div>
                </div>

                <!-- Oxygen -->
                <div class="bg-gray-800/50 p-8 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div class="text-sm text-gray-400 uppercase tracking-widest mb-2 z-10">SpO2</div>
                    <div class="flex items-baseline gap-2 z-10">
                        <span class="text-6xl font-bold text-blue-500">${spo2}%</span>
                    </div>
                    <i data-lucide="droplet" class="w-24 h-24 absolute -bottom-4 -right-4 text-blue-500/20 group-hover:scale-110 transition-transform"></i>
                    <div class="w-full bg-gray-700 h-2 mt-6 rounded-full overflow-hidden">
                        <div class="bg-blue-500 h-full" style="width: ${spo2}%"></div>
                    </div>
                </div>

                <!-- Temp -->
                <div class="bg-gray-800/50 p-8 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div class="text-sm text-gray-400 uppercase tracking-widest mb-2 z-10">Temperature</div>
                    <div class="flex items-baseline gap-2 z-10">
                        <span class="text-6xl font-bold text-yellow-500">${temp}</span>
                        <span class="text-xl text-gray-500">°F</span>
                    </div>
                    <i data-lucide="thermometer" class="w-24 h-24 absolute -bottom-4 -right-4 text-yellow-500/20 group-hover:scale-110 transition-transform"></i>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}
