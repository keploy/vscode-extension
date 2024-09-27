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
const viewTestLogsButton = document.getElementById('viewTestLogsButton');
const viewRecordLogsButton = document.getElementById('viewRecordLogsButton');
const apiResponseElement = document.getElementById('apiResponseDisplay');
const backConfigbutton = document.getElementById('backConfig');
let actionStarted = false;
// const apiResponseDisplayLog  = document.getElementById('apiResponseDisplay');
// const selectRecordFolderButton = document.getElementById('selectRecordFolderButton');
// const selectTestFolderButton = document.getElementById('selectTestFolderButton');
const navigateToConfigButton = document.getElementById('backtoHome');
const backtoHome = document.getElementById('backArrow');
const selectedIconButton = document.getElementById('selectedIconNumber');
let FilePath = "";

//cleanup required

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

if(backConfigbutton){
  backConfigbutton.addEventListener('click',async () =>{
    if(selectedIconButton.textContent == '1'){
      console.log("selectedIconButton: " , selectedIconButton.textContent );
      console.log("backconfig button clicked")

      if(actionStarted == true){
        vscode.postMessage({
          type: "stopRecordingCommand",
          value: `Stop Recording`
        });
    
        vscode.postMessage({
          type: "stopTestingCommand",
          value: `Stop Testing`
        });

      vscode.postMessage({
        type:"navigate",
        value:"IntegrationTest"
      })

      }else{
        vscode.postMessage({
          type:"navigate",
          value:"Config"
        })
      }
    }else{
     

      vscode.postMessage({
        type:"navigate",
        value:"IntegrationTest"
      })
    }
  })
}else{
  console.log("no back butoon");
}

if (navigateToConfigButton) {
  console.log("here is button")
  navigateToConfigButton.addEventListener('click', async () => {
    vscode.postMessage({
      type: "navigate",
      value: "Config"
    });
  }
  );
}

if (backtoHome) {
  backtoHome.addEventListener('click', async () => {
    vscode.postMessage({
      type: "navigate",
      value: "Config"
    });
  }
  );
}

// if (selectRecordFolderButton) {
//   selectRecordFolderButton.addEventListener('click', async () => {
//     console.log("selectRecordFolderButton clicked");
//     vscode.postMessage({
//       type: "selectRecordFolder",
//       value: "Selecting Record Folder..."
//     });
//   });
// }
// if (selectTestFolderButton) {
//   selectTestFolderButton.addEventListener('click', async () => {
//     console.log("selectTestFolderButton clicked");
//     vscode.postMessage({
//       type: "selectTestFolder",
//       value: "Selecting Test Folder..."
//     });
//   });
// }

if (viewTestLogsButton) {
  viewTestLogsButton.addEventListener('click', async () => {
    console.log("viewTestLogsButton clicked");
    vscode.postMessage({
      type: "viewLogs",
      value: `logs/test_mode.log`
    });
  });
}

if (viewRecordLogsButton) {
  viewRecordLogsButton.addEventListener('click', async () => {
    console.log("viewRecordLogsButton clicked");
    vscode.postMessage({
      type: "viewLogs",
      value: `logs/record_mode.log`
    });
  });

}


if (startRecordingButton) {
  startRecordingButton.addEventListener('click', async () => {
    console.log("startRecordingButton clicked");
    actionStarted = true;
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
    actionStarted = false;
    vscode.postMessage({
      type: "stopRecordingCommand",
      value: `Stop Recording`
    });
  });
}
if (startTestButton) {
  startTestButton.addEventListener('click', async () => {
    console.log("startTestButton clicked");
    actionStarted = true;
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
    actionStarted = false;
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
    console.log("stopping the recording and testing")
    vscode.postMessage({
      type: "stopRecordingCommand",
      value: `Stop Recording`
    });


    vscode.postMessage({
      type: "stopTestingCommand",
      value: `Stop Testing`
    });

    vscode.postMessage({
      type: "viewPreviousTestResults",
      value: `viewPreviousTestResults`
    });
  });

}

