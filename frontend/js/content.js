export class ContentService {
    constructor() {
        this.schemes = [
            {
                title: "Ayushman Bharat PM-JAY",
                desc: "The world's largest health insurance scheme fully financed by the government, providing a cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization.",
                benefit: "₹5 Lakh Cover",
                link: "https://pmjay.gov.in/"
            },
            {
                title: "Pradhan Mantri Suraksha Bima Yojana",
                desc: "A government-backed accident insurance scheme in India offering accidental death and disability cover for death or disability due to an accident.",
                benefit: "₹2 Lakh Insurance",
                link: "https://financialservices.gov.in/beta/en/pm-sby"
            },
            {
                title: "National Health Mission (NHM)",
                desc: "Supports the States/UTs for strengthening their health care systems so as to provide universal access to equitable, affordable and quality health care services.",
                benefit: "Universal Healthcare",
                link: "https://nhm.gov.in/"
            },
            {
                title: "Pradhan Mantri Matru Vandana Yojana",
                desc: "A maternity benefit program run by the government of India that supports pregnant women and lactating mothers.",
                benefit: "Maternity Cash Benefit",
                link: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana"
            },
            {
                title: "Mission Indradhanush",
                desc: "To expand immunization coverage to all children across India by the year 2020. It targets children under 2 years of age and pregnant women.",
                benefit: "Free Immunization",
                link: "https://www.nhp.gov.in/mission-indradhanush1_pg"
            },
            {
                title: "Jan Aushadhi Yojana",
                desc: "Campaign launched by the Department of Pharmaceuticals to provide quality medicines at affordable prices to the masses.",
                benefit: "Affordable Generic Meds",
                link: "http://janaushadhi.gov.in/"
            }
        ];

        this.news = [
            { title: "WHO declares new global health emergency", source: "WHO International", time: "2h ago" },
            { title: "Breakthrough in AI-driven Cancer Detection", source: "Medical News Today", time: "5h ago" },
            { title: "New guidelines for daily exercise released", source: "Healthline", time: "1d ago" }
        ];
    }

    init() {
        this.renderSchemes();
        this.renderNews();
    }

    renderSchemes() {
        const container = document.getElementById('schemes-list');
        if (!container) return;

        container.innerHTML = this.schemes.map(s => `
            <div class="glass-panel p-6 hover:bg-white/5 transition-colors border-l-4 border-orange-500">
                <h3 class="text-xl font-bold mb-2">${s.title}</h3>
                <p class="text-gray-400 text-sm mb-4">${s.desc}</p>
                <div class="flex justify-between items-center">
                    <span class="text-green-400 font-bold text-sm bg-green-500/10 px-3 py-1 rounded-full">${s.benefit}</span>
                    <a href="${s.link}" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
                        Apply Now <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                </div>
            </div>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    renderNews() {
        const container = document.getElementById('news-list');
        if (!container) return;

        container.innerHTML = this.news.map(n => `
            <div class="flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                <div class="bg-primary/20 p-3 rounded-lg text-primary">
                    <i data-lucide="newspaper" class="w-6 h-6"></i>
                </div>
                <div>
                    <h4 class="font-bold text-lg mb-1 hover:text-primary transition-colors">${n.title}</h4>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                        <span>${n.source}</span>
                        <span>•</span>
                        <span>${n.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    }
}
