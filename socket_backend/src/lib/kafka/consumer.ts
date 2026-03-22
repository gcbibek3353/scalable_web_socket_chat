import { prisma } from "../prisma/client.js";
import { kafka } from "./client.js";

export async function startConsumer() {
    const consumer = kafka.consumer({ groupId: "chat-consumer-group" });

    await consumer.connect();
    console.log("Kafka consumer connected");

    await consumer.subscribe({ topic: "chat", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("message received", message.value?.toString());
            const result = await prisma.message.create({
                data: {
                    content: message.value?.toString() || "",
                    createdAt: new Date(),
                },
            });
            console.log(result);
            
            // console.log("Message saved to database", result.content);
        },
    });

    console.log("Kafka consumer running...");
}