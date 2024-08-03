<script>
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
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
  onMount(() => {
    const recordStatus = document.getElementById("recordStatus");
    const recordedTestCasesDiv = document.getElementById("recordedTestCases");
    const viewTestLogsButton = document.getElementById("viewTestLogsButton");
    const viewRecordLogsButton = document.getElementById(
      "viewRecordLogsButton"
    );
    const stopTestButton = document.getElementById("stopTestingButton");
    const testResultsDiv = document.getElementById("testResults");
    const testStatus = document.getElementById("testStatus");

    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log("From Home", message);
      switch (message.type) {
        case "updateStatus":
          console.log("message.value", message.value);
          break;

        case "error":
          console.error(message.value);
          break;

        case "success":
          console.log(message.value);
          break;

        case "testcaserecorded":
          console.log("message.textContent", message.textContent);
          recordStatus.style.display = "block";
          recordedTestCasesDiv.style.display = "grid";

          if (message.error === true) {
            recordStatus.textContent = `Failed To Record Test Cases`;
            recordStatus.classList.add("error");
            const errorMessage = document.createElement("p");
            errorMessage.textContent = message.textContent;
            errorMessage.classList.add("error");
            recordedTestCasesDiv.appendChild(errorMessage);
            viewRecordLogsButton.style.display = "block";
            break;
          }

          if (message.noTestCases === true) {
            console.log("I am Called");
            viewRecordLogsButton.style.display = "block";
            recordStatus.textContent = `No Test Cases Recorded`;
            recordedTestCasesDiv.style.display = "none";
            recordStatus.classList.add("info");
            break;
          }
          console.log("Why i am getting called");
          recordStatus.textContent = `Test Cases Recorded`;
          recordStatus.classList.add("success");
          console.log(message.textContent);

          if (recordedTestCasesDiv) {
            let testSetDropdown = document.getElementById(message.testSetName);

            if (!testSetDropdown) {
              // Create a dropdown for the new test set
              testSetDropdown = document.createElement("div");
              testSetDropdown.id = message.testSetName;
              testSetDropdown.classList.add("dropdown-container");

              // Create a button to act as the dropdown toggle
              const dropdownToggle = document.createElement("div");
              dropdownToggle.classList.add("dropdown-header");

              // Create the toggle text
              const toggleText = document.createElement("span");
              // bind:this={startRecordingButton}
              toggleText.textContent = message.testSetName;

              // Create the dropdown icon
              const dropdownIcon = document.createElement("span");
              dropdownIcon.className = "dropdown-icon";

              // Append text and icon to the toggle
              dropdownToggle.appendChild(toggleText);
              dropdownToggle.appendChild(dropdownIcon);

              // Create a container for the test cases
              const testCaseContainer = document.createElement("div");
              testCaseContainer.classList.add("dropdown-content");
              testCaseContainer.style.display = "none"; // Hide initially

              // Add toggle functionality
              dropdownToggle.addEventListener("click", () => {
                testCaseContainer.style.display =
                  testCaseContainer.style.display === "none" ? "block" : "none";
                dropdownIcon.classList.toggle("open"); // Update icon based on dropdown state
              });

              // Append the toggle and container to the dropdown
              testSetDropdown.appendChild(dropdownToggle);
              testSetDropdown.appendChild(testCaseContainer);

              recordedTestCasesDiv.appendChild(testSetDropdown);
            }

            // Create the test case element
            const testCaseElement = document.createElement("button");
            testCaseElement.classList.add("recordedTestCase");
            testCaseElement.addEventListener("click", async () => {
              vscode.postMessage({
                type: "openRecordedTestFile",
                value: message.path,
              });
            });

            testCaseElement.textContent = message.textContent;

            // Find the container and append the test case element
            const testCaseContainer =
              testSetDropdown.querySelector(".dropdown-content");
            testCaseContainer.appendChild(testCaseElement);
          }
          break;

        case "recordfile":
          const projectFolder = document.getElementById("projectFolder");
          if (projectFolder) {
            projectFolder.style.display = "block";
            projectFolder.value = message.value;
            FilePath = message.value;
          }
          break;

        case "testResults":
          console.log("message.value", message.value);
          const testCaseElement = document.createElement("p");
          //click the stop testing button
          if (stopTestButton) {
            stopTestButton.click();
          }
          testCaseElement.textContent = message.textSummary;
          if (message.textSummary.includes("test passed")) {
            testCaseElement.classList.add("success");
          } else if (message.textSummary.includes("test failed")) {
            //split the textSummary
            const numErrors = message.textSummary.split(":")[1];
            if (numErrors !== " 0") {
              viewTestLogsButton.style.display = "block";
            }
            testCaseElement.classList.add("error");
          } else {
            testCaseElement.classList.add("info");
          }
          if (message.isCompleteSummary === true) {
            console.log("message.isCompleteSummary", message.isCompleteSummary);
            console.log("message.textSummary", message.textSummary);
            let messageList = message.textSummary.split("\t");
            //remove all "" from the list
            messageList = messageList.filter(function (el) {
              return el !== "";
            });
            console.log("messageList", messageList);
            const testSuiteNameElement = document.createElement("p");
            testSuiteNameElement.textContent = messageList[0];
            testSuiteNameDiv.appendChild(testSuiteNameElement);
            const testCasesTotalElement = document.createElement("p");
            testCasesTotalElement.textContent = messageList[1];
            totalTestCasesDiv.appendChild(testCasesTotalElement);
            const testCasesPassedElement = document.createElement("p");
            testCasesPassedElement.textContent = messageList[2];
            testCasesPassedDiv.appendChild(testCasesPassedElement);
            const testCasesFailedElement = document.createElement("p");
            testCasesFailedElement.textContent = messageList[3];
            testCasesFailedDiv.appendChild(testCasesFailedElement);
            return;
          }

          if (message.error === true) {
            viewCompleteSummaryButton.style.display = "none";
            viewTestLogsButton.style.display = "block";
          } else {
            viewCompleteSummaryButton.style.display = "block";
            completeSummaryHr.style.display = "block";
          }
          if (message.error === true) {
            viewTestLogsButton.style.display = "block";
            if (testStatus) {
              testStatus.style.display = "block";
              testStatus.textContent = message.value;
              testStatus.classList.add("error");
            } else {
              testResultsDiv.innerHTML = `<p class="error">${message.value}</p>`;
            }
          }
          testResultsDiv.appendChild(testCaseElement);
          break;

        case "testfile":
          const Folder = document.getElementById("projectFolder");
          if (Folder) {
            Folder.value = message.value;
            FilePath = message.value;
          }
          const testCommandDiv = document.getElementById("testCommandInput");
          if (testCommandDiv) {
            testCommandDiv.style.display = "block";
          }
          break;

        case "aggregatedTestResults":
          console.log("message.value", message.value);
          const lastTestResultsDiv = document.getElementById("lastTestResults");
          const totalTestCasesDiv = document.getElementById("totalTestCases");
          const testSuiteNameDiv = document.getElementById("testSuiteName");
          const testCasesPassedDiv = document.getElementById("testCasesPassed");
          const testCasesFailedDiv = document.getElementById("testCasesFailed");

          // Clear previous content
          if (totalTestCasesDiv) {
            totalTestCasesDiv.innerHTML = "";
          }
          if (testSuiteNameDiv) {
            testSuiteNameDiv.innerHTML = "";
          }
          if (testCasesPassedDiv) {
            testCasesPassedDiv.innerHTML = "";
          }
          if (testCasesFailedDiv) {
            testCasesFailedDiv.innerHTML = "";
          }

          if (message.error === true) {
            if (lastTestResultsDiv) {
              const errorElement = document.createElement("p");
              errorElement.textContent = "No Test Runs Found";
              errorElement.classList.add("error");
              errorElement.id = "errorElement";
              lastTestResultsDiv.appendChild(errorElement);
            }
          } else {
            // Group tests by date
            const testsByDate = {};
            message.data.testResults.forEach((test) => {
              const date = test.date;
              if (!testsByDate[date]) {
                testsByDate[date] = [];
              }
              testsByDate[date].push(test);
            });

            const testCasesTotalElement = document.createElement("p");
            testCasesTotalElement.textContent = `Total Test Cases : ${message.data.total}`;
            if (totalTestCasesDiv) {
              totalTestCasesDiv.appendChild(testCasesTotalElement);
            }

            const testCasesPassedElement = document.createElement("p");
            testCasesPassedElement.textContent = `Test Cases Passed : ${message.data.success}`;
            if (testCasesPassedDiv) {
              testCasesPassedDiv.appendChild(testCasesPassedElement);
            }

            const testCasesFailedElement = document.createElement("p");
            testCasesFailedElement.textContent = `Test Cases Failed : ${message.data.failure}`;
            if (testCasesFailedDiv) {
              testCasesFailedDiv.appendChild(testCasesFailedElement);
            }

            // Create and append dropdown structure based on testsByDate
            const dropdownContainer = document.createElement("div");
            dropdownContainer.className = "dropdown-container";

            for (const date in testsByDate) {
              if (testsByDate.hasOwnProperty(date)) {
                const tests = testsByDate[date];

                const dropdownHeader = document.createElement("div");
                dropdownHeader.className = "dropdown-header";

                // Get current date
                const currentDate = new Date();
                const currentDateString = formatDate(currentDate);

                // Get yesterday's date
                const yesterday = new Date(currentDate);
                yesterday.setDate(currentDate.getDate() - 1);
                const yesterdayDateString = formatDate(yesterday);

                if (currentDateString === date) {
                  dropdownHeader.textContent = `Today`;
                } else if (yesterdayDateString === date) {
                  dropdownHeader.textContent = `Yesterday`;
                } else {
                  dropdownHeader.textContent = `${date}`;
                }

                // Add dropdown icon
                const dropdownIcon = document.createElement("span");
                dropdownIcon.className = "dropdown-icon";

                dropdownHeader.appendChild(dropdownIcon);
                dropdownHeader.onclick = () => {
                  const content = document.getElementById(`dropdown${date}`);
                  if (content) {
                    content.classList.toggle("show");
                    dropdownIcon.classList.toggle("open"); // Update icon based on dropdown state
                  }
                };

                const dropdownContent = document.createElement("div");
                dropdownContent.id = `dropdown${date}`;
                dropdownContent.className = "dropdown-content";
                tests.forEach((test, index) => {
                  // Append individual test details
                  const testMethod = document.createElement("div");
                  testMethod.textContent = `${test.method}`;
                  if (test.status === "PASSED") {
                    testMethod.classList.add("testSuccess");
                  } else {
                    testMethod.classList.add("testError");
                  }
                  dropdownContent.appendChild(testMethod);

                  const testName = document.createElement("div");
                  testName.textContent = `${test.name}`;
                  testName.classList.add("testName");
                  dropdownContent.appendChild(testName);

                  testName.addEventListener("click", async () => {
                    vscode.postMessage({
                      type: "openTestFile",
                      value: test.testCasePath,
                    });
                  });
                  testMethod.addEventListener("click", async () => {
                    vscode.postMessage({
                      type: "openTestFile",
                      value: test.testCasePath,
                    });
                  });
                });

                dropdownContainer.appendChild(dropdownHeader);
                dropdownContainer.appendChild(dropdownContent);
              }
            }

            if (lastTestResultsDiv) {
              lastTestResultsDiv.appendChild(dropdownContainer);
            }
          }
      }
    });
  });

  let startRecordingButton;
  let startTestingButton;
  let buttonsSection = document.getElementById("buttonsSection");
  // let stopRecordingButton;
  let stopTestingButton;
  let isRecording = false;
  let isTesting = false;
  let showSteps = false;
  let selectedIconButton = 1;
  let settingsIcon = document.querySelector(".settings-icon");

  function resetUI() {
    const recordedTestCasesDiv = document.getElementById("recordedTestCases");
    const recordStatus = document.getElementById("recordStatus");
    const testStatus = document.getElementById("testStatus");
    const viewTestLogsButton = document.getElementById("viewTestLogsButton");
    const viewRecordLogsButton = document.getElementById(
      "viewRecordLogsButton"
    );
    const testResultsDiv = document.getElementById("testResults");
    const lastTestResultsDiv = document.getElementById("lastTestResults");
    const testSuiteNameDiv = document.getElementById("testSuiteName");
    const totalTestCasesDiv = document.getElementById("totalTestCases");
    const testCasesPassedDiv = document.getElementById("testCasesPassed");
    const testCasesFailedDiv = document.getElementById("testCasesFailed");
    const viewCompleteSummaryButton = document.getElementById(
      "viewCompleteSummaryButton"
    );
    const upperOutputDiv = document.getElementById("upperOutputDiv");

    if (recordedTestCasesDiv) {
      recordedTestCasesDiv.innerHTML = "";
    }
    if (recordStatus) {
      recordStatus.style.display = "none";
      recordStatus.textContent = "";
    }
    if (viewRecordLogsButton) {
      viewRecordLogsButton.style.display = "none";
    }
    if (viewTestLogsButton) {
      viewTestLogsButton.style.display = "none";
    }

    if (testResultsDiv) {
      testResultsDiv.innerHTML = "";
    }
    if (testStatus) {
      testStatus.textContent = "";
      testStatus.style.display = "none";
    }
    if (testSuiteNameDiv) {
      testSuiteNameDiv.innerHTML = "";
    }
    if (totalTestCasesDiv) {
      totalTestCasesDiv.innerHTML = "";
    }
    if (testCasesPassedDiv) {
      testCasesPassedDiv.innerHTML = "";
    }
    if (testCasesFailedDiv) {
      testCasesFailedDiv.innerHTML = "";
    }
    if (lastTestResultsDiv) {
      lastTestResultsDiv.innerHTML = "";
    }
    if (viewCompleteSummaryButton) {
      viewCompleteSummaryButton.style.display = "none";
    }
    if (upperOutputDiv) {
      upperOutputDiv.style.display = "none";
    }
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
    }
    if (buttonNumber === 1) {
      startRecordingButton.style.display = "flex";
      startTestingButton.style.display = "flex";
    }
    if (buttonNumber === 3) {
      settingsIcon.classList.toggle("open"); // Update icon based on dropdown state
    }
  };
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
    resetUI();
    // triggerAnimation();
    vscode.postMessage({
      type: "startRecordingCommand",
      value: `Recording Command...`,
    });

    clearLastTestResults();
  };

  const toggleTesting = () => {
    isTesting = !isTesting;
    isRecording = false;
    showSteps = !showSteps;
    resetUI();
    // triggerAnimation();
    vscode.postMessage({
      type: "startTestingCommand",
      value: `Testing Command...`,
    });
  };

  const stop = () => {
    isRecording = false;
    isTesting = false;
    showSteps = false;
    // triggerAnimation();
  };

  const handleCompleteSummary = () => {
    console.log("viewCompleteSummaryButton clicked");

    vscode.postMessage({
      type: "navigate",
      value: `Testresults`,
    });

    vscode.postMessage({
      type: "viewCompleteSummary",
      value: `View Complete Summary`,
    });
  };

  const handlePreviousTestResults = () => {
    vscode.postMessage({
      type: "viewPreviousTestResults",
      value: `viewPreviousTestResults`,
    });
    selectButton(2);
  };

  const handleOpenConfig = () => {
    vscode.postMessage({
      type: "openConfigFile",
      value: `/keploy.yml`,
    });

    selectButton(3);
  };

  const handleViewTestLogs = () => {
    vscode.postMessage({
      type: "viewLogs",
      value: `test_mode.log`,
    });
  };

  const handleViewRecordLogs = () => {
    vscode.postMessage({
      type: "viewLogs",
      value: `record_mode.log`,
    });
  };

  const handleStopRecord = () => {
    vscode.postMessage({
      type: "stopRecordingCommand",
      value: `Stop Recording`,
    });
  };

  const handleStopTesting = () => {
    vscode.postMessage({
      type: "stopTestingCommand",
      value: `Stop Testing`,
    });
  };

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

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

