<script>
</script>

<body>
  <div id="topGrid">
    <img
      class="keploylogo"
      src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
      alt="Keploy Logo"
    />
    <div class="lastTestResultsContainer">
      <h2>Last Test Results</h2>
      <div class="loader" id="loader"></div>
      <div id="lastTestResults" ></div>
    </div>
  </div>
  <hr />
  <div id="buttonsDiv">
    <button id="openRecordPageButton">Record Test Cases</button>
    <button id="openTestPageButton">Run Test Cases</button>
    <button id="runCustomCommandButton" disabled="true"
      >Run Custom Command</button
    >
  </div>
  <hr />
  <div id="configurationsDiv">
    <div id="configurations">
      <h4>Your Configurations</h4>
      <ul>
        <li>Config 1</li>
        <li>Config 2</li>
        <li>Config 3</li>
      </ul>
    </div>
    <div id="configurationsButtons">
      <button id="customizeConfigButton" disabled="true">Change</button>
      <button id="resetConfigButton" disabled="true">Reset</button>
    </div>
  </div>
</body>

<style>
  #topGrid {
    display: grid;
    place-items: center;
    grid-template-columns: 1fr 1fr;
  }
  #topGrid img {
    width: 50%;
  }
  #buttonsDiv {
    display: grid;
    place-items: center;
    margin: auto 0;
  }
  #lastTestResults {
    display: grid;
    place-items: center;
    margin: 20px auto;
  }
  #configurationsDiv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
    text-align: center;
  }
  #configurations {
    font-size: 1.3em;
  }
  #configurationsButtons {
    text-align: center;
    font-size: x-small;
  }
  
  button {
    margin: 10px;
    width: 75%;
    border-radius: 5px;
    border: none;
  }
  #runCustomCommandButton:disabled {
    background-color: rgb(80, 79, 79);
  }
  .lastTestResultsContainer{
    text-align: center;
  }
  

  
</style>
