<script>
  import { onMount } from "svelte";

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log("From Test Results",message);

    const viewTestLogsButton = document.getElementById("viewTestLogsButton");
    const stopTestButton = document.getElementById("stopTestingButton");
    const testResultsDiv = document.getElementById("testResults");
    const testStatus = document.getElementById("testStatus");
    const testSuiteNameDiv = document.getElementById('testSuiteName');
const totalTestCasesDiv = document.getElementById('totalTestCases');
const testCasesPassedDiv = document.getElementById('testCasesPassed');
const testCasesFailedDiv = document.getElementById('testCasesFailed');

      switch (message.type) {
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
      }
    });
  });

  const handleReRun = () => {
    console.log("rerunTestSuiteButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "KeployHome",
    });
  };
</script>

<body class="baloo-2-custom">
  <div class="loader" id="loader"></div>
  <div id="topGrid">
    <div
      class="keploylogo"
      alt="Keploy Logo"
      style="
    height: 30px;"
    ></div>
    <h2 class="info">Test Summary</h2>
  </div>
  <hr />
  <!-- 4 Column Grid -->
  <div id="completeTestSummaryGrid">
    <div id="testSuiteName" class="info">
      <p>Name</p>
    </div>
    <div id="totalTestCases" class="info">
      <p>Total</p>
    </div>
    <div id="testCasesPassed" class="success">
      <p>Passed</p>
    </div>
    <div id="testCasesFailed" class="error">
      <p>Failed</p>
    </div>
  </div>
  <button id="rerunTestSuiteButton" on:click={handleReRun}
    >Rerun Test Cases</button
  >
</body>

<style>
  .loader {
    display: none;
  }
  #topGrid {
    display: grid;
    place-items: center;
    grid-template-columns: 1fr 1fr;
  }
  #topGrid img {
    width: 50%;
  }
  #completeTestSummaryGrid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    place-items: center;
  }
  #completeTestSummaryGrid div {
    display: grid;
    place-items: center;
    margin: 10px;
    grid-template-columns: 1fr;
  }
  button {
    margin: 5px auto;
    width: 90%;
    height: 30px;
    padding: 5px;
  }
</style>
