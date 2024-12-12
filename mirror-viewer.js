// mirror-viewer.js
require('dotenv').config();
const axios = require('axios');

async function viewTopicMessagesFromMirror(topicId) {
    try {
        console.log(`\n🔍 Viewing messages for topic: ${topicId}`);
        console.log("================================================");

        const response = await axios.get(
            `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`
        );

        if (response.data.messages) {
            for (const message of response.data.messages) {
                console.log("\n📝 Message Details:");
                console.log("Timestamp:", new Date(message.consensus_timestamp * 1000).toLocaleString());
                console.log("Sequence #:", message.sequence_number);
                
                try {
                    const decoded = Buffer.from(message.message, 'base64').toString();
                    const parsed = JSON.parse(decoded);
                    console.log("\nContent:");
                    console.log(JSON.stringify(parsed, null, 2));
                } catch (err) {
                    console.log("Raw Content:", message.message);
                }
                console.log("------------------------------------------------");
            }
        }

        console.log("\n✅ Total messages:", response.data.messages?.length || 0);

    } catch (error) {
        console.error("Error:", error.response?.data || error);
    }
}

// Get topic ID from command line or use default
const topicId = process.argv[2] || "0.0.5202172";  // Your last created topic

// Install axios first:
// npm install axios

viewTopicMessagesFromMirror(topicId).then(() => {
    process.exit(0);
});