<script>
  import { fly } from 'svelte/transition';

  let startRecordingButton;
  let startTestingButton;
  let stopRecordingButton;
  let stopTestingButton;
  let isRecording = false;
  let isTesting = false;
  let showSteps = false;
  let selectedIconButton = 1;

  const selectButton = (buttonNumber) => {
        console.log('buttonNumber', buttonNumber);
        selectedIconButton = buttonNumber;
        if (buttonNumber !== 2) {
            clearLastTestResults();
        }
        if (buttonNumber!==1) {
            console.log("setting display none")
            startRecordingButton.style.display = 'none';
            startTestingButton.style.display = 'none';
        }
        if(buttonNumber===1){
            startRecordingButton.style.display = 'flex';
            startTestingButton.style.display = 'flex';
          }
          
    };
    const clearLastTestResults = () => {
        const testSuiteName = document.getElementById('testSuiteName');
        const totalTestCases = document.getElementById('totalTestCases');
        const testCasesPassed = document.getElementById('testCasesPassed');
        const testCasesFailed = document.getElementById('testCasesFailed');
        const lastTestResultsDiv = document.getElementById('lastTestResults');
        const errorElement = document.getElementById('errorElement');
        if (testSuiteName) testSuiteName.textContent = '';
        if (totalTestCases) totalTestCases.textContent = '';
        if (testCasesPassed) testCasesPassed.textContent = '';
        if (testCasesFailed) testCasesFailed.textContent = '';
        // if (lastTestResultsDiv) lastTestResultsDiv.innerHTML = '';
        if (errorElement) errorElement.style.display = 'none';


    };
  const toggleRecording = () => {
    isRecording = !isRecording;
    isTesting = false;
    showSteps = !showSteps;
  };

  const toggleTesting = () => {
    isTesting = !isTesting;
    isRecording = false;
    showSteps = !showSteps;
  };

  const stop = () => {
    isRecording = false;
    isTesting = false;
    showSteps = false;
  };


  $: {
    if (startRecordingButton) {
      startRecordingButton.style.display = isRecording || isTesting || selectedIconButton!==1 ? 'none' : 'flex';
    }
    if (startTestingButton) {
      startTestingButton.style.display = isRecording || isTesting || selectedIconButton!==1 ? 'none' : 'flex';
    }
    // if (stopRecordingButton) {
    //   stopRecordingButton.style.display = isRecording ? 'inline' : 'none';
    // }
    // if (stopTestingButton) {
    //   stopTestingButton.style.display = isTesting ? 'inline' : 'none';
    // }
    const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = isRecording || isTesting ? 'block' : 'none';
        }
        const stopRecordingButton = document.getElementById('stopRecordingButton');
        if (stopRecordingButton) {
            stopRecordingButton.style.display = isRecording ? 'inline' : 'none';
        }
        const stopTestingButton = document.getElementById('stopTestingButton');
        if (stopTestingButton) {
            stopTestingButton.style.display = isTesting ? 'inline' : 'none';
        }
  }

  const recordingSteps = [
    "Step 1: Initialize Recording",
    "Step 2: Configure Recording Settings",
    "Step 3: Start Recording",
    "Step 4: Save Recording"
  ];

  const replayingSteps = [
    "Step 1: Initialize Replay",
    "Step 2: Load Test Cases",
    "Step 3: Execute Replay",
    "Step 4: Verify Results"
  ];
</script>

