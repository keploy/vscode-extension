<script>
  import { fly } from "svelte/transition";
  import { onMount } from 'svelte';
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
   // let delay = 5;
  // let apiTimeout = 5;
  let appName = '';
  let command = '';
  let containerName = ''
  let networkName = 'default';
  let delay = 5;
  let apiTimeout = 5;
  let mongoPassword = '';
  
  // import lottie from 'lottie-web';
  // let navigateToConfig = false;
   // On mount, request config and set up listeners
   onMount(() => {
    // Dispatch a custom event to request the Keploy config
    setTimeout(() => {
    const getConfigEvent = new CustomEvent('getKeployConfigForSvelte');
    document.dispatchEvent(getConfigEvent);
    console.log("Dispatched getKeployConfigForSvelte event");
  }, 100); // 100ms delay
    console.log("starting the onMount for the KeployConfig");

    // Listen for the response from sidebar.js
    window.addEventListener('message', event => {
      const message = event.data;
      
      if (message.type === 'keployConfig') {
        console.log("In the svelete directly taking values ;)" ,message );
        const config = message.config;
        
        // Set the form fields with the values from the config
        appName = config.appName || '';
        command = config.command || '';
        containerName = config.containerName || '';
        networkName = config.networkName || 'default';
        delay = config.test?.delay || 5;
        apiTimeout = config.test?.apiTimeout || 5;
        mongoPassword = config.test?.mongoPassword || '';
      }
    });

    // Initialize DOM elements
    
    // Listen for custom events from sidebar.js
    

    // ... listen for other custom events as needed
  });

  function validateInput(event) {
    let value = event.target.value;

    // Check if the input contains anything other than digits
    if (/\D/.test(value) || value < 0 || isNaN(value)) {
      // Remove any non-digit characters and ensure the value is non-negative
      event.target.value = value.replace(/\D/g, '') || 0;
    }
  }

  function saveSettings() {
    // Dispatch a custom event with the updated config
    const updateConfigEvent = new CustomEvent('updateKeployConfig', {
      detail: {
        config: {
          appName,
          command,
          containerName,
          networkName,
          test: {
            delay,
            apiTimeout,
            mongoPassword,
          },
        },
      },
    });
    document.dispatchEvent(updateConfigEvent);
  }



  let progressBarHide;
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
    //below code's logic already written in sidebar.js
  //   if (selectedIconButton === 3) {
  //   selectedIconButton = 1; // Set to the default view
  //   return;
  // }

     if(isRecording || isTesting){
      isRecording = false;
      isTesting = false;
      showSteps = false;
      return
     }
    //  vscode.postMessage({
    //   type: "navigate",
    //   value: "Config",
    // });
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
  <div>
  <h1 id="selectedIconNumber" class="selectedIconClass">{selectedIconButton}</h1> 


