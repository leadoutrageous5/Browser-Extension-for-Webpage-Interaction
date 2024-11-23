// contentScript.js

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "extractContent") {
//       // Extract text content from the webpage
//       let pageText = document.body.innerText;
  
//       // Optionally, you can refine the extraction to remove unnecessary content
//       // For example, exclude scripts, styles, and navigation menus
  
//       sendResponse({ content: pageText });
//     }
//   });
  
//   // Log the extracted content
// if (request.action === "extractContent") {
//     // Extract text content from the webpage
//     let pageText = document.body.innerText;
//     console.log("Extracted page text:", pageText);
  
//     sendResponse({ content: pageText });
//   }
  

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractContent") {
        // Extract text content from the webpage
        let pageText = document.body.innerText;
        pageText = pageText.substring(0, 1000);
        console.log("Extracted page text:", pageText);
      
        sendResponse({ content: pageText });
      }
  });