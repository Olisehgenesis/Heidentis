// test-app-topic.cjs
require('dotenv').config();
const { 
    Client, 
    PrivateKey,
    TopicMessageSubmitTransaction,
    TopicMessageQuery,
    TopicCreateTransaction,
    TopicInfoQuery
} = require("@hashgraph/sdk");

async function main() {
    try {
        // Initialize client
        const client = Client.forTestnet();
        client.setOperator(
            process.env.VITE_MY_ACCOUNT_ID,
            process.env.VITE_MY_PRIVATE_KEY
        );

        console.log("\n📝 Step 1: Creating app topic...");
        const createTopicTx = await new TopicCreateTransaction()
            .setSubmitKey(client.operatorPublicKey)
            .setTopicMemo("Hedera Credential System App Topic")
            .execute(client);
        const createTopicRx = await createTopicTx.getReceipt(client);
        const topicId = createTopicRx.topicId;
        console.log(`✅ App topic created with ID: ${topicId.toString()}`);

        // Verify topic creation
        const topicInfo = await new TopicInfoQuery()
            .setTopicId(topicId)
            .execute(client);
        console.log("Topic memo:", topicInfo.topicMemo);

        console.log("\n📝 Step 2: Preparing test data...");
        
        // Create institution
        const privateKey = PrivateKey.generateED25519();
        const institutionMessage = {
            type: 'INSTITUTION_REGISTRATION',
            data: {
                did: `did:hedera:testnet:${privateKey.publicKey.toString()}`,
                publicKey: privateKey.publicKey.toString(),
                name: "Test University",
                type: "Education",
                status: "pending",
                creatorId: client.operatorAccountId.toString(),
                registeredAt: new Date().toISOString()
            }
        };
        console.log("Institution DID:", institutionMessage.data.did);

        // Create form
        const formMessage = {
            type: 'FORM_CREATION',
            data: {
                id: `form-${Date.now()}`,
                institutionDid: institutionMessage.data.did,
                name: "Degree Certificate",
                description: "Application for degree certification",
                fields: [
                    {
                        id: "1",
                        name: "fullName",
                        label: "Full Name",
                        type: "text",
                        required: true
                    },
                    {
                        id: "2",
                        name: "graduationDate",
                        label: "Graduation Date",
                        type: "date",
                        required: true
                    }
                ],
                active: true,
                createdAt: new Date().toISOString()
            }
        };

        // Start listening for messages
        console.log("\n📝 Step 3: Setting up message listener...");
        let messagesReceived = 0;
        const messagePromise = new Promise((resolve) => {
            const subscriptionHandle = new TopicMessageQuery()
                .setTopicId(topicId)
                .setStartTime(0)
                .subscribe(
                    client,
                    (message) => {
                        messagesReceived++;
                        try {
                            const messageData = JSON.parse(Buffer.from(message.contents, 'utf8').toString());
                            console.log("\n📨 Retrieved message #", messagesReceived);
                            console.log("- Type:", messageData.type);
                            console.log("- Sequence number:", message.sequenceNumber.toString());
                            console.log("- Content:", JSON.stringify(messageData.data, null, 2));
                            
                            // Check if we've received both messages
                            if (messagesReceived >= 2) {
                                resolve(true);
                                subscriptionHandle.unsubscribe();
                            }
                        } catch (err) {
                            console.error("Error processing message:", err);
                        }
                    },
                    (error) => {
                        console.error("❌ Error in subscription:", error);
                    }
                );
        });

        // Submit messages
        console.log("\n📝 Step 4: Submitting messages...");
        
        // Submit institution
        console.log("Submitting institution...");
        const institutionTx = await new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(JSON.stringify(institutionMessage))
            .execute(client);
        await institutionTx.getReceipt(client);
        console.log("✅ Institution submitted");

        // Submit form
        console.log("Submitting form...");
        const formTx = await new TopicMessageSubmitTransaction()
            .setTopicId(topicId)
            .setMessage(JSON.stringify(formMessage))
            .execute(client);
        await formTx.getReceipt(client);
        console.log("✅ Form submitted");

        // Wait for messages with timeout
        console.log("\nWaiting for message consensus (30 second timeout)...");
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout waiting for messages")), 30000)
        );

        try {
            await Promise.race([messagePromise, timeoutPromise]);
            console.log("\n✅ Test verification complete!");
            console.log("Messages received:", messagesReceived);
            
            // Get final topic info
            const finalTopicInfo = await new TopicInfoQuery()
                .setTopicId(topicId)
                .execute(client);
            console.log("Final topic sequence number:", finalTopicInfo.sequenceNumber.toString());
        } catch (error) {
            if (error.message === "Timeout waiting for messages") {
                console.log("\n⚠️ Timeout reached. Messages received:", messagesReceived);
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error("\n❌ Error in test:", error);
        throw error;
    }
}

// Execute with completion handling
main()
    .then(() => {
        console.log("\n🎉 Test completed successfully!");
        setTimeout(() => {
            console.log("Exiting...");
            process.exit(0);
        }, 5000);
    })
    .catch((error) => {
        console.error("\n💥 Test failed:", error);
        process.exit(1);
    });