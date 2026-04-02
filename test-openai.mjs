import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  console.log("Using API Key starting with:", process.env.OPENAI_API_KEY.substring(0, 15) + "...");
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hola, estás vivo?" }],
    });
    console.log("EXITO! Respuesta:", result.choices[0].message.content);
  } catch (error) {
    console.error("ERROR FAIL:", error.message);
  }
}

test();
