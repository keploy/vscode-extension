<script>
  import { onMount } from 'svelte';

  const vscode = acquireVsCodeApi();
  let screenshot1 =
    "https://github.com/Sarthak160/goApi/blob/main/codeLens.png?raw=true";
  let screenshot2 =
    "https://github.com/Sarthak160/goApi/blob/main/command.png?raw=true";

  // Initialize variables for total sessions and used sessions
  let totalCall = 0; // This will come from the API response
  let usedCall = 0; // This will come from the API response
  let progressPercentage = 0;

  let apiResponseElement;

  function navigateToConfig() {
    vscode.postMessage({
      type: "navigate",
      value: "Config",
    });
  }

  // Update the progress percentage based on usedCall/totalCall
  function updateProgress() {
    if (totalCall > 0) {
      progressPercentage = (usedCall / totalCall) * 100;
    } else {
      progressPercentage = 0;
    }
  }

  onMount(() => {
    apiResponseElement = document.getElementById('apiResponseDisplay');

    // Add event listener for messages from the VSCode extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "apiResponse") {
        const apiResponse = message.value;
        console.log("Received API response in sidebar:", apiResponse);

        try {
          // If the response is a JSON string
          const parsedResponse = JSON.parse(apiResponse);
          usedCall = parsedResponse.usedCall;
          totalCall = parsedResponse.totalCall;
          console.log("usedCall" , usedCall);
          console.log("totalCall" , totalCall);
          updateProgress(); // Update the progress bar after setting values
        } catch (error) {
          console.error("Error parsing API response:", error);
        }

        if (apiResponseElement) {
          console.log("apiResponseElement is present");
          // apiResponseElement.textContent = `API Response: ${apiResponse}`;
        }
      }
    });
  });
</script>

<div class="container">
  <h1 class="heading">Steps to Setup UTG</h1>
  
  <!-- Display usedCall/totalCall above the sidebar -->
  <!-- <div class="session-info">
    {usedCall} / {totalCall} sessions used
  </div> -->

  <div id="apiResponseDisplay"></div>
  
  <div class="subTools">
    <div class="back-button" on:click={navigateToConfig}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        class="bi bi-arrow-left"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M15 8a.5.5 0 0 1-.5.5H4.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L4.707 7.5H14.5A.5.5 0 0 1 15 8z"
        />
      </svg>
    </div>

    <!-- Progress bar container -->
    <div class="progress">
      <div class="progress-container">
        <!-- Progress bar width is updated dynamically based on usedCall/totalCall -->
        <div
          class="progress-bar"
          style="width: {progressPercentage}%;"
        ></div>
      </div>
      <span>{usedCall}/{totalCall} sessions</span>
    </div>
  </div>

  <div class="steps-container">
    <div class="step-first">
      <div class="step-box">
        <h2 class="step-title">Step 1</h2>
        <p class="step-description">
          Open the desired file that you would like to generate the test cases.<br />
          Eg: Click on foo.js if you want to generate for the functions in it.
        </p>
      </div>

      <div class="step-box">
        <h2 class="step-title">Step 2</h2>
        <p class="step-description">
          Click on the <br />
          <span class="FileName">"Generate unit test."</span>
        </p>
        <img src={screenshot1} alt="Generate unit test" class="screenshot" />
      </div>
    </div>

    <div class="step-box">
      <h2 class="step-title">Step 3</h2>
      <p class="step-description">
        Your unit tests will get generated for that source file under the
        <span class="FileName">`.test.js`</span> or
        <span class="FileName">`.test.ts`</span>
        file. <br />Continue the same to generate more!
      </p>
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: "Montserrat";
    src:
      url("../../font/Montserrat-VariableFont_wght.ttf") format("woff2"),
      url("../../font/Montserrat-VariableFont_wght.ttf") format("woff");
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: "Montserrat";
    src:
      url("../../font/Montserrat-Italic-VariableFont_wght.ttf") format("woff2"),
      url("../../font/Montserrat-Italic-VariableFont_wght.ttf") format("woff");
    font-weight: 700;
    font-style: italic;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Montserrat", sans-serif;
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background-color: #000;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    overflow-y: auto;
    background-color: #000;
  }

  .heading {
    font-size: 32px;
    margin-bottom: 20px;
    color: #ffffff;
    text-align: center;
  }

  .session-info {
    color: #ffffff;
    font-size: 18px;
    margin-bottom: 10px;
  }

  .subTools {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-bottom: 20px;
    justify-content: space-between;
    align-items: center;
  }

  .progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    max-width: 600px;
    width: 30%;
  }

  .progress-container {
    width: 100%; /* Full width of the parent */
    background-color: #000000; /* Black background */
    border-radius: 5px;
    overflow: hidden;
    border: 2px solid #f77b3e;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .progress-bar {
    height: 7px;
    background-color: #ff914d;
    border-radius: 2px;
  }

  .steps-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    max-width: 800px;
    gap: 15px;
    align-items: center;
  }

  .step-first {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 800px;
    gap: 15px;
    flex-wrap: wrap;
  }

  .step-box {
    background-color: inherit;
    padding: 20px;
    border-radius: 10px;
    width: 100%;
    max-width: 45%;
    text-align: center;
    color: #e0e0e0;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .step-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #ffffff;
  }

  .FileName {
    font-weight: bold;
  }

  .step-description {
    font-size: 16px;
    line-height: 1.5;
  }

  .screenshot {
    width: 100%;
    margin-top: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .back-button {
    color: #ffffff;
    border: none;
    border-radius: 5px;
    background-color: inherit;
    cursor: pointer;
    font-size: 16px;
    align-items: center;
    margin-bottom: 20px;
  }

  @media (max-width: 400px) {
    .subTools {
      flex-direction: column;
      align-items: center;
    }

    .progress {
      width: 100%;
    }

    .step-first {
      flex-direction: column;
      align-items: center;
    }

    .step-box {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