<style>
  .container {
    padding: 16px;
    font-family: 'Arial', sans-serif;
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    flex-direction: column;
  }
  .icon-buttons {
        display: flex;
        justify-content: space-around;
    }
    .icon-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        border: 2px solid transparent;
        color: #ff6600;
        font-size: 24px;
        height: 50px;
        width: 80px;
        cursor: pointer;
    }
    .icon-button.selected {
        border-color: #ff9933;
    }
    .icon-button:hover {
        color: #ff9933;
    }
  .heading {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .header h1 {
    font-size: 24px;
    margin: 0;
  }

  .section {
    margin-bottom: 32px;
  }

  #testResults{
        margin: 20px auto;
        text-align: center;
        display: grid;
        place-items: center;
        grid-template-columns: 1fr;
    }
    #testStatus{
        text-align: center;
        display: none;
    }
    #viewCompleteSummaryButton{
        display: none;
        width: 75%;
        margin: 10px auto;
    }
  #recordStatus {
        display: none;
        text-align: center;
        margin: 20px;
        font-weight: bold;
    }
    #recordedTestCases {
        display: grid;
        grid-template-columns: 1fr;
        place-items: center;
    }
    .statusdiv{
        display: grid;
        grid-template-columns: 1fr;
        place-items: center;
    }
    
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    cursor: pointer;
  }

  .card:hover {
    background-color: #f1f1f1;
  }

  .card-icon {
    display: flex;
    align-items: center;
    font-size: 24px;
    margin-right: 16px;
    color: #ff6f61;
  }

  .card-text {
    flex-grow: 1;
    font-size: 16px;
    color: black;
  }

  .card-arrow {
    font-size: 18px;
    color: #b0b0b0;
  }

  .steps {
    margin-top: 16px;
    padding: 16px;
    /* background-color: #e9e9e9; */
    color: #b0b0b0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .step {
    margin-bottom: 8px;
  }

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
</style>

<div class="container">
  <div class="icon-buttons">
    <button id="keploycommands" class="icon-button {selectedIconButton === 1 ? 'selected' : ''}" on:click={() => selectButton(1)}>
        {#if isRecording}
            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#ff0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#ff0000" d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6" opacity="0.3"/><path fill="#ff0000" d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"/></svg>
        {/if}
    </button>
    <button id="displayPreviousTestResults" class="icon-button {selectedIconButton === 2 ? 'selected' : ''}" on:click={() => selectButton(2)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#00ff11" d="M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29c-.47 2.27-2.31 4.1-4.57 4.57c-3.57.75-6.75-1.7-7.23-5.01a1 1 0 0 0-.98-.85c-.6 0-1.08.53-1 1.13c.62 4.39 4.8 7.64 9.53 6.72c3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5"/></svg>
    </button>
    <button id="openConfig" class="icon-button {selectedIconButton === 3 ? 'selected' : ''}" on:click={() => selectButton(3)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#f56e00" d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6"/></svg>
    </button>
</div>
<hr/>

  <div class="header">
    <div class="heading">
      {#if selectedIconButton === 3}
        <h1>Make changes to keploy config</h1>
      {:else}
        <h1>{isRecording ? "Recording Started" : isTesting ? "Testing Started" : "Running Keploy"}</h1>
      {/if}
      <span class="stop-button" on:click={stop} on:keydown={e => e.key === 'Enter' && stop()} id="stopRecordingButton" bind:this={stopRecordingButton} role="button" tabindex="0">⏹️</span>
      <span class="stop-button" on:click={stop} on:keydown={e => e.key === 'Enter' && stop()} id="stopTestingButton" bind:this={stopTestingButton} role="button" tabindex="0">⏹️</span>
    </div>
      <div class="statusdiv">
        <h3 id="recordStatus"> </h3>
        <div id="recordedTestCases"></div>
        <h3 id="testStatus"> </h3>
        <div id="testResults"></div>
        <button id="viewCompleteSummaryButton">View Complete Test Summary</button>  
      </div>
  </div>

  <div class="section">
    <div class="card" on:click={toggleRecording} on:keydown={e => e.key === 'Enter' && toggleRecording()} tabindex="0" role="button" id="startRecordingButton" bind:this={startRecordingButton}>
      <div class="card-icon">🎥</div>
      <div class="card-text">Record Test Cases</div>
      <div class="card-arrow">➔</div>
    </div>
    <div class="card" on:click={toggleTesting} on:keydown={e => e.key === 'Enter' && toggleTesting()} tabindex="0" role="button" id="startTestingButton" bind:this={startTestingButton}>
      <div class="card-icon">🔄</div>
      <div class="card-text">Replay Test Cases</div>
      <div class="card-arrow">➔</div>
    </div>
  </div>

  {#if showSteps}
    <div class="steps" transition:fly={{ y: 20, duration: 300 }}>
      {#if isRecording}
        {#each recordingSteps as step}
          <div class="step">{step}</div>
        {/each}
      {:else if isTesting}
        {#each replayingSteps as step}
          <div class="step">{step}</div>
        {/each}
      {/if}
    </div>
  {/if}
  <div class="loader" id="loader"></div>
</div>
