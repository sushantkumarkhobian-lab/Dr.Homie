import { MedicalAgent } from './js/agent.js';

async function main() {
    console.log("Initializing Medical Agent...");
    const agent = new MedicalAgent();

    try {
        await agent.init();
        console.log("Agent Initialized.");
        console.log("Querying: 'I have a mild fever and headache.'");

        const response = await agent.processMessage("I have a mild fever and headache.");
        console.log("\n--- AGENT RESPONSE ---");
        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error running agent:", error);
    }
}

main();
