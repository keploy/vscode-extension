const { sign } = require("crypto");

const vscode = acquireVsCodeApi();
const progressDiv = document.getElementById('Progress');
const filePathDiv = document.getElementById('filePathDiv');
const recordedTestCasesDiv = document.getElementById('recordedTestCases');
const testResultsDiv = document.getElementById('testResults');
// const appCommand = document.getElementById('appCommand');
const stopRecordingButton = document.getElementById("stopRecordingButton");
const startRecordingButton = document.getElementById('startRecordingButton');
const startTestButton = document.getElementById('startTestingButton');
const stopTestButton = document.getElementById('stopTestingButton');
const openRecordPageButton = document.getElementById('openRecordPageButton');
const configNotFound = document.getElementById('keployConfigInfo');
const openTestPageButton = document.getElementById('openTestPageButton');
const recordStatus = document.getElementById('recordStatus');
const testStatus = document.getElementById('testStatus');
const upperOutputDiv = document.getElementById('upperOutputDiv');
const generatedRecordCommandDiv = document.getElementById('recordCommandDiv');
const generatedTestCommandDiv = document.getElementById('testCommandDiv');
const viewCompleteSummaryButton = document.getElementById('viewCompleteSummaryButton');
const completeSummaryHr = document.getElementById('completeSummaryHr');
const displayPreviousTestResults = document.getElementById('displayPreviousTestResults');
const openConfigButton = document.getElementById('openConfig');
const setupConfigButton = document.getElementById('setupConfig');
const completeTestSummaryDiv = document.getElementById('completeTestSummaryGrid');
const lastTestResultsDiv = document.getElementById('lastTestResults');
const testSuiteNameDiv = document.getElementById('testSuiteName');
const totalTestCasesDiv = document.getElementById('totalTestCases');
const testCasesPassedDiv = document.getElementById('testCasesPassed');
const testCasesFailedDiv = document.getElementById('testCasesFailed');
const rerunTestSuiteButton = document.getElementById('rerunTestSuiteButton');
const initialiseConfigButton = document.getElementById('initialiseConfigButton');
const upperHR = document.getElementById('upperHR');
const lowerHR = document.getElementById('lowerHR');
const loader = document.getElementById('loader');
let FilePath = "";

//cleanup required
// Here have to icons for authentication and welcome
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
function resetUI() {
  if (recordedTestCasesDiv) {
    recordedTestCasesDiv.innerHTML = "";
  }
  if (recordStatus) {
    recordStatus.style.display = "none";
    recordStatus.textContent = "";
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

if (openRecordPageButton) {
  openRecordPageButton.addEventListener('click', async () => {
    console.log("openRecordPageButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Keploy"
    });
  });
}


if (openTestPageButton) {
  openTestPageButton.addEventListener('click', async () => {
    console.log("openTestPageButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Test"
    });
  });

}
if (rerunTestSuiteButton) {
  rerunTestSuiteButton.addEventListener('click', async () => {
    console.log("rerunTestSuiteButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "KeployHome"
    });
  });

}


const selectRecordFolderButton = document.getElementById('selectRecordFolderButton');
if (selectRecordFolderButton) {
  selectRecordFolderButton.addEventListener('click', async () => {
    console.log("selectRecordFolderButton clicked");
    vscode.postMessage({
      type: "selectRecordFolder",
      value: "Selecting Record Folder..."
    });
  });
}
const selectTestFolderButton = document.getElementById('selectTestFolderButton');
if (selectTestFolderButton) {
  selectTestFolderButton.addEventListener('click', async () => {
    console.log("selectTestFolderButton clicked");
    vscode.postMessage({
      type: "selectTestFolder",
      value: "Selecting Test Folder..."
    });
  });
}

