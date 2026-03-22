import { startConsumer } from "./lib/kafka/consumer.js";

startConsumer().catch((err) => {
    console.error("Consumer failed:", err);
    process.exit(1);
});
