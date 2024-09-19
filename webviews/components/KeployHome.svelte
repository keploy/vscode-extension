<script>
  import { fly } from "svelte/transition";
  // import { onMount } from 'svelte';
  // import lottie from 'lottie-web';
  // let navigateToConfig = false;
  let startRecordingButton;
  let startTestingButton;
  let buttonsSection = document.getElementById("buttonsSection");
  let stopRecordingButton;
  let stopTestingButton;
  let isRecording = false;
  let isTesting = false;
  let showSteps = false;
  let selectedIconButton = 1;
  let settingsIcon = document.querySelector(".settings-icon");
  let currentStep = 1;
  let backConfigButton;
  
  function goToNextStep(step) {
    currentStep = step;
  }

  function resetCurrentStep() {
    currentStep = 1;
  }

  const selectButton = (buttonNumber) => {
    console.log("buttonNumber", buttonNumber);
    selectedIconButton = buttonNumber;

    if (buttonNumber !== 2) {
      clearLastTestResults();
    }
    if (buttonNumber !== 1) {
      console.log("setting display none");
      startRecordingButton.style.display = "none";
      startTestingButton.style.display = "none";
      isRecording = false;
      isTesting = false;
      showSteps = false;
    }
    if (buttonNumber === 1) {
      startRecordingButton.style.display = "flex";
      startTestingButton.style.display = "flex";
    }
    if (buttonNumber === 3) {
      settingsIcon.classList.toggle("open"); // Update icon based on dropdown state
    }
  };
  function navigateToConfig() {
     if(isRecording || isTesting){
      isRecording = false;
      isTesting = false;
      showSteps = false;
   
     }
  }

  const clearLastTestResults = () => {
    const testSuiteName = document.getElementById("testSuiteName");
    const totalTestCases = document.getElementById("totalTestCases");
    const testCasesPassed = document.getElementById("testCasesPassed");
    const testCasesFailed = document.getElementById("testCasesFailed");
    const errorElement = document.getElementById("errorElement");
    if (testSuiteName) testSuiteName.textContent = "";
    if (totalTestCases) totalTestCases.textContent = "";
    if (testCasesPassed) testCasesPassed.textContent = "";
    if (testCasesFailed) testCasesFailed.textContent = "";
    if (errorElement) errorElement.style.display = "none";
  };

  function handleStepClick(stepNumber) {
    if (stepNumber == 4) {
      console.log("here in the handlestepclick")
      const event = new CustomEvent('ciCdStepClick', {
        detail: { step: 'ci-cd-setup' },
      });
      goToNextStep(5);
      document.dispatchEvent(event); // Dispatch the event to be captured in sidebar.js
    }else if(stepNumber  == 5){
      console.log("here in the last step")
      const event = new CustomEvent('addUsersClick', {
        detail: { step: 'add-users' },
      });
      document.dispatchEvent(event);
    }
  }
  const toggleRecording = () => {
    isRecording = !isRecording;
    isTesting = false;
    showSteps = !showSteps;
    if (isRecording) {  
      goToNextStep(2);
    } else {
      goToNextStep(1);
    }
    // triggerAnimation();
  };

  const toggleTesting = () => {
    isTesting = !isTesting;
    isRecording = false;
    showSteps = !showSteps;
    if (isTesting) {
      goToNextStep(4);
    } else {
      goToNextStep(2);
    }
    // triggerAnimation();
  };

  const stop = () => {
    isRecording = false;
    isTesting = false;
    showSteps = false;
    // triggerAnimation();
  };

  $: {
    if (startRecordingButton) {
      startRecordingButton.style.display =
        isRecording || isTesting || selectedIconButton !== 1 ? "none" : "flex";
    }
    if (startTestingButton) {
      startTestingButton.style.display =
        isRecording || isTesting || selectedIconButton !== 1 ? "none" : "flex";
    }
    if (buttonsSection) {
      buttonsSection.style.display =
        isRecording || isTesting || selectedIconButton !== 1 ? "none" : "flex";
    }
    // if (stopRecordingButton) {
    //   stopRecordingButton.style.display = isRecording ? 'inline' : 'none';
    // }
    // if (stopTestingButton) {
    //   stopTestingButton.style.display = isTesting ? 'inline' : 'none';
    // }
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.display = isRecording || isTesting ? "block" : "none";
    }
    const stopRecordingButton = document.getElementById("stopRecordingButton");
    if (stopRecordingButton) {
      stopRecordingButton.style.display = isRecording ? "inline" : "none";
    }
    const stopTestingButton = document.getElementById("stopTestingButton");
    if (stopTestingButton) {
      stopTestingButton.style.display = isTesting ? "inline" : "none";
    }

    if (backConfigButton) {
    // Perform any operations on backConfigButton, such as adding event listeners or styling.
    backConfigButton.style.display = selectedIconButton != 2 && selectedIconButton != 3 ? "block" : "none";
  }

    const statusdiv = document.getElementById("statusdiv");
    if (statusdiv) {
      statusdiv.style.display = selectedIconButton === 1 ? "block" : "none";
    }
    const viewTestLogs = document.getElementById("viewTestLogsButton");
    const viewRecordLogs = document.getElementById("viewRecordLogsButton");
  }

  const recordingSteps = [
    "Step 1: Make sure the database is running",
    "Step 2: The command is present in Config",
    "Step 3: Make API Calls",
    "Step 4: Save Recording",
  ];

  const replayingSteps = [
    "Step 1: Initialize Replay",
    "Step 2: Running Test Cases",
    "Step 3: Execute Replay",
    "Step 4: Verify Test Results",
  ];