async function getKeployVersion() {
  // GitHub repository details
  const repoOwner = "keploy";
  const repoName = "keploy";

  const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

  // Get the latest release
  const response = await fetch(apiURL);
  const data = await response.json();
  const latestVersion = data.tag_name;
  return latestVersion;
}
// Create a function to update the version display
function updateVersionDisplay(version) {
  const versionDisplay = document.getElementById('versionDisplay');
  if (versionDisplay) {
    versionDisplay.innerHTML = `Latest version:
     <p>${version}</p>`;
  }
}



const getVersionButton = document.getElementById('getVersionButton');
if (getVersionButton) {
  getVersionButton.addEventListener('click', async () => {
    try {
      // Call the getKeployVersion function
      const version = await getKeployVersion();
      console.log(`The latest version of Keploy is ${version}`);
      // Update the version display
      updateVersionDisplay(version);
      // Post a message to the extension with the latest version
      vscode.postMessage({
        type: "onInfo",
        value: `The latest version of Keploy is ${version}`
      });
    } catch (error) {
      // Handle any errors that occur
      vscode.postMessage({
        type: "onError",
        value: `Error getting Keploy version: ${error.message}`
      });
    }
  });
}


if (startRecordingButton) {
  startRecordingButton.addEventListener('click', async () => {
    console.log("startRecordingButton clicked");
    resetUI();
    // let  commandValue = appCommand.value;

    // console.log('Command value:', commandValue);

    // FilePath = document.getElementById('projectFolder').value;
    // if (FilePath === "") {
    //   FilePath = "./";
    // }
    // const generatedRecordCommand = document.getElementById('generatedRecordCommand');
    vscode.postMessage({
      type: "startRecordingCommand",
      value: `Recording Command...`,
      // command: "./test-app-url-shortener",
      // filePath: "./",
      // generatedRecordCommand: "" 
    });
  });
}
if (stopRecordingButton) {
  stopRecordingButton.addEventListener('click', async () => {
    console.log("stopRecordingButton clicked");
    vscode.postMessage({
      type: "stopRecordingCommand",
      value: `Stop Recording`
    });
  });
}
if (startTestButton) {
  startTestButton.addEventListener('click', async () => {
    console.log("startTestButton clicked");
    resetUI();

    // const commandValue = appCommand.value;
    // console.log('Command value:', commandValue);
    // FilePath = document.getElementById('projectFolder').value;
    // if (FilePath === "") {
    // FilePath = "./";
    // }
    // const generatedTestCommand = document.getElementById('generatedTestCommand');
    vscode.postMessage({
      type: "startTestingCommand",
      value: `Testing Command...`,
      // command: "./test-app-url-shortener",
      // filePath: "./",
      // generatedTestCommand: ""
    });
  });
}
if (stopTestButton) {
  stopTestButton.addEventListener('click', async () => {
    console.log("stopTestButton clicked");

    vscode.postMessage({
      type: "stopTestingCommand",
      value: `Stop Testing`
    });
  });
}

if (viewCompleteSummaryButton) {
  viewCompleteSummaryButton.addEventListener('click', async () => {
    console.log("viewCompleteSummaryButton clicked");

    vscode.postMessage({
      type: "navigate",
      value: `Testresults`
    });

    vscode.postMessage({
      type: "viewCompleteSummary",
      value: `View Complete Summary`
    });
  });

}

if (initialiseConfigButton) {
  console.log("initialiseConfigButton inside if", initialiseConfigButton);
  initialiseConfigButton.addEventListener('click', async () => {
    console.log("initialiseConfigButton clicked");
    const path = document.getElementById('configPath').value;
    const command = document.getElementById('configCommand').value;
    vscode.postMessage({
      type: "initialiseConfig",
      value: `Initialise Config`,
      command: command,
      path: path
    });
  });
}

if (displayPreviousTestResults) {
  displayPreviousTestResults.addEventListener('click', async () => {
    console.log("displayPreviousTestResults clicked");
    vscode.postMessage({
      type: "viewPreviousTestResults",
      value: `viewPreviousTestResults`
    });
  });

}