</div>
  <div class="container-card">
    <div class="header-button">
    <button class="back-button"  id="backConfig" on:click={navigateToConfig} >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
      <button
        id="openConfig"
        class="icon-button {selectedIconButton === 3 ? 'selected' : ''}"
        on:click={() => selectButton(3)}
      >
        <span class="settings-icon"></span>
      </button>
   
    </div>
  </div>
    <div class="header">
      <div class="heading"> 
        {#if selectedIconButton === 3}
 <div class="settings-form">
  <!-- <h1>Make changes to Keploy config</h1> -->

  <!-- App Name -->
  <div class="form-group">
    <label for="appName">App Name:</label>
    <input id="appName" type="text" bind:value={appName} />
  </div>

  <!-- Command -->
  <div class="form-group">
    <label for="command">Command:</label>
    <input id="command" type="text" bind:value={command} />
  </div>

  <!-- Container Name -->
  <div class="form-group">
    <label for="containerName">Container Name:</label>
    <input id="containerName" type="text" bind:value={containerName} />
  </div>

  <!-- Network Name -->
  <div class="form-group">
    <label for="networkName">Network Name:</label>
    <input id="networkName" type="text" bind:value={networkName} />
  </div>

  <!-- Delay -->
  <div class="form-group">
    <label for="delay">Test Delay (seconds):</label>
    <input id="delay" type="number" bind:value={delay} min="0" on:input={validateInput} />
  </div>

  <!-- API Timeout -->
  <div class="form-group">
    <label for="apiTimeout">API Timeout (seconds):</label>
    <input id="apiTimeout" type="number" bind:value={apiTimeout} min="0" on:input={validateInput} />
  </div>

  <!-- Mongo Password -->
  <div class="form-group">
    <label for="mongoPassword">Mongo Password:</label>
    <input id="mongoPassword" type="text" bind:value={mongoPassword} />
  </div>

  <!-- Save button -->
  <div
  class="card"
  on:click={saveSettings}
>
  <div class="card-text">Save Config</div>
</div>

</div>

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
    
          <div class="card-icon record-icon"></div>
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
      <div class="log-buttons-container">
        <button id="viewTestLogsButton">View Test Logs</button>
        <button id="viewRecordLogsButton">View Record Logs</button>
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
    <div class="stepper-container" id="progress-stepper">
      <div class="step-line"></div>
      <div class="step">
        <span
          class="step-number {currentStep >= 1
            ? 'activeStep'
            : 'InactiveStep'} ">
               <span class="text">Setup Configuration</span>
               <span class="timeline-icon">
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">

  <g id="SVGRepo_bgCarrier" stroke-width="0"/>
  
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
  
  <g id="SVGRepo_iconCarrier">
  
  <path d="M11.969 14a1.237 1.237 0 0 0 .044.863l.061.137H8v-1zm5.183-3.25h1.65a1.216 1.216 0 0 1 .198.03V10H8v1h8.412a1.243 1.243 0 0 1 .74-.25zM19 6H8v1h11zM4 13h3v3H4zm1 2h1v-1H5zm5.75 3H2V3h19v9.077l.135-.06a1.1 1.1 0 0 1 .865-.039V2H1v17h9.773a1.201 1.201 0 0 1-.023-.152zM7 8H4V5h3zM6 6H5v1h1zm1 6H4V9h3zm-1-2H5v1h1zm14 8a2 2 0 1 1-2-2 2 2 0 0 1 2 2zm-1 0a1 1 0 1 0-1 1 1 1 0 0 0 1-1zm3.414 1.392l-.296.628.724 1.624-1.162 1.17-1.543-.71-.653.236-.636 1.66h-1.65l-.59-1.586-.628-.295-1.627.727-1.167-1.166.71-1.543-.236-.653-1.66-.636v-1.65l1.586-.59.295-.628-.727-1.627 1.166-1.167 1.543.71.653-.236.636-1.66h1.65l.59 1.586.628.296 1.624-.724 1.166 1.167-.705 1.538.235.653 1.66.636v1.65zm-1.277.523l.544-1.158 1.319-.49v-.582l-1.427-.548-.434-1.204.585-1.28-.412-.412-1.397.622-1.158-.544-.49-1.319h-.582l-.548 1.427-1.206.434-1.283-.59-.41.411.626 1.4-.545 1.161-1.319.49v.582l1.427.548.434 1.206-.59 1.283.411.41 1.4-.626 1.161.545.49 1.319h.582l.548-1.427 1.206-.434 1.28.588.411-.413z"/>
  
  <path fill="none" d="M0 0h24v24H0z"/>
  
  </g>
  
  </svg>

            
              </span>
         </span>
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
            : 'InactiveStep'}">
                           <span class="text">Record Test</span>
                           <span class="timeline-icon">
                            <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M400 733.333C584.095 733.333 733.333 584.095 733.333 400C733.333 215.905 584.095 66.6667 400 66.6667C215.905 66.6667 66.6665 215.905 66.6665 400C66.6665 584.095 215.905 733.333 400 733.333Z" stroke="currentColor" stroke-width="50"/>
                              <path d="M400 533.333C473.638 533.333 533.333 473.638 533.333 400C533.333 326.362 473.638 266.667 400 266.667C326.362 266.667 266.667 326.362 266.667 400C266.667 473.638 326.362 533.333 400 533.333Z" stroke="currentColor" stroke-width="50"/>
                              </svg>
                              
                          </span>
                     </span>
      </div>
      <div class="step">
        <!-- <div class="step-line"></div> -->
        <span
          class="step-number {currentStep >= 3 ? 'activeStep' : 'InactiveStep'}"
          >
          <span class="text">Replay Test</span>
          <span class="timeline-icon">
            <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M400 691.667C335.933 691.58 274.515 666.09 229.213 620.787C183.911 575.483 158.422 514.067 158.333 450C158.333 443.37 160.967 437.01 165.656 432.323C170.344 427.633 176.703 425 183.333 425C189.964 425 196.323 427.633 201.011 432.323C205.7 437.01 208.333 443.37 208.333 450C208.333 487.907 219.574 524.963 240.635 556.483C261.696 588.003 291.63 612.57 326.652 627.077C361.673 641.583 400.214 645.38 437.393 637.983C474.573 630.59 508.724 612.333 535.53 585.53C562.334 558.723 580.59 524.573 587.983 487.393C595.38 450.213 591.583 411.673 577.077 376.653C562.57 341.63 538.003 311.696 506.483 290.635C474.963 269.574 437.907 258.333 400 258.333H316.667C310.036 258.333 303.678 255.699 298.989 251.011C294.301 246.323 291.667 239.964 291.667 233.333C291.667 226.703 294.301 220.344 298.989 215.656C303.678 210.967 310.036 208.333 316.667 208.333H400C464.093 208.333 525.563 233.795 570.883 279.116C616.207 324.437 641.667 385.907 641.667 450C641.667 514.093 616.207 575.563 570.883 620.883C525.563 666.207 464.093 691.667 400 691.667Z" fill="currentColor"/>
              <path d="M400 358.333C396.717 358.35 393.46 357.71 390.427 356.45C387.393 355.19 384.64 353.337 382.333 351L282.333 251.001C277.652 246.314 275.022 239.959 275.022 233.334C275.022 226.709 277.652 220.355 282.333 215.668L382.333 115.668C384.623 113.211 387.383 111.241 390.45 109.875C393.517 108.509 396.827 107.774 400.183 107.715C403.54 107.655 406.873 108.273 409.987 109.53C413.1 110.788 415.927 112.659 418.3 115.033C420.677 117.407 422.547 120.235 423.803 123.348C425.06 126.461 425.68 129.795 425.62 133.152C425.56 136.509 424.827 139.819 423.46 142.886C422.093 145.952 420.123 148.712 417.667 151.001L335.333 233.334L417.667 315.668C422.347 320.355 424.977 326.709 424.977 333.333C424.977 339.96 422.347 346.313 417.667 351C415.36 353.337 412.607 355.19 409.573 356.45C406.54 357.71 403.283 358.35 400 358.333Z" fill="currentColor"/>
              </svg>
         </span>
    </span>
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
            : 'InactiveStep'}" on:click={handleStepClick(currentStep)}> 
                      <span class="text">CI/CD setup</span>
                      <span class="timeline-icon">
                       <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M522.889 440.222C510.556 440.259 498.257 438.917 486.222 436.222C493.237 451.381 498.602 467.25 502.222 483.556C508.889 483.556 515.778 483.556 522.889 483.556C545.551 483.52 568.06 479.844 589.556 472.667L568.889 432.444C553.984 437.133 538.506 439.75 522.889 440.222Z" fill="currentColor"/>
                         <path d="M408 397.111L400 388.667C382.65 371.704 369.269 351.111 360.816 328.366C352.364 305.621 349.05 281.288 351.111 257.111C353.381 224.728 365.3 193.767 385.333 168.222L383.556 200C383.533 205.563 385.598 210.932 389.342 215.047C393.086 219.161 398.237 221.722 403.778 222.222H405.778C411.341 222.245 416.71 220.18 420.824 216.436C424.939 212.692 427.499 207.54 428 202L435.556 111.111C435.822 107.892 435.383 104.654 434.27 101.622C433.157 98.5905 431.397 95.8377 429.111 93.5556C426.679 91.5851 423.857 90.1507 420.832 89.3465C417.807 88.5423 414.645 88.3864 411.556 88.8889L320.667 96.6667C314.773 97.1676 309.32 99.9894 305.506 104.511C301.693 109.033 299.832 114.884 300.333 120.778C300.834 126.671 303.656 132.125 308.178 135.938C312.699 139.751 318.551 141.612 324.444 141.111L353.111 138.667C326.117 172.444 310.208 213.731 307.556 256.889C305.259 286.466 309.371 316.19 319.611 344.032C329.851 371.875 345.977 397.181 366.889 418.222L373.778 426.444C402.175 455.791 418.513 494.733 419.556 535.556C420.74 554.047 418.786 572.605 413.778 590.444L453.778 610.667C462.383 585.618 465.785 559.076 463.778 532.667C462.413 482.175 442.566 433.941 408 397.111Z" fill="currentColor"/>
                         <path d="M720 398L693.111 400C717.647 368.244 732.78 330.24 736.789 290.309C740.797 250.379 733.521 210.126 715.787 174.126C698.054 138.126 670.574 107.824 636.473 86.6669C602.373 65.5096 563.02 54.3456 522.889 54.4445C500.221 54.4053 477.7 58.0837 456.222 65.3333L476.444 105.333C501.814 98.1484 528.505 96.9474 554.417 101.825C580.329 106.702 604.757 117.525 625.778 133.442C646.8 149.358 663.842 169.935 675.564 193.554C687.286 217.172 693.368 243.188 693.333 269.556C693.326 307.659 680.4 344.635 656.667 374.444L658.889 340.222C659.078 337.304 658.692 334.377 657.75 331.608C656.809 328.839 655.331 326.283 653.401 324.086C651.472 321.888 649.129 320.092 646.505 318.8C643.882 317.508 641.029 316.745 638.111 316.556C635.193 316.366 632.266 316.753 629.497 317.694C626.728 318.636 624.172 320.114 621.974 322.043C619.777 323.972 617.981 326.316 616.689 328.939C615.397 331.563 614.634 334.415 614.444 337.333L608.222 428C608.046 431.216 608.571 434.432 609.76 437.424C610.949 440.417 612.775 443.116 615.111 445.333C617.108 447.36 619.499 448.958 622.135 450.028C624.772 451.097 627.6 451.617 630.444 451.556H632.667L723.333 442.222C726.257 441.945 729.097 441.09 731.688 439.708C734.28 438.326 736.572 436.445 738.432 434.171C740.292 431.898 741.682 429.279 742.524 426.465C743.365 423.651 743.64 420.699 743.333 417.778C742.716 412.12 739.952 406.915 735.611 403.236C731.27 399.556 725.682 397.682 720 398Z" fill="currentColor"/>
                         <path d="M90.4443 454.222H92.2221L183.111 446.444C186.029 446.196 188.87 445.376 191.471 444.03C194.072 442.684 196.383 440.839 198.271 438.6C200.159 436.361 201.588 433.772 202.476 430.981C203.363 428.19 203.692 425.252 203.444 422.333C203.196 419.415 202.376 416.574 201.03 413.973C199.684 411.372 197.839 409.061 195.6 407.173C193.361 405.285 190.772 403.856 187.981 402.969C185.19 402.081 182.251 401.752 179.333 402L148.444 404.667C177.539 383.203 212.733 371.601 248.889 371.556C261.069 371.629 273.208 372.969 285.111 375.556C278.131 360.404 272.84 344.531 269.333 328.222C262.667 328.222 255.778 328.222 248.889 328.222C201.476 328.151 155.374 343.779 117.778 372.667L120.444 343.556C120.687 340.635 120.35 337.696 119.453 334.907C118.556 332.117 117.115 329.533 115.215 327.302C113.315 325.072 110.992 323.239 108.381 321.909C105.77 320.58 102.922 319.78 99.9999 319.556C94.1374 319.063 88.3189 320.915 83.8199 324.706C79.3209 328.497 76.5087 333.917 75.9999 339.778L68.2221 430.444C67.9762 433.509 68.3687 436.591 69.3748 439.495C70.3809 442.4 71.9787 445.065 74.0673 447.32C76.1559 449.576 78.6897 451.374 81.5086 452.6C84.3276 453.826 87.3703 454.454 90.4443 454.444V454.222Z" fill="currentColor"/>
                         <path d="M409.333 627.333L318.444 633.333C312.551 633.716 307.051 636.425 303.154 640.863C299.257 645.302 297.284 651.106 297.667 657C298.05 662.894 300.758 668.394 305.197 672.29C309.635 676.187 315.44 678.161 321.333 677.778L355.556 675.333C330.388 695.561 300.018 708.265 267.944 711.981C235.87 715.698 203.399 710.276 174.273 696.34C145.147 682.404 120.552 660.522 103.322 633.215C86.0921 605.908 76.929 574.288 76.8889 542C77.049 526.964 79.2163 512.017 83.3333 497.556L44.4444 476.889C37.5601 498.061 34.0359 520.181 34 542.444C34.2607 582.689 45.7831 622.058 67.2627 656.092C88.7422 690.127 119.321 717.468 155.537 735.021C191.753 752.574 232.16 759.638 272.184 755.412C312.207 751.186 350.248 735.84 382 711.111L379.333 737.333C379.025 740.237 379.293 743.173 380.12 745.974C380.948 748.775 382.319 751.385 384.156 753.655C385.993 755.925 388.259 757.811 390.825 759.205C393.391 760.599 396.207 761.473 399.111 761.778H401.556C407.084 761.805 412.424 759.772 416.533 756.074C420.642 752.375 423.225 747.278 423.778 741.778L433.111 651.556C433.441 648.34 433.066 645.092 432.012 642.037C430.957 638.982 429.249 636.193 427.007 633.866C424.764 631.539 422.041 629.729 419.027 628.562C416.013 627.395 412.781 626.9 409.556 627.111L409.333 627.333Z" fill="currentColor"/>
                         </svg>
                     </span>
                </span>
            
      </div>
      <div class="step">
        <span
          class="step-number {currentStep >= 5 ? 'activeStep pointer' : 'InactiveStep'}"
          on:click={handleStepClick(currentStep)}
          >
          <span class="text">Add users</span>
          <span class="timeline-icon">
            <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M566.667 700V633.333C566.667 597.971 552.619 564.057 527.614 539.052C502.609 514.048 468.695 500 433.333 500H166.667C131.304 500 97.3905 514.048 72.3857 539.052C47.3808 564.057 33.3333 597.971 33.3333 633.333V700" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M300 366.667C373.638 366.667 433.333 306.971 433.333 233.333C433.333 159.695 373.638 100 300 100C226.362 100 166.667 159.695 166.667 233.333C166.667 306.971 226.362 366.667 300 366.667Z" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M566.667 366.667H766.666" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M666.667 266.667V466.667" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              
         </span>
    </span>
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
    border: 1px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;

    box-shadow: inset 0px 4px 20px 1px rgba(255, 145, 77, 0.8),
              inset 0px 4px 4px 0px rgba(255, 153, 0, 0.8);
  }

  .icon-buttons {
   display: flex;
   flex-direction: row;
   align-items: start;

   padding: 2.5vw 5vw;
   width: 100%; /* Full width of the container */
   justify-content: flex-end; /* Align icons to the left */
 }
 .header-button{
  display:flex;
  justify-content: space-between;
  width: -webkit-fill-available;
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
    font-size: 30px;
    margin: 0;
    font-weight: normal;
  }

  .section {
    margin-bottom: 32px;
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
  .log-buttons-container {
  display: flex;
  justify-content: space-between; /* Space between the buttons */
  gap: 10px; /* Adjust gap between buttons */
  margin-top: 20px; /* Optional margin for spacing */
}
  #viewCompleteSummaryButton {
    display: none;
    width: 100%;
    margin: 10px auto;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: black;

    color: white;
    border: 1px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
    cursor: pointer;
  }
  #viewTestLogsButton,
