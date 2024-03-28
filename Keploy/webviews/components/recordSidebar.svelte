<script>
  import { onMount } from "svelte";

onMount(() => {
  document.getElementById("recordCommandInput").addEventListener("input", () => {
    document.getElementById("recordCommand").innerText =
      `keploy record -c "${document.getElementById("recordCommandInput").value}"`;
  });
  const selectoptionsElement = document.getElementById("selectoptionsDropdown");
  selectoptionsElement.addEventListener("change", () =>
    handleoptionValueChange(),
  );
  const optionValueInput = document.getElementById("optionValueInput");
  optionValueInput.addEventListener("input", () => handleoptionValueChange());
  function handleoptionValueChange() {
    const e = document.getElementById("selectoptionsDropdown");
    var selectedoption = e.options[e.selectedIndex].value;
    console.log("selectedoption : " + selectedoption);
    const optionValue = document.getElementById("optionValueInput").value;
    console.log("optionValue : " + optionValue);
    options[selectedoption] = optionValue;
    console.log(options);
    updateGeneratedCommand();
  }

  function updateGeneratedCommand() {
    let currentCommand = `keploy record -c "${document.getElementById(
      "recordCommandInput",
    ).value}"`;
    for (const [option, value] of Object.entries(options)) {
      if (value) {
        currentCommand += ` --${option}="${value}"`;
      }
    }
    document.getElementById("recordCommand").innerText =
      currentCommand;
  }

  let options = {
  "config-path": "",
  "delay": "",
  "passThroughPorts": "",
  "path": "",
  "proxyport": "",
  "debug": "",
};
});
</script>

<body>
  <a id="navigate">
    <svg class="returnSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z"/></svg>
   </a>
  <div id="outputContainer">
      <img
        class="keployLogo"
        src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
        alt="Keploy Logo"
      />   
    <div id="recordCommandContainer">
      <h4 id="recordCommand">keploy record</h4>
    </div>
  </div>

    <button id="selectRecordFolderButton" class="secondaryButton">Select Path</button>
    <input
      type="text"
      id="recordProjectFolderInput"
      name="projectFolder"
      placeholder="Enter Path"
    />
  <div id="appCommandContainer">
    <p id="commandEnter" disabled="true" class="secondaryButton"
      >
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
  <line x1="4" y1="6" x2="20" y2="6" />
  <line x1="4" y1="12" x2="20" y2="12" />
  <line x1="4" y1="18" x2="20" y2="18" />
</svg>

      Enter App Command</p
    >
    <input
      type="text"
      id="recordCommandInput"
      name="recordCommand"
      placeholder="Enter App Command"
    />
  </div>
  <div id="optionsContainer">
    <div id="options">
      <select id="selectoptionsDropdown">
        <option value="">Select option</option>
        {#each Object.keys(options) as option}
          <option class="optionContent" value={option}>{option}</option>
        {/each}
      </select>
    </div>
    <div id="optionValue">
      <input type="text" id="optionValueInput" placeholder="Value" />
    </div>
  </div>
  <button id="buttonRecord">
    <span>Start Recording</span>
    <svg class="recordSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"/></svg>
  </button>
  <div class="loader" id="loader"></div>
    <button id="buttonStop">Stop Recording</button>
</body>

<style>
    #navigate {
    width: 20%;
    font-size: small;
    text-align: center;
    padding: 5px;
    border-radius: 4px;
    background-color: white;
  }
  .homeButton {
    width: 20%;
    font-size: small;
    text-align: center;
    padding: 5px;
    border-radius: 4px;
    background-color: white;
  }
  .returnSvg {
    width: 14px;
    height: 14px;
    transition: transform 0.3s ease-in-out;
  }
  .keployLogo {
    margin-left: 90px;
    margin-bottom: 10px;
  }
  #recordCommandContainer {
    margin: 0 auto;
    text-align: center;
  }
  .rowContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .secondaryButton {
    padding: 2px 2px 2px 2px;
    margin: 0;
    width: 40%;
    font-size: small;
    border-radius: 5px;
  }
  #recordProjectFolderInput {
    flex: 1;
    padding: 8px;
    border: 1px solid #45a049;
    border-radius: 4px;
    font-size: small;
  }
  #appCommandContainer {
    display: table-column;
    place-items: center;
  }
  .icon {
    width: 16px;
    height: 16px;
    margin-right: 5px;
  }
  #recordCommandInput {
    flex: 1;
    border: 1px solid red;
    border-radius: 5px;
    width: 75%;
    margin-top: 2px;
  }
  .optionContent {
    width: 25%;
    background-color: black;
    color: white;
    border: 1px solid white;
    border-radius: 4px;
    margin-left: 1px;
    align-items: center;
  }

  .optionContent:hover {
    background-color: blue;
  }
  .recordSvg {
    width: 20px;
    height: 20px;
    transition: transform 0.3s ease-in-out;
  }
  #buttonStop {
    background-color: red;
    margin: 15px;
    width: 75%;
    margin: 15px;
  }
  #buttonRecord:disabled {
    background-color: rgb(80, 79, 79);
  }
  .rowContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  #statusR {
    text-align: center;
    display: none;
    margin: 20px;
    font-weight: bold;
  }

  #testCasesR {
    display: grid;
    grid-template-columns: 1fr;
    place-items: center;
  }
  #recordCommand {
margin: 0 auto;
text-align: center;
}
  #upperOutputDiv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
  }
  #selectRecordFolderButton{
    padding: 2px 2px 2px 2px;
    margin: 0;
    width: 40%;
    font-size: small; 
border-radius: 5px;
  }
  #selectRecordFolderButton:hover{
    border: 1px solid #1bdb44;
  }
#buttonRecord {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease-in-out;
  position: relative;
  width: 75%;
/* width: 200px; */
background-color: #3498db;
color: white;
}
#buttonRecord:hover {
background-color: #45a049;
}
button {
margin: 10px;
border-radius: 5px;
border: none;
}
#optionSelect {
display: flex;
flex-direction: row;
align-items: center; 
margin: 0 10px;
}
input {
margin: 10px;
}
#optionValueInput {
margin: 8px;
padding: 8px;
border: 1px solid #ccc;
border-radius: 4px;
font-size: small;
width:75%;
margin-right: 0.5px;
}
#navigate {
width: 20%;
font-size: small;
text-align: center;
padding: 5px;
border-radius: 4px;
background-color: white;
}
#buttonStop {
width: 75%;
background-color: red;
margin: 10px auto;
}
#buttonRecord:disabled {
background-color: rgb(80, 79, 79);
}
#statusR {
text-align: center;
display: none;
margin: 20px;
font-weight: bold;
}
#testCasesR {
display: grid;
grid-template-columns: 1fr;
place-items: center;
}
#commandEnter{
  padding: 10px;
  color: red;
  font-weight: 600;
  margin-left: 25px;
}
#commandEnter:hover{
  color: white;
}
#commandEnter {
  padding: 10px;
  color: red;
  font-weight: 600;
  margin-left: 10px; 
  display: flex;
  align-items: center; 
}

#commandEnter svg {
  width: 12px; 
  height: 12px;
  margin-right: 5px; 
}

#commandEnter:hover {
  color: white;
}
</style>
