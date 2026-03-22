import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";
import { produceMessage } from "./lib/kafka/producer.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT || "8080");
const REDIS_CONNECTION_STRING =
  process.env.REDIS_CONNECTION_STRING || "redis://localhost:6379";

const publisher = createClient({ url: REDIS_CONNECTION_STRING });
const subscriber = createClient({ url: REDIS_CONNECTION_STRING });

async function main() {
  await publisher.connect();
  await subscriber.connect();
  console.log("Connected to Redis");

  const wss = new WebSocketServer({ port: PORT });

  await subscriber.subscribe("chat", (message) => {
    console.log("Redis chat message:", message);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  wss.on("connection", (ws: WebSocket) => {
    console.log("Client connected");

    ws.on("message", async (message: Buffer) => {
      const text = message.toString();
      console.log("Received:", text);
      publisher.publish("chat", text);
      
      // This DB call may be slow and very frequent , so we need to publish it to kafka and let the kafka consumer handle the database operations.
      // const reslut = await prisma.message.create({
      //   data : {
      //     content : text,
      //     createdAt : new Date(),
      //   }
      // })

      produceMessage(text , "chat");
      console.log("Message produced to Kafka");

    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });

    ws.send("Welcome to the WebSocket server!");
  });

  console.log(`WebSocket server running on ws://localhost:${PORT}`);
}

main().catch(console.error);
