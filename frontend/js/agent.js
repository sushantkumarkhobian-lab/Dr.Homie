export class MedicalAgent {
    constructor() {
        this.apiKey = "AIzaSyAnvlyDjPydwLGnV8M8erM6-VuYTAreRc0";
        this.history = [];
        this.modelUrl = null; // Will be set dynamically
        this.systemInstruction = `
        You are Dr. HOMIE, an empathetic AI Medical Assistant.
        
        RULES:
        1. TALK DIRECTLY TO THE USER (Use "You", not "The user").
        2. Ask clarifying questions INSIDE your main message.
        3. Be concise but helpful.
        4. Output JSON with "user_message" containing your full response (Markdown supported) and "top_conditions" for the probability bars.
        
        JSON STRUCTURE:
        {
            "user_message": "Hello! I see you have a headache. Is it throbbing or dull? (Markdown allowed)",
            "top_conditions": [{"name": "Migraine", "probability": 60}]
        }
        `;
    }

    async init() {
        // dynamic model discovery
        try {
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
            const response = await fetch(listUrl);
            const data = await response.json();

            // Populate available models
            this.availableModels = [];
            const allModels = data.models || [];

            // Define priority order - putting 2.0-flash first as it's generally most stable/generous
            const priorityList = [
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-1.5-pro",
                "gemini-2.5-flash" // Put restrictive beta model last
            ];

            // 1. Add priority models if found
            for (const p of priorityList) {
                const found = allModels.find(m => m.name.includes(p));
                if (found) {
                    this.availableModels.push(found.name);
                }
            }

            // 2. Add any other gemini models not already added
            const others = allModels.filter(m =>
                m.name.includes("gemini") &&
                m.supportedGenerationMethods.includes("generateContent") &&
                !this.availableModels.includes(m.name)
            );
            others.forEach(m => this.availableModels.push(m.name));

            console.log("Available Models Priority:", this.availableModels);

            if (this.availableModels.length === 0) {
                throw new Error("No Gemini models found.");
            }

            this.modelUrl = `https://generativelanguage.googleapis.com/v1beta/${this.availableModels[0]}:generateContent`;

        } catch (e) {
            console.error("Model Discovery Failed:", e);
            // Fallback hardcoded
            this.modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
            this.availableModels = ["models/gemini-1.5-flash", "models/gemini-2.0-flash"];
        }
    }

    async processMessage(userText) {
        if (!this.modelUrl) await this.init();

        this.history.push({ role: "user", parts: [{ text: userText }] });

        // Try models in sequence if one fails
        let storedError = null;

        for (const modelName of this.availableModels) {
            const currentModelUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent`;
            console.log("Attempting model:", modelName);

            try {
                const result = await this.tryGenerate(currentModelUrl, this.history);
                // If successful, update the main modelUrl to stick with the working one
                this.modelUrl = currentModelUrl;
                return result;
            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error.message);
                storedError = error;
                // Continue to next model
            }
        }

        // If all failed
        return {
            user_message: `Connection Error: All available models failed. Last error: ${storedError?.message}. Please try again later.`,
            follow_up_questions: [],
            top_conditions: []
        };
    }

    async tryGenerate(url, history) {
        const payload = {
            contents: [
                { role: "user", parts: [{ text: "SYSTEM: " + this.systemInstruction }] },
                ...history
            ],
            generationConfig: { response_mime_type: "application/json" }
        };

        const response = await fetch(`${url}?key=${this.apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            // If JSON mode fails (400), try TEXT mode
            if (response.status === 400) {
                console.warn("JSON Mode failed, retrying text mode...");
                delete payload.generationConfig;
                const retryResp = await fetch(`${url}?key=${this.apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!retryResp.ok) throw new Error(`${retryResp.status} ${retryResp.statusText} - ${await retryResp.text()}`);
                return this.parseResponse(await retryResp.json());
            }
            throw new Error(`${response.status} ${response.statusText} - ${errorBody}`);
        }

        return this.parseResponse(await response.json());
    }

    parseResponse(data) {
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No candidates returned from API");
        }
        const text = data.candidates[0].content.parts[0].text;
        this.history.push({ role: "model", parts: [{ text: text }] });
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(clean);
    }
}
