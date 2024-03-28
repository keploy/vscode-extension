<script>
  import { onMount } from "svelte";
 
  onMount(() => {


    const selectFlagsElement = document.getElementById("selectTestFlags");
    let currentCommand = `keploy test -c "${document.getElementById("testCommandInput").value}"`;
      for (const [flag, value] of Object.entries(options)) {
        if (value) {
          currentCommand += ` --${flag}="${value}"`;
        }
      }
    document.getElementById("generatedTestCommand").innerText = currentCommand;

    function flagChange() {
      const selectedFlag = selectFlagsElement.options[selectFlagsElement.selectedIndex].value;
      const testPathValue = document.getElementById('testPathInput').value;
      const testCommandValue = document.getElementById('testCommandInput').value;
      // document.getElementById('testStart'). = !testPathValue || !testCommandValue;
      document.getElementById('generatedTestCommand').innerText = `keploy test -c "${testCommandValue}"`;
      const flagValue = flagValueInput.value;
      options[selectedFlag] = flagValue;
      generateUpdate();
    }

    const flagValueInput = document.getElementById("flagValueInput");
    flagValueInput.addEventListener("input", () => flagChange());

    let options = {
    "removeUnusedMocks": "",
    "proxyport": "",
    "delay": "",
    "configPath": "",
    "testSets": "",
    "generateTestReport": "",
    "apiTimeout": "",
    "coverage": "",
    "passThroughPorts": "",
    "ignoreOrdering": "",
    "testPath": "",
    "mongoPassword": "",
    "debugMode": "",
    "withCoverage": "",
  };

    function generateUpdate() {
      selectFlagsElement.addEventListener("change", () => flagChange());
    }
  });
</script>

<a id="homeButton" class="navigationButton">
  <svg class="returnIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  </svg>
</a>

<span id="outputCt">
  <div id="outputDiv>
    <img
      src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
      alt="Test Logo"
    />
  </div>
    <h4 id="generatedTestCommand">keploy test -c ""</h4>
</span>
<div id="selectTestFolderDiv" class="testRowContainer">
  <button id="selectTestPathButton" class="secondaryButton">Select Path</button>
  <input
    type="text"
    id="testPathInput"
    name="testPath"
    placeholder="Enter Path"
  />
  <svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" />
    </svg>
    Enter Test Command
  <input
    type="text"
    id="testCommandInput"
    name="testCommand"
    placeholder="Enter Test Command"
  />
</div>
  <span id="flags">
    <input type="text" id="flagValueInput" placeholder="Enter Value" />
    <select id="selectTestFlagsDropdown">
      <option value="">Select Flag</option>
      {#each Object.keys(options) as flag}
        <option class="flagContent" value={flag}>{flag}</option>
      {/each}
    </select>
  </span>

<select id="selectTestCasesDropdown">
  <option value="Run all test cases">Run all test cases</option>
</select>
<button id="testStart">
  <span>Start Testing</span>
  <svg class="testIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
  </svg>
</button>
<div class="loader" id="testLoader"></div>
<button id="testStop">Stop Testing</button>
<style>

#outputCt {
  font-size: large;
  margin-bottom: 20px;
}

.testLogo {
  width: 50%;
  margin: 0 auto 15px;
}

.testLogo:hover {
  transform: scale(1.1);
}
#testStop {
  width: 80%;
  background-color: #dc3545;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  margin: 20px auto;
  display: block;
  transition: background-color 0.3s;
}

#testStop:hover {
  background-color: #c82333;
}

#summaryButton {
  display: none;
  width: 80%;
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  margin: 20px auto;
  transition: background-color 0.3s;
}

#summaryButton:hover {
  background-color: #0056b3;
}

.loader {
  display: none;
}

button {
  font-size: medium;
}

.test-svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.return-svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease-in-out;
}

</style>
