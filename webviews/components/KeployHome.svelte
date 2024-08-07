<script>
  import { fly } from 'svelte/transition';
  import '../app.css';
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

    #testResults{
      text-align: left;
    }


  #completeSummaryHr{
    display: none;
  }
  .loader {
        display: none;
    }
</style>



<div class="p-4 font-sans">
  <div class="flex justify-center space-x-2 border-2 border-[var(--vscode-button-secondaryBackground)] rounded-md p-1 mb-6">
    <button 
    id="keploycommands"
    class="flex justify-center items-center rounded-md text-2xl h-10 w-[80vw] cursor-pointer group 
      {selectedIconButton === 1 ? 'bg-secondary-300' : 'bg-[var(--vscode-button-secondaryBackground)] text-[#FF914D]'}
      hover:bg-[#606060]"
    on:click={() => selectButton(1)}
    >
      <span class="hidden group-hover:block absolute top-20 bg-[#00163D] text-white text-center rounded-md p-1 w-30 z-10 text-xs">Record/Replay</span>
      {#if isRecording}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6" opacity="0.3"/><path fill="#FF914D" d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"/></svg>
      {/if}
    </button>
    <button 
      id="displayPreviousTestResults" 
      class="flex justify-center items-center rounded-md text-2xl h-10 w-[80vw] cursor-pointer group 
      {selectedIconButton === 2 ? 'bg-secondary-300' : 'bg-[var(--vscode-button-secondaryBackground)] text-[#FF914D]'}
      hover:bg-[#606060]"
      on:click={() => selectButton(2)}
    >
      <span class="history-icon"></span>
      <span class="hidden group-hover:block absolute top-20 bg-[#00163D] text-white text-center rounded-md p-1 w-30 z-10 text-xs">History</span>
    </button>
    <button 
      id="openConfig" 
      class="flex justify-center items-center rounded-md text-2xl h-10 w-[80vw] cursor-pointer group 
      {selectedIconButton === 3 ? 'bg-secondary-300' : 'bg-[var(--vscode-button-secondaryBackground)] text-[#FF914D]'}
      hover:bg-[#606060]"
      on:click={() => selectButton(3)}
    >
      <span class="settings-icon"></span>
      <span class="hidden group-hover:block absolute top-20 bg-[#00163D] text-white text-center rounded-md p-1 w-30 z-10 text-xs">Settings</span>
    </button>
  </div>

  <div class="flex flex-col items-center justify-center mb-8 mt-7">
    <div class="flex items-center justify-around text-center">
      {#if selectedIconButton === 3}
        <h1 class="text-2xl m-0">Make changes to keploy config</h1>
      {:else if selectedIconButton === 2}
        <h1 class="text-2xl m-0">View Previous Test Results</h1>
      {:else}
        <h1 class="text-2xl m-0">{isRecording ? "Recording Started" : isTesting ? "Testing Started" : "Running Keploy"}</h1>
      {/if}
      <span 
        class="cursor-pointer text-red-500 text-2xl ml-4" 
        on:click={stop} 
        on:keydown={e => e.key === 'Enter' && stop()} 
        id="stopRecordingButton" 
        bind:this={stopRecordingButton} 
        role="button" 
        tabindex="0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
      </span>
      <span 
        class="cursor-pointer text-red-500 text-2xl ml-4" 
        on:click={stop} 
        on:keydown={e => e.key === 'Enter' && stop()} 
        id="stopTestingButton" 
        bind:this={stopTestingButton} 
        role="button" 
        tabindex="0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
      </span>
    </div>    
    <div class="grid place-items-center" id="statusdiv">
      <h3 id="recordStatus" class="text-center font-bold my-5"></h3>
      <div id="recordedTestCases" class="grid grid-cols-1 place-items-center"></div>
      <h3 id="testStatus" class="text-center"></h3>
      <div id="testResults" class="grid grid-cols-1 place-items-center my-5 text-left"></div>
      <button id="viewCompleteSummaryButton" class="w-full my-2.5">View Complete Test Summary</button>
      <button id="viewTestLogsButton" class="w-full my-2.5 bg-[#00163D] p-4 mb-4 shadow-md text-white text-xl">View Logs</button>  
      <button id="viewRecordLogsButton" class="w-full my-2.5 bg-[#00163D] p-4 mb-4 shadow-md text-white text-xl">View Logs</button>  
      <hr id="completeSummaryHr" class="hidden" />
    </div>
  </div>

  {#if selectedIconButton === 2}
    <div id="lastTestResults">
      <h3 id="testSuiteName"></h3>
    </div>
  {/if}

  <div class="mb-8" id="buttonsSection">
    <div 
      class="flex items-center justify-between p-4 mb-4 bg-[#00163D] text-[#ff9933] rounded-lg shadow-md transition-colors duration-300 cursor-pointer"
      on:click={toggleRecording} 
      on:keydown={e => e.key === 'Enter' && toggleRecording()} 
      tabindex="0" 
      role="button" 
      id="startRecordingButton" 
      bind:this={startRecordingButton}
    >
      <div class="flex items-center text-2xl h-9 w-9 mr-4 text-[#ff6f61]">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" viewBox="0 0 24 24"><path fill="#FF914D" d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6" opacity="0.3"/><path fill="#FF914D" d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"/></svg>
      </div>
      <div class="flex-grow text-xl text-white">Record Test Cases</div>
      <div class="text-xl text-white">➔</div>
    </div>
    <div 
      class="flex items-center justify-between p-4 mb-4 bg-[#00163D] text-[#ff9933] rounded-lg shadow-md transition-colors duration-300 cursor-pointer"
      on:click={toggleTesting} 
      on:keydown={e => e.key === 'Enter' && toggleTesting()} 
      tabindex="0" 
      role="button" 
      id="startTestingButton" 
      bind:this={startTestingButton}
    >
      <div class="flex items-center text-2xl h-9 w-9 mr-4 text-[#ff6f61] replay-icon"></div>
      <div class="flex-grow text-xl text-white">Replay Test Cases</div>
      <div class="text-xl text-white">➔</div>
    </div>
  </div>

  {#if showSteps}
    <div class="mt-4 p-4 rounded-lg shadow-md" transition:fly={{ y: 20, duration: 300 }}>
      {#if isRecording}
        {#each recordingSteps as step}
          <div class="mb-2">{step}</div>
        {/each}
      {:else if isTesting}
        {#each replayingSteps as step}
          <div class="mb-2">{step}</div>
        {/each}
      {/if}
    </div>
  {/if}
  <div class="border-4 border-transparent border-l-primary-300 rounded-full w-10 h-10 animate-spin mx-auto mb-2.5" id="loader"></div>
</div>