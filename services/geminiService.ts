
import { GoogleGenAI, Type } from "@google/genai";
import { BotCommand } from "../types";

// Initialize AI with the direct API key from the environment as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateServerBlueprint = async (theme: string) => {
  // Use gemini-3-flash-preview for structured generation tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed Discord server structure for the theme: "${theme}". 
    Provide categories and channels with matching emojis. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                channels: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "channels"]
            }
          }
        },
        required: ["categories"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || '{}');
};

export const helpCraftWebhookMessage = async (userInput: string) => {
  // Use gemini-3-flash-preview for text formatting and structured output
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Format this into a professional Discord Webhook JSON payload: "${userInput}". 
    Use rich embeds where appropriate.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          username: { type: Type.STRING },
          content: { type: Type.STRING },
          avatar_url: { type: Type.STRING },
          embeds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                color: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["username", "content"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || '{}');
};

export const suggestWebhookScenario = async (userGoal: string) => {
  // Use gemini-3-flash-preview for creative scenario generation
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a professional high-impact Discord Webhook scenario for: "${userGoal}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          username: { type: Type.STRING },
          content: { type: Type.STRING },
          embeds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                color: { type: Type.NUMBER },
                fields: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      inline: { type: Type.BOOLEAN }
                    },
                    required: ["name", "value"]
                  }
                }
              }
            }
          }
        },
        required: ["username", "content"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || '{}');
};

/**
 * Generates full Discord bot code based on requirements.
 * Uses gemini-3-pro-preview for complex coding tasks and provides a thinking budget for better reasoning.
 */
export const generateBotCode = async (commands: BotCommand[], botName: string, antiNukeEnabled: boolean) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate discord.js v14 code for a bot named "${botName}". 
    Anti-nuke features: ${antiNukeEnabled ? 'Enabled' : 'Disabled'}.
    Commands: ${JSON.stringify(commands)}.
    Provide the full index.js file content. No markdown blocks, just the code.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || '';
};

/**
 * Refines user's raw command idea into a structured command object.
 */
export const helpRefineCommand = async (userInput: string) => {
  // Use gemini-3-flash-preview for text refinement tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine this Discord command idea into a structured object with name, description, and response: "${userInput}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          response: { type: Type.STRING }
        },
        required: ["name", "description", "response"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || '{}');
};

/**
 * Provides security insights for specific Discord bot attack vectors.
 * Upgraded to gemini-3-pro-preview for expert security reasoning.
 */
export const getSecurityInsights = async (topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Provide expert security insights and defensive coding patterns for the Discord bot security topic: "${topic}".`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text || '';
};

/**
 * Enhances a bot message with specified tone and optional rich embeds.
 */
export const helpCraftBotMessage = async (message: string, tone: string) => {
  // Use gemini-3-flash-preview for creative writing and tone adjustment
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Enhance this Discord bot message with a "${tone}" tone: "${message}". Include an optional embed structure.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          embed: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              color: { type: Type.NUMBER }
            }
          }
        },
        required: ["content"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || '{}');
};
