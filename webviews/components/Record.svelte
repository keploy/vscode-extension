

<script>
    import { onMount } from "svelte";

  //enable the startRecordingButton when the recordProjectFolder and recordCommand are filled
  onMount(()=>{
    document.getElementById('recordProjectFolder').addEventListener('input',()=>{
      if(document.getElementById('recordProjectFolder').value && document.getElementById('recordCommand').value){
        document.getElementById('startRecordingButton').disabled = false;
      }
    })
    document.getElementById('recordCommand').addEventListener('input',()=>{
      if(document.getElementById('recordProjectFolder').value && document.getElementById('recordCommand').value){
        document.getElementById('startRecordingButton').disabled = false;
      }
    })
    //change the value of the generatedRecordCommand when the recordCommand is filled
    document.getElementById('recordCommand').addEventListener('input',()=>{
      document.getElementById('generatedRecordCommand').innerText = `keploy record -c "${document.getElementById('recordCommand').value}"`;
    })


  })
</script>

<body>
    <a id="navigateHomeButton" class="homebutton"> Home </a>
  
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
  <button id="startRecordingButton" disabled="true">Start Recording</button>
  
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
    <div id="recordCommandDiv">
      <h1 id="generatedRecordCommand">keploy record -c ""</h1>
    </div>
    <button id="stopRecordingButton">Stop Recording</button>
    <h3 id="recordStatus"> </h3>
    <div id="recordedTestCases">
      
    </div>
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
  hr {
    margin: 0;
    width: 80%;
    text-align: center;
    margin: 20px auto;
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
  #generatedRecordCommand{
    margin: 0 auto;
    text-align: center;
  }
  #navigateHomeButton{
    width: 20%;
    font-size: small;
    text-align: center;
    margin: 0;
  }
  #stopRecordingButton{
    width: 75%;
    background-color: red;
    margin: 10px auto ;
  }
  #startRecordingButton:disabled{
    background-color: rgb(80, 79, 79);
  }
  #recordStatus{
    text-align: center;
    display: none;
    margin: 20px;
    font-weight: bold;
  }
  #recordedTestCases{
    display: grid;
    grid-template-columns: 1fr;
    place-items: center;

  }
  
  
</style>
