chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("Background script received request:", request);

  if (request.action === "analyzePage") {
    const pageContent = request.content;
    const apiKey = request.apiKey;
    const model = request.model;

    console.log("Sending page content to OpenAI API...");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are analyzing a webpage." },
            { role: "user", content: pageContent },
          ],
        }),
      });

      const data = await response.json();
      console.log("OpenAI API response:", data);

      if (response.ok) {
        sendResponse({ success: true, data: data });
      } else {
        console.error("Error from OpenAI API:", data);
        sendResponse({ success: false, error: data.error.message });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep the message channel open for sendResponse
  } else if (request.action === "askQuestion") {
    const question = request.question;
    const apiKey = request.apiKey;
    const model = request.model;
    const conversation = request.conversation;

    console.log("Sending user question to OpenAI API...");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: conversation,
        }),
      });

      const data = await response.json();
      console.log("OpenAI API response:", data);

      if (response.ok) {
        sendResponse({ success: true, data: data });
      } else {
        console.error("Error from OpenAI API:", data);
        sendResponse({ success: false, error: data.error.message });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep the message channel open for sendResponse
  }
});
