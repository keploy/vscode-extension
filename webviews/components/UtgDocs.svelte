<script>
  import { onMount } from "svelte";

  const vscode = acquireVsCodeApi();
  let screenshot1 =
    "https://github.com/Sarthak160/goApi/blob/main/codeLens.png?raw=true";
  let screenshot2 =
    "https://github.com/Sarthak160/goApi/blob/main/command.png?raw=true";

  // Initialize variables for total sessions and used sessions
  let totalCall = 10; // This will come from the API response
  let usedCall = 0; // This will come from the API response
  let progressPercentage = 0;
  let isModalOpen = false;
  let activeImage = "";
  let apiResponseElement;
  let ProgressBarVisibility = false;

  function openModal(imageSrc) {
    isModalOpen = true;
    activeImage = imageSrc;
  }

  function closeModal() {
    isModalOpen = false;
    activeImage = "";
  }

  function navigateToConfig() {
    vscode.postMessage({
      type: "navigate",
      value: "Config",
    });
  }

  function navigateToKeploy() {
    vscode.postMessage({
      type: "openLink",
      url: "https://app.keploy.io/signin?take_to_pricing=true", // Replace this with the URL you want to navigate to
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
    apiResponseElement = document.getElementById("apiResponseDisplay");

    // Add event listener for messages from the VSCode extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.type === "apiResponse") {
        const apiResponse = message.value;
        // console.log("Received API response in sidebar:", apiResponse);

        try {
          // If the response is a JSON string
          const parsedResponse = JSON.parse(apiResponse);
          usedCall = parsedResponse.usedCall;
          totalCall = parsedResponse.totalCall;
          // console.log("usedCall", usedCall);
          // console.log("totalCall", totalCall);
          updateProgress(); // Update the progress bar after setting values
        } catch (error) {
            totalCall = 10;
            usedCall = 0;
          console.error("Error parsing API response:", error);
        }

        if (apiResponseElement) {
          // console.log("apiResponseElement is present");
          // apiResponseElement.textContent = `API Response: ${apiResponse}`;
        }
      }

      if(message.type === "signedIn"){
        const signedInResponse = message.value;
          if(signedInResponse == "false"){
              ProgressBarVisibility = false;
              // console.log("Progress Bar is not Visible")
          }else{
            // console.log("Progress Bar is  Visible")
            ProgressBarVisibility = true;
          }
      }
    });
  });
</script>

<div class="container ">

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
     {#if ProgressBarVisibility == true}
    <div class="progress">
      {#if usedCall == totalCall}
      <div class="tooltip-container">
        <div class="tooltip">All sessions used. Upgrade your plan!</div>
          <div class="progress-container">
            <!-- Progress bar width is updated dynamically based on usedCall/totalCall -->
            <div class="progress-bar" style="width: {progressPercentage}%;" on:click={navigateToKeploy} ></div>
          </div>
        </div>
        <span>{usedCall}/{totalCall} sessions</span>
      {:else}
        <div class="progress-container">
          <!-- Progress bar width is updated dynamically based on usedCall/totalCall -->
          <div class="progress-bar" style="width: {progressPercentage}%;"></div>
        </div>
        <span>{usedCall}/{totalCall} sessions</span>
      {/if}
    </div>
    {/if}
    <div class="icon-buttons">

    <a href="https://keploy.io/docs/" target="_blank">
      <button id="openConfig" class="icon-button">
        <span class="docs-icon"></span>
      </button>
    </a>
  
    <a href="https://join.slack.com/t/keploy/shared_invite/zt-2rak7xfq9-KgZDi0qzW350ZO8nzo08VA" target="_blank">
      <button
        id="openConfig"
        class="icon-button"
      >
        <span class="support-icon"></span>
      </button>
    </a>
    </div>
  </div>
  <h1 class="heading">Steps to Setup UTG</h1>

  <div class="steps-container">
    <div class="step-first">
      <div class="step-box">
        <h2 class="step-title">Step 1</h2>
        <p class="step-description">
          Open the desired file that you would like to generate the test cases.<br
          />
          Eg: Click on foo.js if you want to generate for the functions in it.
        </p>
      </div>

      <div class="step-box">
        <h2 class="step-title">Step 2</h2>
        <p class="step-description">
          Click on the <br />
          <span class="FileName">"Generate unit test."</span>
        </p>
        <img
          src={screenshot1}
          alt="Generate unit test"
          class="screenshot"
          on:click={() => openModal(screenshot1)}
        />
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
  {#if isModalOpen}
    <div class="modal-overlay" on:click={closeModal}>
      <div class="modal-content">
        <img src={activeImage} alt="Enlarged Image" class="modal-image" />
      </div>
    </div>
  {/if}
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
    padding: 2rem;
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    overflow-y: auto;
    background-color: #000;
    border: 1px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: inset 0px 4px 36px 1px rgba(255, 145, 77, 0.8),
                inset 0px 4px 4px 0px rgba(255, 153, 0, 0.8);
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
    cursor: pointer;
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

  .tooltip-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.tooltip {
  visibility: hidden;
  width: 200px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 8px;
  position: absolute;
  bottom: 100%; /* Positions tooltip above the progress bar */
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px; /* Space between tooltip and progress bar */
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
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

  
  .complete-button {
    width: 100%;
    padding: 15px;
    margin: 15px 0;
    text-decoration: none;
    color: white;
    background-color: #1a1a1a;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .complete-button:hover {
    scale: 101%;
    background-color: #323131; 
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
    cursor: pointer;
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

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-image {
    max-width: 100%;
    max-height: 100%;
    border-radius: 10px;
  }
  .icon-buttons {
    display: flex;
    flex-direction: row;
    align-items: start;
    padding: 5px;
    justify-content: flex-end; /* Align icons to the left */
  }
 .icon-button {
    display: flex;
    justify-content: start;
    border-radius: 5px;
    color: white;
    background-color: black;
    font-size: 24px;
    height: 40px;
    padding: 0 10px; /* Add padding inside buttons */
    cursor: pointer;
    border: none;
    width: auto;
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
