// popup.js

document.addEventListener("DOMContentLoaded", () => {
    const analyzeButton = document.getElementById("analyze-button");
    const settingsIcon = document.getElementById("settings-icon");
    const sendButton = document.getElementById("send-button");
    const userInput = document.getElementById("user-input");
    const chatContainer = document.getElementById("chat-container");
    const settingsModal = document.getElementById("settings-modal");
    const closeButton = document.querySelector(".close-button");
    const saveSettingsButton = document.getElementById("save-settings");
    const apiKeyInput = document.getElementById("api-key");
    const modelSelect = document.getElementById("model-select");
  
    let apiKey = "";
    let model = "gpt-3.5-turbo";
    let conversation = [];
  
    // Add this near the top of the DOMContentLoaded event listener
const themeSelect = document.getElementById("theme-select");
let theme = "light"; // Default theme

// Load saved settings
chrome.storage.sync.get(["apiKey", "model", "theme"], (items) => {
  if (items.apiKey) {
    apiKey = items.apiKey;
    apiKeyInput.value = apiKey;
  }
  if (items.model) {
    model = items.model;
    modelSelect.value = model;
  }
  if (items.theme) {
    theme = items.theme;
    themeSelect.value = theme;
    applyTheme(theme);
  } else {
    // Apply default theme
    applyTheme(theme);
  }
});

// Inside saveSettingsButton event listener
saveSettingsButton.addEventListener("click", () => {
  apiKey = apiKeyInput.value.trim();
  model = modelSelect.value;
  theme = themeSelect.value;

  chrome.storage.sync.set({ apiKey: apiKey, model: model, theme: theme }, () => {
    alert("Settings saved.");
    applyTheme(theme);
    settingsModal.style.display = "none";
  });
});

userInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission
    sendMessage();
  }
});

// Modify the sendButton event listener to use the sendMessage function
sendButton.addEventListener("click", sendMessage);

// Define the sendMessage function
function sendMessage() {
  const question = userInput.value.trim();
  if (question === "") return;

  displayMessage("user", question);
  userInput.value = "";

  conversation.push({ role: "user", content: question });

  chrome.runtime.sendMessage(
    {
      action: "askQuestion",
      question: question,
      apiKey: apiKey,
      model: model,
      conversation: conversation,
    },
    (res) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        alert("Error: " + chrome.runtime.lastError.message);
        return;
      }
      if (res && res.success) {
        const assistantMessage = res.data.choices[0].message.content;
        conversation.push({ role: "assistant", content: assistantMessage });
        displayMessage("assistant", assistantMessage);
      } else {
        alert("Error: " + (res.error || "Unknown error"));
        console.error("Error response:", res.error);
      }
    }
  );
}

// Function to apply the selected theme
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

  
    // Event listeners
    analyzeButton.addEventListener("click", () => {
      console.log("Analyze button clicked.");
      if (!apiKey) {
        alert("Please enter your API Key in settings.");
        return;
      }
  
      // Extract content from the current tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "extractContent" }, (response) => {
          console.log("Content script response:", response);
          if (response && response.content) {
            // Send the extracted content to the background script
            chrome.runtime.sendMessage(
              {
                action: "analyzePage",
                content: response.content,
                apiKey: apiKey,
                model: model,
              },
              (res) => {
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError);
                  alert("Error: " + chrome.runtime.lastError.message);
                  return;
                }
                if (res && res.success) {
                  const assistantMessage = res.data.choices[0].message.content;
                  conversation = [{ role: "assistant", content: assistantMessage }];
                  displayMessage("assistant", assistantMessage);
                } else {
                  alert("Error: " + (res.error || "Unknown error"));
                  console.error("Error response:", res.error);
                }
              }
            );
          } else {
            console.error("No content received from content script.");
          }
        });
      });
    });
  
    sendButton.addEventListener("click", () => {
      const question = userInput.value.trim();
      if (question === "") return;
  
      displayMessage("user", question);
      userInput.value = "";
  
      conversation.push({ role: "user", content: question });
  
      chrome.runtime.sendMessage(
        {
          action: "askQuestion",
          question: question,
          apiKey: apiKey,
          model: model,
          conversation: conversation
        },
        (res) => {
          if (res.success) {
            const assistantMessage = res.data.choices[0].message.content;
            conversation.push({ role: "assistant", content: assistantMessage });
            displayMessage("assistant", assistantMessage);
          } else {
            alert("Error getting response.");
          }
        }
      );
    });
  
    settingsIcon.addEventListener("click", () => {
      settingsModal.style.display = "block";
    });
  
    closeButton.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });
  
    saveSettingsButton.addEventListener("click", () => {
      apiKey = apiKeyInput.value.trim();
      model = modelSelect.value;
  
      chrome.storage.sync.set({ apiKey: apiKey, model: model }, () => {
        alert("Settings saved.");
        settingsModal.style.display = "none";
      });
    });
  
    // Function to display messages in the chat
    function displayMessage(sender, message) {
      const messageWrapper = document.createElement("div");
      messageWrapper.classList.add("message-wrapper", sender);
    
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.textContent = message;
    
      messageWrapper.appendChild(messageDiv);
      chatContainer.appendChild(messageWrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
  