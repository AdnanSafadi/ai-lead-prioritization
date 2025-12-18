import OpenAI from "openai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT, getUserPrompt } from "./constant/prompt";
import { Extracted } from "./models/extracted";


export async function extractFromTranscript(transcript: string): Promise<Extracted> {
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = SYSTEM_PROMPT;

    const user = getUserPrompt(transcript);

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content;
    if (!text) throw new Error("Empty response from OpenAI");

    const data = JSON.parse(text);
    return data as Extracted;
}



