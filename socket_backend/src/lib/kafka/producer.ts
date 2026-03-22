import { kafka } from "./client.js" 

const producer = kafka.producer();

await producer.connect();
console.log("producer connected");


export const produceMessage = async ( message : string , topic : string) => {
    await producer.send({
        topic: topic,
        messages: [
            { value: message },
        ],
    });
}

// await producer.disconnect();
// console.log("producer disconnected");