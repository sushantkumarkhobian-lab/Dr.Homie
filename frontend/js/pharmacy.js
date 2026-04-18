export class PharmacyService {
    constructor() {
        this.providers = [
            { name: "All", color: "bg-gray-700" },
            { name: "Amazon", color: "bg-yellow-500", url: "https://www.amazon.in/s?k=" },
            { name: "1mg", color: "bg-orange-500", url: "https://www.1mg.com/search/all?name=" },
            { name: "Apollo", color: "bg-emerald-500", url: "https://www.apollopharmacy.in/search-medicines/" },
            { name: "Netmeds", color: "bg-blue-500", url: "https://www.netmeds.com/catalogsearch/result?q=" },
            { name: "Pharmeasy", color: "bg-green-500", url: "https://pharmeasy.in/search/all?name=" }
        ];
        this.currentFilter = "All";
    }

    init() {
        this.renderInterface();
        this.setupSearch();
    }

    renderInterface() {
        const container = document.getElementById('medicines').querySelector('.max-w-7xl');
        if (!container) return;

        // Reset Container for Google-Style Layout
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[60vh] text-center mb-12 animate-fade-in relative z-10">
                
                <h2 class="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">
                    <span class="text-blue-500">G</span><span class="text-red-500">o</span><span class="text-yellow-500">o</span><span class="text-blue-500">g</span><span class="text-green-500">l</span><span class="text-red-500">e</span>
                    <span class="text-white text-3xl md:text-5xl ml-2">Pharmacy</span>
                </h2>

                <div class="w-full max-w-2xl relative group">
                    <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors"></i>
                    </div>
                    <input type="text" id="pharmacy-search-input" 
                        class="w-full bg-gray-800/50 border border-gray-600 rounded-full py-4 pl-12 pr-12 text-lg focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all shadow-lg hover:shadow-blue-500/10"
                        placeholder="Search medicines, equipment (e.g., 'Paracetamol', 'Oximeter')...">
                    <div class="absolute inset-y-0 right-4 flex items-center cursor-pointer hover:text-blue-500 transition-colors" onclick="document.getElementById('pharmacy-search-input').value = ''">
                         <i data-lucide="x" class="w-5 h-5"></i>
                    </div>
                </div>

                <!-- Provider Tabs -->
                <div class="flex flex-wrap justify-center gap-3 mt-8" id="provider-tabs">
                    ${this.providers.map(p => `
                        <button class="px-4 py-2 rounded-full border border-gray-700 text-sm font-medium hover:bg-gray-800 transition-all ${p.name === 'All' ? 'bg-gray-800 text-white border-blue-500/50' : 'text-gray-400'}"
                            onclick="window.pharmacyService.setFilter('${p.name}')">
                            ${p.name}
                        </button>
                    `).join('')}
                </div>

                <div class="mt-8 text-sm text-gray-500">
                    Search across top trusted Indian pharmacies instantly.
                </div>
            </div>

            <!-- Results Section -->
            <div id="pharmacy-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 hidden">
                <!-- Results Injected Here -->
            </div>
        `;

        window.pharmacyService = this;
        if (window.lucide) window.lucide.createIcons();
    }

    setupSearch() {
        const input = document.getElementById('pharmacy-search-input');
        if (!input) return;

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(input.value);
            }
        });

        // Debounce for live typing feel
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (e.target.value.length > 2) {
                    this.performSearch(e.target.value);
                } else if (e.target.value.length === 0) {
                    document.getElementById('pharmacy-results').classList.add('hidden');
                }
            }, 800);
        });
    }

    setFilter(name) {
        this.currentFilter = name;

        // Update UI Tabs
        const tabs = document.getElementById('provider-tabs').children;
        Array.from(tabs).forEach(tab => {
            if (tab.innerText.includes(name)) {
                tab.classList.remove('text-gray-400', 'border-gray-700');
                tab.classList.add('bg-gray-800', 'text-white', 'border-blue-500/50');
            } else {
                tab.classList.remove('bg-gray-800', 'text-white', 'border-blue-500/50');
                tab.classList.add('text-gray-400', 'border-gray-700');
            }
        });

        // Re-run search if query exists
        const query = document.getElementById('pharmacy-search-input').value;
        if (query) this.performSearch(query);
    }

    performSearch(query) {
        if (!query) return;
        const resultsContainer = document.getElementById('pharmacy-results');
        resultsContainer.classList.remove('hidden');
        resultsContainer.innerHTML = `<div class="col-span-full text-center py-10"><i data-lucide="loader" class="animate-spin w-8 h-8 mx-auto text-blue-500"></i><div class="mt-2 text-gray-500">Searching providers...</div></div>`;
        if (window.lucide) window.lucide.createIcons();

        // Simulate API latency for realism
        setTimeout(() => {
            this.renderResults(query);
        }, 600);
    }

    renderResults(query) {
        const resultsContainer = document.getElementById('pharmacy-results');
        let targets = this.providers.filter(p => p.name !== 'All');

        if (this.currentFilter !== 'All') {
            targets = targets.filter(p => p.name === this.currentFilter);
        }

        if (targets.length === 0) {
            resultsContainer.innerHTML = `<div class="col-span-full text-center text-gray-500">No providers found for filter.</div>`;
            return;
        }

        resultsContainer.innerHTML = targets.map(provider => {
            const searchUrl = `${provider.url}${encodeURIComponent(query)}`;

            return `
            <a href="${searchUrl}" target="_blank" class="glass-panel p-6 flex items-center justify-between group hover:bg-white/5 hover:border-blue-500/30 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full ${provider.color} flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        ${provider.name[0]}
                    </div>
                    <div>
                        <div class="text-xs text-gray-400 mb-0.5">Available on</div>
                        <h3 class="text-xl font-bold group-hover:text-blue-400 transition-colors">${provider.name}</h3>
                        <div class="text-sm text-gray-500 mt-1 flex items-center gap-1 group-hover:text-gray-300">
                             Search for "${query}" <i data-lucide="external-link" class="w-3 h-3"></i>
                        </div>
                    </div>
                </div>
                <div>
                     <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                     </div>
                </div>
            </a>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }
}