if (openConfigButton) {
  openConfigButton.addEventListener('click', async () => {
    console.log("openConfigButton clicked");
    vscode.postMessage({
      type: "openConfigFile",
      value: `/keploy.yml`
    });
  });
}
if (setupConfigButton) {
  setupConfigButton.addEventListener('click', async => {
    console.log("setupConfigButton clicked");
    vscode.postMessage({
      type: "openConfigFile",
      value: `/keploy.yml`
    });
  });
}

// Handle messages sent from the extension
window.addEventListener('message', event => {
  const message = event.data;
  console.log("message", message);

  if (message.type === 'navigateToHome') {
    vscode.postMessage({
      type: "navigate",
      value: "KeployHome"
    });
  }
  if (message.type === 'updateStatus') {
    console.log("message.value", message.value);

  }
  else if (message.type === 'error') {
    console.error(message.value);
  }
  else if (message.type === 'success') {
    console.log(message.value);
  }
  else if (message.type === 'recordfile') {
    console.log(message.value);
    const projectFolder = document.getElementById('projectFolder');
    if (projectFolder) {
      projectFolder.style.display = "block";
      projectFolder.value = message.value;
      FilePath = message.value;
    }
  }
  else if (message.type === 'testcaserecorded') {
    console.log("message.textContent", message.textContent);
    recordStatus.style.display = "block";
    recordedTestCasesDiv.style.display = "grid";

    if (message.error === true) {
      recordStatus.textContent = `Failed To Record Test Cases`;
      recordStatus.classList.add("error");
      const errorMessage = document.createElement('p');
      errorMessage.textContent = message.textContent;
      errorMessage.classList.add("error");
      recordedTestCasesDiv.appendChild(errorMessage);
      return;
    }

    if (message.noTestCases === true) {
      recordStatus.textContent = `No Test Cases Recorded`;
      recordStatus.classList.add("info");
      return;
    }

    recordStatus.textContent = `Test Cases Recorded`;
    recordStatus.classList.add("success");
    console.log(message.textContent);

    if (recordedTestCasesDiv) {
      let testSetDropdown = document.getElementById(message.testSetName);

      if (!testSetDropdown) {
        // Create a dropdown for the new test set
        testSetDropdown = document.createElement('div');
        testSetDropdown.id = message.testSetName;
        testSetDropdown.classList.add("dropdown-container");

        // Create a button to act as the dropdown toggle
        const dropdownToggle = document.createElement('div');
        dropdownToggle.classList.add("dropdown-header");

        // Create the toggle text
        const toggleText = document.createElement('span');
        toggleText.textContent = message.testSetName;

        // Create the dropdown icon
        const dropdownIcon = document.createElement('span');
        dropdownIcon.className = 'dropdown-icon';

        // Append text and icon to the toggle
        dropdownToggle.appendChild(toggleText);
        dropdownToggle.appendChild(dropdownIcon);

        // Create a container for the test cases
        const testCaseContainer = document.createElement('div');
        testCaseContainer.classList.add("dropdown-content");
        testCaseContainer.style.display = "none"; // Hide initially

        // Add toggle functionality
        dropdownToggle.addEventListener('click', () => {
          testCaseContainer.style.display = testCaseContainer.style.display === "none" ? "block" : "none";
          dropdownIcon.classList.toggle('open'); // Update icon based on dropdown state
        });

        // Append the toggle and container to the dropdown
        testSetDropdown.appendChild(dropdownToggle);
        testSetDropdown.appendChild(testCaseContainer);

        recordedTestCasesDiv.appendChild(testSetDropdown);
      }

      // Create the test case element
      const testCaseElement = document.createElement('button');
      testCaseElement.classList.add("recordedTestCase");
      testCaseElement.addEventListener('click', async () => {
        vscode.postMessage({
          type: "openRecordedTestFile",
          value: message.path
        });
      });

      testCaseElement.textContent = message.textContent;

      // Find the container and append the test case element
      const testCaseContainer = testSetDropdown.querySelector('.dropdown-content');
      testCaseContainer.appendChild(testCaseElement);
    }
  }

  else if (message.type === "testResults") {
    console.log("message.value", message.value);
    const testCaseElement = document.createElement('p');
    //click the stop testing button
    if (stopTestButton) {
      stopTestButton.click();
    }
    testCaseElement.textContent = message.textSummary;
    if (message.textSummary.includes("test passed")) {
      testCaseElement.classList.add("success");
    }
    else if (message.textSummary.includes("test failed")) {
      testCaseElement.classList.add("error");
    }
    else {
      testCaseElement.classList.add("info");
    }
    if (message.isCompleteSummary === true) {
      console.log("message.isCompleteSummary", message.isCompleteSummary);
      let messageList = message.textSummary.split("\t");
      //remove all "" from the list
      messageList = messageList.filter(function (el) {
        return el !== '';
      });
      console.log("messageList", messageList);
      const testSuiteNameElement = document.createElement('p');
      testSuiteNameElement.textContent = messageList[0];
      testSuiteNameDiv.appendChild(testSuiteNameElement);
      const testCasesTotalElement = document.createElement('p');
      testCasesTotalElement.textContent = messageList[1];
      totalTestCasesDiv.appendChild(testCasesTotalElement);
      const testCasesPassedElement = document.createElement('p');
      testCasesPassedElement.textContent = messageList[2];
      testCasesPassedDiv.appendChild(testCasesPassedElement);
      const testCasesFailedElement = document.createElement('p');
      testCasesFailedElement.textContent = messageList[3];
      testCasesFailedDiv.appendChild(testCasesFailedElement);
      return;
    }
    if (message.error === true) {
      viewCompleteSummaryButton.style.display = "none";
    }
    else {
      viewCompleteSummaryButton.style.display = "block";
      completeSummaryHr.style.display = "block";
    }
    if (message.error === true) {
      if (testStatus) {
        testStatus.textContent = message.value;
        testStatus.classList.add("error");
      }
      else {
        testResultsDiv.innerHTML = `<p class="error">${message.value}</p>`;
      }
    }
    testResultsDiv.appendChild(testCaseElement);
  }
  else if (message.type === "testfile") {
    const projectFolder = document.getElementById('projectFolder');
    if (projectFolder) {
      projectFolder.value = message.value;
      FilePath = message.value;
    }
    const testCommandDiv = document.getElementById('testCommandInput');
    if (testCommandDiv) {
      testCommandDiv.style.display = "block";
    }

  }

  else if (message.type === "configNotFound") {
    if (configNotFound) {
      configNotFound.classList.add("error");
      configNotFound.textContent = message.value;
    }
    const configInstruction = document.createElement('pre');
    configInstruction.classList.add("info");
    configInstruction.textContent = `Run the below command to generate the config file`;
    configNotFound.appendChild(configInstruction);
    const configCommand = document.createElement('pre');
    configCommand.classList.add("terminal");
    configCommand.textContent = `keploy config --generate`;
    configCommand.addEventListener('click', async () => {
      navigator.clipboard.writeText('keploy config --generate');
    });
    configNotFound.appendChild(configCommand);
  }

  else if (message.type === "configUninitialized") {
    try {
      const initialiseConfigDiv = document.getElementById('initialiseConfig');
      const keployConfigInfo = document.getElementById('keployConfigInfo');
      keployConfigInfo.style.display = "none";
      initialiseConfigDiv.style.display = "grid";
      initialiseConfigButton.style.display = "block";

    }
    catch (error) {
      console.log("error", error);
    }
  }


  if (message.type === 'aggregatedTestResults') {
    console.log("message.value", message.value);
    const lastTestResultsDiv = document.getElementById('lastTestResults');
    const totalTestCasesDiv = document.getElementById('totalTestCases');
    const testSuiteNameDiv = document.getElementById('testSuiteName');
    const testCasesPassedDiv = document.getElementById('testCasesPassed');
    const testCasesFailedDiv = document.getElementById('testCasesFailed');

    // Clear previous content
    if (totalTestCasesDiv) { totalTestCasesDiv.innerHTML = ''; }
    if (testSuiteNameDiv) { testSuiteNameDiv.innerHTML = ''; }
    if (testCasesPassedDiv) { testCasesPassedDiv.innerHTML = ''; }
    if (testCasesFailedDiv) { testCasesFailedDiv.innerHTML = ''; }

    if (message.error === true) {
      if (lastTestResultsDiv) {
        const errorElement = document.createElement('p');
        errorElement.textContent = "No Test Runs Found";
        errorElement.classList.add("error");
        errorElement.id = "errorElement";
        lastTestResultsDiv.appendChild(errorElement);
      }
    } else {
      // Group tests by date
      const testsByDate = {};
      message.data.testResults.forEach(test => {
        const date = test.date;
        if (!testsByDate[date]) {
          testsByDate[date] = [];
        }
        testsByDate[date].push(test);
      });


      const testCasesTotalElement = document.createElement('p');
      testCasesTotalElement.textContent = `Total Test Cases : ${message.data.total}`;
      if (totalTestCasesDiv) { totalTestCasesDiv.appendChild(testCasesTotalElement); }

      const testCasesPassedElement = document.createElement('p');
      testCasesPassedElement.textContent = `Test Cases Passed : ${message.data.success}`;
      if (testCasesPassedDiv) { testCasesPassedDiv.appendChild(testCasesPassedElement); }

      const testCasesFailedElement = document.createElement('p');
      testCasesFailedElement.textContent = `Test Cases Failed : ${message.data.failure}`;
      if (testCasesFailedDiv) { testCasesFailedDiv.appendChild(testCasesFailedElement); }

      // Create and append dropdown structure based on testsByDate
      const dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'dropdown-container';

      for (const date in testsByDate) {
        if (testsByDate.hasOwnProperty(date)) {
          const tests = testsByDate[date];

          const dropdownHeader = document.createElement('div');
          dropdownHeader.className = 'dropdown-header';

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
          const dropdownIcon = document.createElement('span');
          dropdownIcon.className = 'dropdown-icon';

          dropdownHeader.appendChild(dropdownIcon);
          dropdownHeader.onclick = () => {
            const content = document.getElementById(`dropdown${date}`);
            if (content) {
              content.classList.toggle('show');
              dropdownIcon.classList.toggle('open'); // Update icon based on dropdown state
            }
          };

          const dropdownContent = document.createElement('div');
          dropdownContent.id = `dropdown${date}`;
          dropdownContent.className = 'dropdown-content';
          tests.forEach((test, index) => {
            // Append individual test details
            const testMethod = document.createElement('div');
            testMethod.textContent = `${test.method}`;
            if (test.status === 'PASSED') {
              testMethod.classList.add("testSuccess");
            } else {
              testMethod.classList.add("testError");
            }
            dropdownContent.appendChild(testMethod);

            const testName = document.createElement('div');
            testName.textContent = `${test.name}`;
            testName.classList.add("testName");
            dropdownContent.appendChild(testName);

            testName.addEventListener('click', async () => {
              vscode.postMessage({
                type: "openTestFile",
                value: test.testCasePath
              });
            });
            testMethod.addEventListener('click', async () => {
              vscode.postMessage({
                type: "openTestFile",
                value: test.testCasePath
              });
            });
          });

          dropdownContainer.appendChild(dropdownHeader);
          dropdownContainer.appendChild(dropdownContent);
        }
      }

      if (lastTestResultsDiv) { lastTestResultsDiv.appendChild(dropdownContainer); }
    }
  }

});






