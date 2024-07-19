<script>
  import { fly } from 'svelte/transition';
  // import { onMount } from 'svelte';
  // import lottie from 'lottie-web';

  // const intro = 60; // final frame of the intro sequence
  // const stopFrame = 180; // final frame of the stop icon appearing
  // const recFrame = 240; // final frame of the record frame appearing (last frame which matches the intro frame to ensure it loops)

  // let animationWindow;
  // let anim;

  // onMount(() => {
  //   anim = lottie.loadAnimation({
  //     container: animationWindow,
  //     renderer: 'svg',
  //     loop: false,
  //     autoplay: true,
  //     // we play the intro immediately
  //     initialSegment: [0, intro],
  //     path: 'https://assets.codepen.io/35984/record_button.json'
  //   });

  //   anim.setSpeed(1.61);

  //   const onClick = (e) => {
  //     if (anim.currentFrame > intro && anim.currentFrame <= stopFrame - intro - 1) {
  //       console.log('playing from stop to record');
  //       anim.playSegments([stopFrame, recFrame], true);
  //     } else {
  //       console.log('playing to stop icon');
  //       anim.playSegments([intro, stopFrame], true);
  //     }
  //   };

  //   // animationWindow.addEventListener('click', onClick);

  //   return () => {
  //     animationWindow.removeEventListener('click', onClick);
  //     anim.destroy();
  //   };
  // });

  let startRecordingButton;
  let startTestingButton;
  let buttonsSection = document.getElementById('buttonsSection');
  let stopRecordingButton;
  let stopTestingButton;
  let isRecording = false;
  let isTesting = false;
  let showSteps = false;
  let selectedIconButton = 1;
  let settingsIcon = document.querySelector('.settings-icon');

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
          if(buttonNumber===3){
            settingsIcon.classList.toggle('open'); // Update icon based on dropdown state

          }
          
    };
    const clearLastTestResults = () => {
        const testSuiteName = document.getElementById('testSuiteName');
        const totalTestCases = document.getElementById('totalTestCases');
        const testCasesPassed = document.getElementById('testCasesPassed');
        const testCasesFailed = document.getElementById('testCasesFailed');
        const errorElement = document.getElementById('errorElement');
        if (testSuiteName) testSuiteName.textContent = '';
        if (totalTestCases) totalTestCases.textContent = '';
        if (testCasesPassed) testCasesPassed.textContent = '';
        if (testCasesFailed) testCasesFailed.textContent = '';
        if (errorElement) errorElement.style.display = 'none';


    };
  //   const triggerAnimation = () => {
  //   if (anim.currentFrame > intro && anim.currentFrame <= stopFrame - intro - 1) {
  //     console.log('playing from stop to record');
  //     anim.playSegments([stopFrame, recFrame], true);
  //   } else {
  //     console.log('playing to stop icon');
  //     anim.playSegments([intro, stopFrame], true);
  //   }
  // };

  const toggleRecording = () => {
    isRecording = !isRecording;
    isTesting = false;
    showSteps = !showSteps;
    // triggerAnimation();
  };

  const toggleTesting = () => {
    isTesting = !isTesting;
    isRecording = false;
    showSteps = !showSteps;
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
      startRecordingButton.style.display = isRecording || isTesting || selectedIconButton!==1 ? 'none' : 'flex';
    }
    if (startTestingButton) {
      startTestingButton.style.display = isRecording || isTesting || selectedIconButton!==1 ? 'none' : 'flex';
    }
    if (buttonsSection) {
      buttonsSection.style.display = isRecording || isTesting || selectedIconButton!==1 ? 'none' : 'flex';
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
        const statusdiv = document.getElementById('statusdiv');
        if (statusdiv) {
            statusdiv.style.display = selectedIconButton===1?  'block' : "none";
        }
        const viewTestLogs = document.getElementById('viewTestLogsButton');
        const viewRecordLogs = document.getElementById('viewRecordLogsButton');
  }

  const recordingSteps = [
    "Step 1: Make sure the database is running",
    "Step 2: The command is present in Config",
    "Step 3: Make API Calls",
    "Step 4: Save Recording"
  ];

  const replayingSteps = [
    "Step 1: Initialize Replay",
    "Step 2: Running Test Cases",
    "Step 3: Execute Replay",
    "Step 4: Verify Test Results"
  ];
</script>