if (openConfigButton) {
  openConfigButton.addEventListener('click', async () => {
    console.log("openConfigButton clicked");
    console.log("stopping the recording and testing")
    
    vscode.postMessage({
      type: "stopRecordingCommand",
      value: `Stop Recording`
    });


    vscode.postMessage({
      type: "stopTestingCommand",
      value: `Stop Testing`
    });
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

document.addEventListener('ciCdStepClick', function (e) {
  // Logic to handle CI/CD setup click event
  if (e.detail.step === 'ci-cd-setup') {
    console.log('CI/CD setup step clicked');
    // Perform your action here, such as redirecting or opening something in the sidebar
    // Example: Trigger navigation or link opening logic
    vscode.postMessage({
      type: "openLink",
      url: "https://keploy.io/docs", // Replace this with the URL you want to navigate to
    });// Example of opening a link
  }
});

document.addEventListener('addUsersClick', function (e) {
  // Logic to handle CI/CD setup click event
  if (e.detail.step === 'add-users') {
    console.log('add users  step clicked');
    // Perform your action here, such as redirecting or opening something in the sidebar
    // Example: Trigger navigation or link opening logic
    vscode.postMessage({
      type: "openLink",
      url: "https://app.keploy.io", // Replace this with the URL you want to navigate to
    });// Example of opening a link
  }
});

// Handle messages sent from the extension
window.addEventListener('message', event => {
  const message = event.data;
  // console.log("message", message);

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
    if(stopRecordingButton){
      stopRecordingButton.click();
    }
    recordStatus.style.display = "block";
    recordedTestCasesDiv.style.display = "grid";

    if (message.error === true) {
      recordStatus.textContent = `Failed To Record Test Cases`;
      recordStatus.classList.add("error");
      const errorMessage = document.createElement('p');
      errorMessage.textContent = message.textContent;
      errorMessage.classList.add("error");
      recordedTestCasesDiv.appendChild(errorMessage);
      viewRecordLogsButton.style.display = "block";
      return;
    }

    if (message.noTestCases === true) {
      viewRecordLogsButton.style.display = "block";
      recordStatus.textContent = `No Test Cases Recorded`;
      recordedTestCasesDiv.style.display = "none";
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
      //split the textSummary
      const numErrors = message.textSummary.split(":")[1];
      if (numErrors !== " 0") {
        viewTestLogsButton.style.display = "block";
      }
      testCaseElement.classList.add("error");
    }
    else {
      testCaseElement.classList.add("info");
    }
    if (message.isCompleteSummary === true) {
      console.log("message.isCompleteSummary", message.isCompleteSummary);
      console.log("message.textSummary", message.textSummary);
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
      viewTestLogsButton.style.display = "block";
    }
    else {
      viewCompleteSummaryButton.style.display = "block";
      completeSummaryHr.style.display = "block";
    }
    if (message.error === true) {
      viewTestLogsButton.style.display = "block";
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
      // Group tests by date and then by report
      const testsByDateAndReport = {};
      message.data.testResults.forEach(test => {
        const date = test.date;
        const report = test.report;
        if (!testsByDateAndReport[date]) {
          testsByDateAndReport[date] = {};
        }
        if (!testsByDateAndReport[date][report]) {
          testsByDateAndReport[date][report] = [];
        }
        testsByDateAndReport[date][report].push(test);
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

      // Create and append dropdown structure based on testsByDateAndReport
      const dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'dropdown-container';

      for (const date in testsByDateAndReport) {
        if (testsByDateAndReport.hasOwnProperty(date)) {
          const reports = testsByDateAndReport[date];

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

          for (const report in reports) {
            if (reports.hasOwnProperty(report)) {
              const reportDropdownHeader = document.createElement('div');
              reportDropdownHeader.className = 'dropdown-header';
              reportDropdownHeader.textContent = report;

              // Add dropdown icon for report
              const reportDropdownIcon = document.createElement('span');
              reportDropdownIcon.className = 'dropdown-icon';

              reportDropdownHeader.appendChild(reportDropdownIcon);
              reportDropdownHeader.onclick = () => {
                const content = document.getElementById(`dropdown${date}${report}`);
                if (content) {
                  content.classList.toggle('show');
                  reportDropdownIcon.classList.toggle('open'); // Update icon based on dropdown state
                }
              };

              const reportDropdownContent = document.createElement('div');
              reportDropdownContent.id = `dropdown${date}${report}`;
              reportDropdownContent.className = 'report-dropdown-content';

              reports[report].forEach((test, index) => {
                // Append individual test details
                const testMethod = document.createElement('div');
                testMethod.textContent = `${test.method}`;
                if (test.status === 'PASSED') {
                  testMethod.classList.add("testSuccess");
                } else {
                  testMethod.classList.add("testError");
                }
                reportDropdownContent.appendChild(testMethod);

                const testName = document.createElement('div');
                testName.textContent = `${test.name}`;
                testName.classList.add("testName");
                reportDropdownContent.appendChild(testName);

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

              dropdownContent.appendChild(reportDropdownHeader);
              dropdownContent.appendChild(reportDropdownContent);
            }
          }

          dropdownContainer.appendChild(dropdownHeader);
          dropdownContainer.appendChild(dropdownContent);
        }
      }

      if (lastTestResultsDiv) { lastTestResultsDiv.appendChild(dropdownContainer); }
    }

  }

});