</script>

<div class="container">
  <h1 class="main-heading">Running integration tests</h1>
  <div>
  <h1 id="selectedIconNumber" class="selectedIconClass">{selectedIconButton}</h1> 
  <button class="back-button"  id="backConfig" on:click={navigateToConfig} >
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
    </svg></button
  >

</div>
  <div class="container-card">
    <div class="icon-buttons">
      <!-- <button
        id="keploycommands"
        class="icon-button {selectedIconButton === 1 ? 'selected' : ''}"
        on:click={() => selectButton(1)}
      >
        <span class="tooltip">Record/Replay</span>
        {#if isRecording}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35px"
            height="35px"
            viewBox="0 0 24 24"
            ><path
              fill="#FF914D"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"
            /></svg
          >
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35px"
            height="35px"
            viewBox="0 0 24 24"
            ><path
              fill="#FF914D"
              d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6"
              opacity="0.3"
            /><path
              fill="#FF914D"
              d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"
            /></svg
          >
        {/if}
        <!-- <div bind:this={animationWindow} id="animationWindow"></div> -->
      <!-- </button> -->
      <button
        id="displayPreviousTestResults"
        class="icon-button {selectedIconButton === 2 ? 'selected' : ''}"
        on:click={() => selectButton(2)}
      >
        <span class="history-icon"></span>
      </button>
      <button
        id="openConfig"
        class="icon-button {selectedIconButton === 3 ? 'selected' : ''}"
        on:click={() => selectButton(3)}
      >
        <span class="settings-icon"></span>
      </button>
    </div>
    <div class="header">
      <div class="heading"> 
        {#if selectedIconButton === 3}
          <h1>Make changes to keploy config</h1>
        {:else if selectedIconButton === 2}
          <h1>View Previous Test Results</h1>
        {:else}
          <h1>
            {#if isRecording}
              Recording Started
            {:else if isTesting}
              Testing Started
            {:else}
              <span class="highlight">Increase</span> your Test coverage now!!
            {/if}
          </h1>
        {/if}
        <span
          class="stop-button"
          on:click={stop}
          on:keydown={(e) => e.key === "Enter" && stop()}
          id="stopRecordingButton"
          bind:this={stopRecordingButton}
          role="button"
          tabindex="0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35px"
            height="35px"
            viewBox="0 0 24 24"
            ><path
              fill="#FF914D"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"
            /></svg
          >
        </span>
        <span
          class="stop-button"
          on:click={stop}
          on:keydown={(e) => e.key === "Enter" && stop()}
          id="stopTestingButton"
          bind:this={stopTestingButton}
          role="button"
          tabindex="0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35px"
            height="35px"
            viewBox="0 0 24 24"
            ><path
              fill="#FF914D"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"
            /></svg
          >
        </span>
      </div>
      <div class="statusdiv" id="statusdiv">
        <h3 id="recordStatus"></h3>
        <div id="recordedTestCases"></div>
        <h3 id="testStatus"></h3>
        <div id="testResults"></div>
        <button id="viewCompleteSummaryButton"
          >View Complete Test Summary</button
        >
        <button id="viewTestLogsButton">View Test Logs</button>
        <button id="viewRecordLogsButton">View Record Logs</button>
        <hr id="completeSummaryHr" />
      </div>
    </div>
    {#if selectedIconButton === 2}
      <div id="lastTestResults">
        <h3 id="testSuiteName"></h3>
      </div>
    {/if}

    <div class="section" id="buttonsSection">
      <div
        class="card"
        on:click={toggleRecording}
        on:keydown={(e) => e.key === "Enter" && toggleRecording()}
        tabindex="0"
        role="button"
        id="startRecordingButton"
        bind:this={startRecordingButton}
      >
        <div class="card-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35px"
            height="35px"
            viewBox="0 0 24 24"
            ><path
              fill="#FF914D"
              d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6"
              opacity="0.3"
            /><path
              fill="#FF914D"
              d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"
            /></svg
          >
        </div>
        <div class="card-text">Record Test Cases</div>
      </div>
      <div
        class="card"
        on:click={toggleTesting}
        on:keydown={(e) => e.key === "Enter" && toggleTesting()}
        tabindex="0"
        role="button"
        id="startTestingButton"
        bind:this={startTestingButton}
      >
        <div class="card-icon replay-icon"></div>
        <div class="card-text">Replay Test Cases</div>
      </div>
    </div>

    {#if showSteps}
      <div class="steps" transition:fly={{ y: 20, duration: 300 }}>
        {#if isRecording}
          {#each recordingSteps as step}
            <div class="step-recording">{step}</div>
          {/each}
        {:else if isTesting}
          {#each replayingSteps as step}
            <div class="step-testing">{step}</div>
          {/each}
        {/if}
      </div>
    {/if}
    <div class="loader" id="loader"></div>
    <div class="stepper-container">
      <div class="step-line"></div>
      <div class="step">
        <span
          class="step-number {currentStep >= 1
            ? 'activeStep'
            : 'InactiveStep'} ">1. Setup Configuration</span
        >
        <div
          class="step-circle {currentStep >= 1 ? 'active' : 'inactive'} "
        ></div>
      </div>
      <div class="step">
        <div
          class="step-circle {currentStep >= 2 ? 'active' : 'inactive'} "
        ></div>
        <span
          class="step-number bottom {currentStep >= 2
            ? 'activeStep'
            : 'InactiveStep'}">2. Record Test</span
        >
      </div>
      <div class="step">
        <!-- <div class="step-line"></div> -->
        <span
          class="step-number {currentStep >= 3 ? 'activeStep' : 'InactiveStep'}"
          >3. Replay Test</span
        >
        <div
          class="step-circle {currentStep >= 3 ? 'active' : 'inactive'}"
        ></div>
      </div>
      <div class="step">
        <!-- <div class="step-line"></div> -->
        <div
          class="step-circle {currentStep >= 4 ? 'active' : 'inactive'}"
        ></div>
        <span
          class="step-number bottom {currentStep >= 4
            ? 'activeStep pointer'
            : 'InactiveStep'}" on:click={handleStepClick(currentStep)}>4. CI/CD setup</span
        >
      </div>
      <div class="step">
        <span
          class="step-number {currentStep >= 5 ? 'activeStep pointer' : 'InactiveStep'}"
          on:click={handleStepClick(currentStep)}
          >5. Add users</span
        >
        <div
          class="step-circle {currentStep >= 5 ? 'active' : 'inactive'} "
        ></div>
      </div>
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
    font-family: "Montserrat", sans-serif; /* Use Montserrat here */
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background-color: #000;
  }

  .container {
    padding: 16px;
    height: 100vh;
    background-color: black;
    display: flex;
    flex-direction: column;
    font-family: "Montserrat", sans-serif; /* Use Montserrat here */

    /* font-family: 'Arial', sans-serif; */
  }

  .selectedIconClass{
    display: none;
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 30px;
    flex-direction: column;
  }
  .main-heading {
    text-align: center;
  }

  .pointer{
    cursor: pointer;
  }

  .container-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    height: 100%;
    padding: 2rem;
    background-color: black;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .icon-buttons {
    display: flex;
    flex-direction: row;
    align-items: start;
    padding: 5px;
    width: 100%; /* Full width of the container */
    justify-content: flex-start; /* Align icons to the left */
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

  .heading {
    display: flex;
    align-items: center;
    justify-content: space-around;
    text-align: center;
  }

  .header h1 {
    font-size: 24px;
    margin: 0;
  }

  .section {
    margin-bottom: 32px;
    width: 70%;
  }

  .highlight {
    background: linear-gradient(90deg, #ffb388 0%, #ff5c00 50%, #f76b1c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  #testResults {
    margin: 20px auto;
    text-align: left;
    display: grid;
    place-items: center;
    grid-template-columns: 1fr;
  }
  #testStatus {
    text-align: center;
    display: none;
  }
  #viewCompleteSummaryButton,
  #viewTestLogsButton,
  #viewRecordLogsButton {
    display: none;
    width: 100%;
    margin: 10px auto;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: black;

    color: white;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
    cursor: pointer;
  }
  #recordStatus {
    display: none;
    text-align: center;
    margin: 20px;
    font-weight: bold;
  }
  #recordedTestCases {
    display: none;
    grid-template-columns: 1fr;
    place-items: center;
  }
  .statusdiv {
    display: grid;
    grid-template-columns: 1fr;
    place-items: center;
  }
  #testResults {
    text-align: left;
  }

  /* Back Button Style */
  .back-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 5px;
    width: auto;
    cursor: pointer;
    font-size: 16px;
    text-align: start;
  }

  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 16px;
    background-color: black;
    color: white;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
    cursor: pointer;
  }

  .card-icon {
    display: flex;
    align-items: center;
    font-size: 24px;
    height: 35px;
    width: 35px;

    margin-right: 16px;
    color: white;
  }

  .card-text {
    flex-grow: 1;
    font-size: 20px;
    text-align: center;
    color: white;
  }

  .steps {
    margin-top: 16px;
    padding: 16px;
    text-align: start;
    /* background-color: #e9e9e9; */
    /* color: #b0b0b0; */
    font-size: 16px;
    border-radius: 8px;
    padding-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* .step {
    margin-bottom: 8px;
  } */

  .stop-button {
    display: inline;
    cursor: pointer;
    color: red;
    font-size: 24px;
    margin-left: 16px;
  }
  .loader {
    display: none;
  }
  /* #animationWindow {
    width: 400px;
    height: 400px;
  } */

  #completeSummaryHr {
    display: none;
  }

  button:focus {
    outline: none; /* Remove the blue border on focus for all buttons */
  }
  button {
    outline: none; /* Remove the blue border on focus for all buttons */
  }

  /* Back Arrow SVG Style */
  .back-arrow {
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    background-color: inherit;
    cursor: pointer;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: start;
  }

  .container {
    padding: 16px;
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 28px;
    flex-direction: column;
  }

  .stepper-container {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-top: auto;
    z-index: 1;
    scale: 90%;
    position: relative;
    margin-bottom: 20px;
  }

  .step:nth-of-type(2) div {
    margin-right: auto;
  }

  .step:last-child {
    align-items: flex-end; /* Align last circle to the right */
    text-align: right;
  }

  .step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1rem;
    color: white;
    z-index: 2;
    flex: 1; /* Allows the steps to take equal space */
  }

  .activeStep {
    color: white;
  }

  .InactiveStep {
    color: grey;
  }

  .step-number {
    position: absolute;
    top: -2.5rem; /* Adjust to position text above the circle */
    font-size: 0.9rem;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis; /* Add ellipsis if text is too long */
    padding: 0 0.5rem;
  }

  .step-number.bottom {
    top: 2.5rem; /* Adjust to position text below the circle */
  }

  .step-circle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: black;
    position: relative;
    z-index: 3;
  }

  .step-circle.active {
    border: 2px solid #ff914d;
  }

  .step-circle.inactive {
    border: 2px solid #969390;
  }

  .step-circle.active::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    background-color: #ff914d;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .step-circle.inactive::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    background-color: #969390;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .step-line {
    width: 100%;
    height: 2px;
    background-color: #ff914d;
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 1;
  }

  .step:not(:first-child) .step-line {
    left: 0;
  }

  .step:not(:last-child) .step-line::after {
    content: "";
    width: 100%;
    height: 2px;
    background-color: #ff914d;
    position: absolute;
    top: 0;
    left: 100%;
  }
</style>