<style>
  .container {
    padding: 16px;
    
    /* font-family: 'Arial', sans-serif; */
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    margin-top: 28px;
    flex-direction: column;
  }
  .icon-buttons {
        display: flex;
        justify-content: space-around;
        border : 2px solid ;
        border-color: var(--vscode-button-secondaryBackground);
        border-radius: 5px;
        padding: 5px;
    }
    .icon-button {
      display: flex;
      justify-content: center;
      align-items: center;
      /* background-color: var(--vscode-button-background); */
      background-color: var(--vscode-button-secondaryBackground);
      border-radius: 5px;
      /* border: 2px solid transparent; */
      color: #FF914D;
      font-size: 24px;
      height: 40px;
      width: 80svw;
      cursor: pointer;
    }
    .icon-button.selected {
      /* border-color: #ff9933; */
      /* background-color: var(--vscode-button-background); */
      background-color: #00163D;

    }
    .icon-button:hover {
      color: #ff9933;
      background-color: #606060;

      /* background-color: #f9f9f9; */
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
  }

  #testResults{
        margin: 20px auto;
        text-align: left;
        display: grid;
        place-items: center;
        grid-template-columns: 1fr;
    }
    #testStatus{
        text-align: center;
        display: none;
    }
    #viewCompleteSummaryButton , #viewTestLogsButton , #viewRecordLogsButton{
        display: none;
        width: 100%;
        margin: 10px auto;
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
    .statusdiv{
        display: grid;
        grid-template-columns: 1fr;
        place-items: center;
    }
    #testResults{
      text-align: left;
    }

  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 16px;
    /* background-color: var(--vscode-button-background); */
    background-color: #00163D;
    color: #ff9933;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s;
    cursor: pointer;
  }


  .card-icon {
    display: flex;
    align-items: center;
    font-size: 24px;
    height: 35px;
    width: 35px;

    margin-right: 16px;
    color: #ff6f61;
  }

  .card-text {
    flex-grow: 1;
    font-size: 20px;
    color: white;
  }

  .card-arrow {
    font-size: 20px;
    color: white;
  }

  .steps {
    margin-top: 16px;
    padding: 16px;
    /* background-color: #e9e9e9; */
    /* color: #b0b0b0; */
    font-size: 16px;
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
    /* #animationWindow {
    width: 400px;
    height: 400px;
  } */

  .icon-button {
    cursor: pointer;
  }
  .tooltip{
    display: none;
    position: absolute;
    /* background-color: var(--vscode-button-background); */
    background-color: #00163D;
    color: white;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    width: 120px;
    z-index: 1;
    font-size: x-small;
    top : 80px;

  }
  .icon-button:hover .tooltip{
    display: block;
  }
  #completeSummaryHr{
    display: none;
  }
</style>

<div class="container baloo-2-custom">
  <div class="icon-buttons">
    <button id="keploycommands" class="icon-button {selectedIconButton === 1 ? 'selected' : ''}" on:click={() => selectButton(1)}>
      <span class="tooltip">Record/Replay</span>
        {#if isRecording}
            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6" opacity="0.3"/><path fill="#FF914D" d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"/></svg>
        {/if}
        <!-- <div bind:this={animationWindow} id="animationWindow"></div> -->
    </button>
    <button id="displayPreviousTestResults" class="icon-button {selectedIconButton === 2 ? 'selected' : ''}" on:click={() => selectButton(2)}>
      <span class="history-icon"></span>
      <span class="tooltip">History</span>
    </button>
    <button id="openConfig" class="icon-button {selectedIconButton === 3 ? 'selected' : ''}" on:click={() => selectButton(3)}>
      <span class="settings-icon"></span> 
      <span class="tooltip">Settings</span>
    </button>
</div>
  <div class="header">
    <div class="heading">
      {#if selectedIconButton === 3}
        <h1>Make changes to keploy config</h1>
      {:else if selectedIconButton === 2}
        <h1>View Previous Test Results</h1>
      {:else}
        <h1>{isRecording ? "Recording Started" : isTesting ? "Testing Started" : "Running Keploy"}</h1>
      {/if}
      <span class="stop-button" on:click={stop} on:keydown={e => e.key === 'Enter' && stop()} id="stopRecordingButton" bind:this={stopRecordingButton} role="button" tabindex="0">
        <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>

      </span>
      <span class="stop-button" on:click={stop} on:keydown={e => e.key === 'Enter' && stop()} id="stopTestingButton" bind:this={stopTestingButton} role="button" tabindex="0">
        <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
      </span>
    </div>    
      <div class="statusdiv" id="statusdiv">
        <h3 id="recordStatus"> </h3>
        <div id="recordedTestCases"></div>
        <h3 id="testStatus"> </h3>
        <div id="testResults"></div>
        <button id="viewCompleteSummaryButton">View Complete Test Summary</button>
        <button id="viewTestLogsButton">View Logs</button>  
        <button id="viewRecordLogsButton">View Logs</button>  
        <hr id="completeSummaryHr" />
      </div>
  </div>
  {#if selectedIconButton === 2}
        <div id="lastTestResults">
            <h3 id="testSuiteName"> </h3>
        </div>
        {/if}

  <div class="section" id="buttonsSection">
    <div class="card" on:click={toggleRecording} on:keydown={e => e.key === 'Enter' && toggleRecording()} tabindex="0" role="button" id="startRecordingButton" bind:this={startRecordingButton}>
      <div class="card-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6" opacity="0.3"/><path fill="#FF914D" d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"/></svg>
      </div>
      <div class="card-text">Record Test Cases</div>
      <div class="card-arrow">➔</div>
    </div>
    <div class="card" on:click={toggleTesting} on:keydown={e => e.key === 'Enter' && toggleTesting()} tabindex="0" role="button" id="startTestingButton" bind:this={startTestingButton}>
      <div class="card-icon replay-icon"></div>
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
