
<script>
      import { onMount } from "svelte";

  //enable the startTestingButton when the testProjectFolder and testCommand are filled
  onMount(()=>{
    document.getElementById('testProjectFolder').addEventListener('input',()=>{
      if(document.getElementById('testProjectFolder').value && document.getElementById('testCommand').value){
        document.getElementById('startTestingButton').disabled = false;
      }
    })
    document.getElementById('testCommand').addEventListener('input',()=>{
      if(document.getElementById('testProjectFolder').value && document.getElementById('testCommand').value){
        document.getElementById('startTestingButton').disabled = false;
      }
    })
    //change the value of the generatedtestCommand when the testCommand is filled
    document.getElementById('testCommand').addEventListener('input',()=>{
      document.getElementById('generatedTestCommand').innerText = `keploy test -c "${document.getElementById('testCommand').value}"`;
    })


  })
</script>
<a id="navigateHomeButton" class="homebutton"> Home </a>

<body>
  <div id="selectFolderDiv">
    <button id="selectTestFolderButton" class="secondary"
      >Select Project Folder</button
    >
    <input
      type="text"
      id="testProjectFolder"
      name="testProjectFolder"
      placeholder="Enter Manual Path"
    />
  </div>
  <div id="appCommandDiv">
    <button id="enterAppCommandButton" disabled="true" class="secondary"
      >Enter App Command</button
    >
    <input
      type="text"
      id="testCommand"
      name="testCommand"
      placeholder="Enter App Command"
    />
  </div>
  <div id="flagsDiv">
    <div id="flags">
      <select id="selectflags">
        <option value="manual">Flag 1</option>
        <option value="record">Flag 2</option>
      </select>
    </div>
    <div id="flagValue">
      <select id="selectflagValue">
        <option value="manual">True</option>
        <option value="record">False</option>
      </select>
    </div>
  </div>
  <select id="selectTestCases" >
    <option value="Run all test cases">Run all test cases</option>
    <option value="Test-Case-1">Test-Case-1</option>
    <option value="Test-Case-2">Test-Case-2</option>
  </select>
  <button id="startTestingButton" disabled="true">Start Testing</button>
  <hr />
  <div id="outputDiv">
    <div id="upperOutputDiv">
      <img
        class="keploylogo"
        src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
        alt="Keploy Logo"
      />
      <h3>Command</h3>
    </div>
    <div id="testCommandDiv">
      <h1 id="generatedTestCommand">keploy test -c ""</h1>
    </div>
    <div class="loader" id="loader"></div>
    <button id="stopTestingButton">Stop Testing</button>
    <h3 id="testStatus"> </h3>
    <div id="testResults">
    </div>
    <button id="viewCompleteSummaryButton">View Complete Test Summary</button>

  </div>
</body>

<style>
  #flagsDiv,
  #upperOutputDiv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
  }
  .keploylogo {
    width: 50%;
  }
  #selectTestCases {
    margin: 20px auto;
    width: 85%;
  }
  #startTestingButton {
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
    margin: 20px;
  }

  input {
    width: 95%;
    margin: 10px;
  }
  #selectflags,
  #selectflagValue {
    width: 2fr;
    margin: auto 0;
  }
  #generatedTestCommand{
    margin: 0 auto;
    text-align: center;
  }
  #startTestingButton:disabled{
    background-color: rgb(80, 79, 79);
  }
  #navigateHomeButton{
    width: 20%;
    font-size: small;
    text-align: center;
    margin: 0;
  }
  #stopTestingButton{
    width: 75%;
    background-color: red;
    margin: 10px auto ;
  }
  #testResults{
    margin: 20px auto;
    text-align: center;
    display: grid;
    place-items: center;
    grid-template-columns: 1fr;
    }
    #testStatus{
      text-align: center;
      display: none;
    }
    #viewCompleteSummaryButton{
      display: none;
      width: 75%;
      margin: 10px auto;
    }
    .loader{
      display: none;
    }
</style>