<div class="container baloo-2-custom">
  <div class="icon-buttons">
    <button
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
    </button>
    <button
      id="displayPreviousTestResults"
      class="icon-button {selectedIconButton === 2 ? 'selected' : ''}"
      on:click={handlePreviousTestResults}
    >
      <span class="history-icon"></span>
      <span class="tooltip">History</span>
    </button>
    <button
      id="openConfig"
      class="icon-button {selectedIconButton === 3 ? 'selected' : ''}"
      on:click={handleOpenConfig}
    >
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
        <h1>
          {isRecording
            ? "Recording Started"
            : isTesting
              ? "Testing Started"
              : "Running Keploy"}
        </h1>
      {/if}
      <span
        class="stop-button"
        on:click={() => {
          stop();
          handleStopRecord();
        }}
        on:keydown={(e) => e.key === "Enter" && stop()}
        id="stopRecordingButton"
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
        on:click={() => {
          stop();
          handleStopTesting();
        }}
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
      <button id="viewCompleteSummaryButton" on:click={handleCompleteSummary}
        >View Complete Test Summary</button
      >
      <button id="viewTestLogsButton" on:click={handleViewTestLogs}
        >View Logs</button
      >
      <button id="viewRecordLogsButton" on:click={handleViewRecordLogs}
        >View Logs</button
      >
      <hr id="completeSummaryHr" />
    </div>
  </div>
  {#if selectedIconButton === 2}
    <div id="lastTestResults">
      <!-- svelte-ignore a11y-missing-content -->
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
      <div class="card-arrow">➔</div>
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
    border: 2px solid;
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
    color: #ff914d;
    font-size: 24px;
    height: 40px;
    width: 80svw;
    cursor: pointer;
  }
  .icon-button.selected {
    /* border-color: #ff9933; */
    /* background-color: var(--vscode-button-background); */
    background-color: #00163d;
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

  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 16px;
    /* background-color: var(--vscode-button-background); */
    background-color: #00163d;
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
  .tooltip {
    display: none;
    position: absolute;
    /* background-color: var(--vscode-button-background); */
    background-color: #00163d;
    color: white;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    width: 120px;
    z-index: 1;
    font-size: x-small;
    top: 80px;
  }
  .icon-button:hover .tooltip {
    display: block;
  }
  #completeSummaryHr {
    display: none;
  }
</style>
