const vscode = acquireVsCodeApi();
const progressDiv = document.getElementById('Progress');
const filePathDiv = document.getElementById('filePathDiv');
const recordedTestCasesDiv = document.getElementById('recordedTestCases');
const testResultsDiv = document.getElementById('TestCases');
const recordCommandInput = document.getElementById('recordCommand');
const testCommandInput = document.getElementById('testCommand');
const stopRecordingButton = document.getElementById("stopRecordingButton");
const startRecordingButton = document.getElementById('startRecordingButton');
const startTestButton = document.getElementById('startTestButton');
const stopTestButton = document.getElementById('stopTestButton');
let FilePath = "";

const recordButton = document.getElementById('recordButton');
if (recordButton) {
  handleRecordButtonClick();
}
const testButton = document.getElementById('testButton');
if (testButton) {
  handleTestButtonClick();
}

async function handleRecordButtonClick() {
  if (recordButton) {
    recordButton.addEventListener('click', async () => {
      console.log("recordButton clicked");
      vscode.postMessage({
        type: "record",
        value: "Recording..."
      });
    });
  }
}

async function handleTestButtonClick() {
  if (testButton) {
    testButton.addEventListener('click', async () => {
      console.log("testButton clicked");
      vscode.postMessage({
        type: "test",
        value: "Testing..."
      });
    });
  }
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
    // Get the Progress div

    // if (progressDiv) {
    //   // Set the text to "Updating"
    //   progressDiv.innerHTML = "<p class='info'>Feature is being worked on</p>";
    // }
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
    console.log('Command value:', commandValue);
    // Get the Progress div
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
    // Get the Progress div
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
    // Get the Progress div
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
    // Get the Progress div
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
    if (filePathDiv) {
      filePathDiv.innerHTML = `<p class="info">Your Selected File is <br/> ${message.value}</p>`;
      FilePath = message.value;
    }
    const recordCommandDiv = document.getElementById('recordCommandInput');
    if (recordCommandDiv) {
      recordCommandDiv.style.display = "block";
    }
  }
  else if (message.type === 'testcaserecorded') {
    console.log("message.textContent", message.textContent);
    const testCaseElement = document.createElement('p');
    testCaseElement.textContent = message.textContent;
    recordedTestCasesDiv.appendChild(testCaseElement); // Append the testCaseElement itself instead of its text content
  }
  else if(message.type === "testResults"){
    console.log("message.value", message.value);
      console.log("message.textSummary", message.textSummary);
      const testCaseElement = document.createElement('pre');
      testCaseElement.textContent = message.textSummary;
      testResultsDiv.appendChild(testCaseElement); // Append the testCaseElement itself instead of its text content
  }
  else if(message.type === "testfile"){
    console.log("message.value", message.value);
    if (filePathDiv) {
      filePathDiv.innerHTML = `<p class="info">Your Selected File is <br/> ${message.value}</p>`;
      FilePath = message.value;
    }
    const testCommandDiv = document.getElementById('testCommandInput');
    if (testCommandDiv) {
      testCommandDiv.style.display = "block";
    }

  }
});






