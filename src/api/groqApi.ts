import { Groq } from "groq-sdk";

const apiKey = process.env.REACT_APP_GROQ_API_KEY;

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

// const chatCompletion = await groq.chat.completions.create({
//   messages: [
//     {
//       role: "user",
//       content: "",
//     },
//   ],
//   model: "openai/gpt-oss-120b",
//   temperature: 1,
//   max_completion_tokens: 8192,
//   top_p: 1,
//   stream: true,
//   reasoning_effort: "medium",
//   stop: null,
// });

export const askGroqAI = async (
  question: string,
  rule: string = "",
  jsonStructure: string = "",
  model: string = "openai/gpt-oss-120b",
) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
                REGLAS DE COMPORTAMIENTO:
                1. Actúa como un experto en el tema que te preguntan.
                2. Responde siempre en español neutro.
                3. Proporciona respuestas claras y concisas.
                4. Si no sabes la respuesta, di que no lo sabes.
                5. No inventes información.
                6. Si la pregunta es ambigua, pide aclaraciones.
                7. Responde en formato JSON con la siguiente estructura:
                ${jsonStructure}
                8. ${rule}
                `,
        },
        {
          role: "user",
          content: question,
        },
      ],
      model: model,
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
      stop: null,
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error creating chat completion:", error);
  }
};

// for await (const chunk of chatCompletion) {
//   process.stdout.write(chunk.choices[0]?.delta?.content || "");
// }
