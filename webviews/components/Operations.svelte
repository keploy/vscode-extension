<script>
  import { fly } from 'svelte/transition';

  let startRecordingButton;
  let startTestingButton;
  let stopRecordingButton;
  let stopTestingButton;
  let isRecording = false;
  let isTesting = false;
  let showSteps = false;

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
      startRecordingButton.style.display = isRecording || isTesting ? 'none' : 'flex';
    }
    if (startTestingButton) {
      startTestingButton.style.display = isRecording || isTesting ? 'none' : 'flex';
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
  }

  .header h1 {
    font-size: 24px;
    margin: 0;
  }

  .section {
    margin-bottom: 32px;
  }

  .section h2 {
    font-size: 18px;
    margin-bottom: 16px;
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
  <div class="header">
    <h1>{isRecording ? "Recording Started" : isTesting ? "Testing Started" : "Running Keploy"}
      <span class="stop-button" on:click={stop} on:keydown={e => e.key === 'Enter' && stop()} id="stopRecordingButton" bind:this={stopRecordingButton} role="button" tabindex="0">⏹️</span>
      <span class="stop-button" on:click={stop} on:keydown={e => e.key === 'Enter' && stop()} id="stopTestingButton" bind:this={stopTestingButton} role="button" tabindex="0">⏹️</span>
      <div>
        <h3 id="recordStatus"> </h3>
        <div id="recordedTestCases">
        </div>
      </div>
    </h1>
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