#viewRecordLogsButton {
  display: none;
  width: auto;
  padding: 13px;
  background-color: black;
  color: white;
  border: 1px solid #f77b3e;
  border-radius: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(255, 145, 77, 0.8);
  cursor: pointer;
  font-size: 13px;
}

#viewTestLogsButton:not(:disabled):hover,
#viewRecordLogsButton:not(:disabled):hover {
  box-shadow: 0 0 20px rgba(255, 153, 0, 1), 0 0 40px rgba(255, 153, 0, 0.5);  /* Stronger glow on hover */
  transform: scale(1.1); 
}

/* Disabled state styling (optional) */
#viewTestLogsButton:disabled,
#viewRecordLogsButton:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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
    padding: 12px;

    margin-top: 24px;
    background-color: black;
    color: white;
    border: 1px solid #ff914d;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255, 145, 77, 0.8);
    cursor: pointer;
  }
  .card:hover {
  box-shadow: 0 0 20px rgba(255, 153, 0, 1), 0 0 40px rgba(255, 153, 0, 0.5);  /* Stronger glow on hover */
  transform: scale(1.1); 
}

  .card-icon {
    display: flex;
    align-items: center;
    font-size: 24px;
    height: 25px;
    width: 25px;

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
  .step-recording,
  .step-testing{
    margin-bottom: 14px;
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
  .step:nth-of-type(5) .step-number.activeStep:hover,
  .step:nth-of-type(6) .step-number.activeStep:hover {
  font-size: 1rem; /* Increase the font size */
  transition: font-size 0.3s ease; /* Smooth transition for the font size */
  cursor: pointer; /* Show pointer cursor to indicate it is clickable */
  }

  .step-circle {
    height: 2rem;
    background-color: black;
    position: relative;
    z-index: 3;
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
  .text {
    display: inline; /* Show text */
  }

  .timeline-icon {
    display: none; /* Hide icon */
  }

  .settings-form {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: black;

}

.form-group {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
  width: 100%; /* Ensure full width */
  gap:4px;
}


label {
  color: white;
  font-size: 15px;
  display: block;
  width: 40%;
  text-align: left; /* Left align the labels */

}

input {
  width: 60%; /* Ensure all input boxes have equal width */
  padding: 8px;
  border: 1px solid #ff914d;
  border-radius: 5px;
  background-color: black;
  color: white;
  font-size: 15px;
  outline: none;
}

input:focus {
  box-shadow: 0 0 10px rgba(255, 153, 0, 0.5);
}

@media screen and (max-width: 480px) {
  /* Main container responsiveness for mobile devices */
  .settings-form {
    padding: 10px;
  }

  label {
    font-size: 3vw;
  }

  input {
    font-size: 3vw;
    padding: 1.5vw;
  }

  .form-group {
    margin-bottom: 5vw;
  }

  .header h1 {
    font-size: 6vw; /* Responsive font size for heading */
  }
  #recordStatus{
    font-size: 4vw;
  }
  .info{
    font-size: 2vw;
  }
  /* Card text and button responsiveness for mobile */
  .card {
    padding: 3vw;

    width: 100%; 
  .log-buttons-container {
    width: 65vw; 
    }
    #viewTestLogsButton,
    #viewRecordLogsButton {
      font-size:3vw ;
    }
  .card-icon {
    height: 5vw; /* Responsive size for icons */
    width: 5vw;
  }

  .card-text {
    font-size: 4vw; /* Responsive font size */
  }
  .steps {
    font-size: 3vw;
  }
  .step-recording,
  .step-testing{
    margin-bottom: 3vw;
  }
  /* Steps styling for mobile */

  /* Adjust circle sizes for mobile */
  .step-circle {
    height: 6vw; /* Responsive step circle size */
    width: 6vw;
  }

  .step-circle.active::before,
  .step-circle.inactive::before {
    width: 3vw; /* Inner circle size */
    height: 3vw;
  }
  .text {
    display: none; /* Hide text */
  }
  .timeline-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  transition: color 0.3s ease;
  }
  .activeStep .timeline-icon {
  color: white; /* Set to white when active */
  }

  .InactiveStep .timeline-icon {
  color: grey; /* Set to grey when inactive */
  }
}

</style>
