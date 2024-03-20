<script>
  import { onMount } from "svelte";

  let flags = {
    "config-path": "",
    "delay": "",
    "passThroughPorts": "",
    "path": "",
    "proxyport": "",
    "debug": "",
  };

  onMount(() => {
    document
      .getElementById("recordProjectFolder")
      .addEventListener("input", () => {
        if (
          document.getElementById("recordProjectFolder").value &&
          document.getElementById("recordCommand").value
        ) {
          document.getElementById("startRecordingButton").disabled = false;
        }
      });
    document.getElementById("recordCommand").addEventListener("input", () => {
      if (
        document.getElementById("recordProjectFolder").value &&
        document.getElementById("recordCommand").value
      ) {
        document.getElementById("startRecordingButton").disabled = false;
      }
    });
    //change the value of the generatedRecordCommand when the recordCommand is filled
    document.getElementById("recordCommand").addEventListener("input", () => {
      document.getElementById("generatedRecordCommand").innerText =
        `keploy record -c "${document.getElementById("recordCommand").value}"`;
    });
    const selectFlagsElement = document.getElementById("selectflags");
    selectFlagsElement.addEventListener("change", () =>
      handleFlagValueChange(),
    );
    const flagValueInput = document.getElementById("flagValueInput");
    flagValueInput.addEventListener("input", () => handleFlagValueChange());
    function handleFlagValueChange() {
      const e = document.getElementById("selectflags");
      var selectedFlag = e.options[e.selectedIndex].value;
      console.log("selectedFlag : " + selectedFlag);
      const flagValue = document.getElementById("flagValueInput").value;
      console.log("flagValue : " + flagValue);
      flags[selectedFlag] = flagValue;
      console.log(flags);
      updateGeneratedCommand();
    }

    function updateGeneratedCommand() {
      let currentCommand = `keploy record -c "${document.getElementById(
        "recordCommand",
      ).value}"`;
      for (const [flag, value] of Object.entries(flags)) {
        if (value) {
          currentCommand += ` --${flag}="${value}"`;
        }
      }
      document.getElementById("generatedRecordCommand").innerText =
        currentCommand;
    }
  });
</script>

<body>
  <a id="navigateHomeButton" class="homebutton"> Home </a>
  <div id="outputDiv">
    <div id="upperOutputDiv">
      <img
        class="keploylogo"
        src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
        alt="Keploy Logo"
      />
      <h4>Command</h4>
    </div>
    <div id="recordCommandDiv">
      <h4 id="generatedRecordCommand">keploy record</h4>
    </div>
    
  </div>
  <hr id="upperHR" />
  <div id="selectFolderDiv">
    <button id="selectRecordFolderButton" class="secondary"
      >Select Project Folder</button
    >
    <input
      type="text"
      id="recordProjectFolder"
      name="projectFolder"
      placeholder="Enter Manual Path"
    />
  </div>
  <div id="appCommandDiv">
    <button id="enterAppCommandButton" disabled="true" class="secondary"
      >Enter App Command</button
    >
    <input
      type="text"
      id="recordCommand"
      name="recordCommand"
      placeholder="Enter App Command"
    />
  </div>
  <div id="flagsDiv">
    <div id="flags">
      <select id="selectflags">
        <option value="" disabled selected>Select Flag</option>
        {#each Object.keys(flags) as flag}
          <option value={flag}>{flag}</option>
        {/each}
      </select>
    </div>
    <div id="flagValue">
      <input type="text" id="flagValueInput" placeholder="Enter Value" />
    </div>
  </div>
  <button id="startRecordingButton" disabled="true">Start Recording</button>
  <hr id="lowerHR" />
  <div class="loader" id="loader"></div>
    <button id="stopRecordingButton">Stop Recording</button>
    <h3 id="recordStatus"> </h3>
    <div id="recordedTestCases"></div>  
</body>

<style>
  #flagsDiv,
  #upperOutputDiv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
  }
  #flagsDiv {
    margin: 10px;
  }
  #lowerHR{
    display: none;
  }
  .keploylogo {
    width: 40%;
  }
  #outputDiv {
    font-size: medium;
  }
  #startRecordingButton {
    margin: 20px auto;
  }
  button {
    margin: 10px;
    width: 75%;
    border-radius: 5px;
    border: none;
  }
  #selectFolderDiv,
  #appCommandDiv {
    display: grid;
    place-items: center;
  }
  #selectFolderDiv {
    margin:  0 20px;
  }

  input {
    width: 95%;
    margin: 10px;
  }
  #selectflags {
    width: 2fr;
    margin: auto 0;
  }
  #generatedRecordCommand {
    margin: 0 auto;
    text-align: center;
  }
  #navigateHomeButton {
    width: 20%;
    font-size: small;
    text-align: center;
    margin: 0;
  }
  #stopRecordingButton {
    width: 75%;
    background-color: red;
    margin: 10px auto;
  }
  #startRecordingButton:disabled {
    background-color: rgb(80, 79, 79);
  }
  #recordStatus {
    text-align: center;
    display: none;
    margin: 20px;
    font-weight: bold;
  }
  #recordedTestCases {
    display: grid;
    grid-template-columns: 1fr;
    place-items: center;
  }
  .loader {
    display: none;
  }
  button{
    font-size: small;
  }
</style>
