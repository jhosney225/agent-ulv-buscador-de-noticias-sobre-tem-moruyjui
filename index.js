import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

const conversationHistory = [];

async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8096,
    system: `You are an intelligent news search assistant. Your job is to help users find and discuss news about topics of interest. 
When a user wants to search for news:
1. Ask clarifying questions if needed to understand their interests
2. Provide relevant news summaries about the topic
3. Suggest related topics they might be interested in
4. Help them filter by categories like technology, politics, health, business, entertainment, sports, etc.
5. Offer to search for more specific aspects of their topic of interest

You can discuss current events, trends, and news patterns. Be helpful, accurate, and encourage users to specify their interests clearly.`,
    messages: conversationHistory,
  });

  const assistantMessage =
    response.content[0].type === "text" ? response.content[0].text : "";

  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  return assistantMessage;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🔍 News Search Assistant");
  console.log("========================");
  console.log(
    "Welcome! I'm your news search assistant. I can help you find and discuss news about topics of interest."
  );
  console.log("Type 'exit' to quit, 'clear' to reset conversation.\n");

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      const userInput = input.trim();

      if (userInput.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        return;
      }

      if (userInput.toLowerCase() === "clear") {
        conversationHistory.length = 0;
        console.log("Conversation cleared.\n");
        askQuestion();
        return;
      }

      if (!userInput) {
        askQuestion();
        return;
      }

      const response = await chat(userInput);
      console.log(`\nAssistant: ${response}\n`);
      askQuestion();
    });
  };

  askQuestion();
}

main();