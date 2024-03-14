const vscode = acquireVsCodeApi();
const progressDiv = document.getElementById('Progress');
const filePathDiv = document.getElementById('filePathDiv');
const recordedTestCasesDiv = document.getElementById('recordedTestCases');
const testResultsDiv = document.getElementById('testResults');
const recordCommandInput = document.getElementById('recordCommand');
const testCommandInput = document.getElementById('testCommand');
const stopRecordingButton = document.getElementById("stopRecordingButton");
const startRecordingButton = document.getElementById('startRecordingButton');
const startTestButton = document.getElementById('startTestingButton');
const stopTestButton = document.getElementById('stopTestingButton');
const openRecordPageButton = document.getElementById('openRecordPageButton');
const openTestPageButton = document.getElementById('openTestPageButton');
const navigateHomeButton = document.getElementById('navigateHomeButton');
const recordStatus = document.getElementById('recordStatus');
const testStatus = document.getElementById('testStatus');
const upperOutputDiv = document.getElementById('upperOutputDiv');
const generatedRecordCommandDiv = document.getElementById('recordCommandDiv');
const generatedTestCommandDiv = document.getElementById('testCommandDiv');
const viewCompleteSummaryButton = document.getElementById('viewCompleteSummaryButton');
let FilePath = "";

//cleanup required

if (openRecordPageButton) {
  openRecordPageButton.addEventListener('click', async () => {
    console.log("openRecordPageButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Record"
    });
  });
}

if (navigateHomeButton) {
  navigateHomeButton.addEventListener('click', async () => {
    console.log("navigateHomeButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Main"
    });
  });
}
if(openTestPageButton){
  openTestPageButton.addEventListener('click', async () => {
    console.log("openTestPageButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Test"
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



const updateButton = document.getElementById('updateKeployButton');
if (updateButton) {
  updateButton.addEventListener('click', async () => {
    const updateButtons = document.getElementById('updateButtons');
    if (updateButtons) {
      if (updateButtons.style.display === "grid") {
        updateButtons.style.display = "none";
      }
      else {
        updateButtons.style.display = "grid";
      }
    }
  });
}

const updateKeployBinaryButton = document.getElementById('updateKeployBinaryButton');
if (updateKeployBinaryButton) {
  updateKeployBinaryButton.addEventListener('click', async () => {
    console.log("updateKeployBinaryButton clicked");
    vscode.postMessage({
      type: "updateKeploy",
      value: `Updating Keploy...`
    });
  });
}

const updateKeployDockerButton = document.getElementById('updateKeployDockerButton');
if (updateKeployDockerButton) {
  updateKeployDockerButton.addEventListener('click', async () => {
    console.log("updateKeployDockerButton clicked");
    // Get the Progress div
    vscode.postMessage({
      type: "updateKeployDocker",
      value: `Updating Keploy Docker...`
    });
  });
}


if (startRecordingButton) {
  startRecordingButton.addEventListener('click', async () => {
    console.log("startRecordingButton clicked");
    stopRecordingButton.style.display = 'block';
    const commandValue = recordCommandInput.value;
    recordedTestCasesDiv.innerHTML = "";
    console.log('Command value:', commandValue);
    FilePath = document.getElementById('recordProjectFolder').value;
    vscode.postMessage({
      type: "startRecordingCommand",
      value: `Recording Command...`,
      command: commandValue,
      filePath: FilePath
    });
  });
}
if(stopRecordingButton){
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
    stopTestButton.style.display = 'block';
    const commandValue = testCommandInput.value;
    console.log('Command value:', commandValue);
    FilePath = document.getElementById('testProjectFolder').value;
    vscode.postMessage({
      type: "startTestingCommand",
      value: `Testing Command...`,
      command: commandValue,
      filePath: FilePath
    });
  });
}
if(stopTestButton){
  stopTestButton.addEventListener('click', async () => {
    console.log("stopTestButton clicked");
    // vscode.postMessage({
    //   type: "navigate",
    //   value: `Testresults`
    // });
    vscode.postMessage({
      type: "stopTestingCommand",
      value: `Stop Testing`
    });
  });
}



// Handle messages sent from the extension
window.addEventListener('message', event => {
  const message = event.data;
  console.log("message", message);
  if (message.type === 'updateStatus') {
    console.log("message.value", message.value);
    progressDiv.innerHTML = `<p class="info">${message.value}</p>`;
  }
  else if (message.type === 'error') {
    console.error(message.value);
    progressDiv.innerHTML = `<p class="error">${message.value}</p>`;
  }
  else if (message.type === 'success') {
    console.log(message.value);
    progressDiv.innerHTML = `<p class="success">${message.value}</p>`;
  }
  else if (message.type === 'recordfile') {
    console.log(message.value);
    const recordProjectFolder = document.getElementById('recordProjectFolder');
    if (recordProjectFolder) {
      recordProjectFolder.value = message.value;
      FilePath = message.value;
    }
  }
  else if (message.type === 'testcaserecorded') {
    console.log("message.textContent", message.textContent);
    stopRecordingButton.style.display = 'none';
    recordStatus.style.display = "block";
    upperOutputDiv.style.display = "none";
    generatedRecordCommandDiv.style.display = "none";
    if(message.error === true){
      recordStatus.textContent = `Failed To Record Test Cases`;
      recordStatus.classList.add("error");
      const errorMessage = document.createElement('p class="error"');
      errorMessage.textContent = message.textContent;
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
    const testCaseElement = document.createElement('button');
    testCaseElement.classList.add("recordedTestCase");
    testCaseElement.addEventListener('click', async () => {
      vscode.postMessage({
        type: "openRecordedTestFile",
        value: message.path
      });
    }
    );

    testCaseElement.textContent = message.textContent;
    recordedTestCasesDiv.appendChild(testCaseElement); 
  }
  else if(message.type === "testResults"){
      console.log("message.value", message.value);
      stopTestButton.style.display = 'none';
      upperOutputDiv.style.display = "none";
      generatedTestCommandDiv.style.display = "none";
      testStatus.style.display = "block";
      viewCompleteSummaryButton.style.display = "block";
      if(message.error === true){
        testStatus.textContent = message.value;
        testStatus.classList.add("error");
        return;
      }
      console.log("message.textSummary", message.textSummary);
      const testCaseElement = document.createElement('p');
      if(message.textSummary.includes("test passed")){
        testCaseElement.classList.add("success");
      }
      else if (message.textSummary.includes("test failed")){
        testCaseElement.classList.add("error");
      }
      else{
        testCaseElement.classList.add("info");
      }
      testCaseElement.textContent = message.textSummary;
      testResultsDiv.appendChild(testCaseElement); 
  }
  else if(message.type === "testfile"){
    const testProjectFolder = document.getElementById('testProjectFolder');
    if (testProjectFolder) {
      testProjectFolder.value = message.value;
      FilePath = message.value;
    }
    const testCommandDiv = document.getElementById('testCommandInput');
    if (testCommandDiv) {
      testCommandDiv.style.display = "block";
    }

  }
});






