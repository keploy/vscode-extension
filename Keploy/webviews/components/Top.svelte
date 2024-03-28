 <script>
</script>

<body>
  <p class="logo"></p>
  <body>
      ▓██▓▄
    ▓▓▓▓██▓█▓▄
      ████████▓▒
            ▀▓▓███▄                   
          ▄▌▌▓▓████▄    
        ▓█████████▌▓▓   
        ▓▓▓▓▀▀▀▀▓▓▓▓▓▓▌  
        ▓▌                      
        ▓
    </body>
  <div id="recordCommandSection">
    <label for="recordCommandInput">Enter App Command:</label>
    <input type="text" id="recordCommandInput" name="command" />
    <span id="recordingButtons">
      <button id="startRecording">Start Recording</button>
      <button id="stopRecording">Stop Recording</button>
    </span>
  </div>
  <div id="testCommandSection">
    <label for="testCommandInput">Enter App Command:</label>
    <input type="text" id="testCommandInput" name="command" />
    <div id="testCasesContainer"></div>
    <div id="testButtons">
      <button id="startTesting">Start Testing</button>
      <button id="stopTesting">Stop Testing</button>
    </div>
  </div>
  <div class="loader" id="testLoader"></div>
    <a id="navigateHomeLink" class="homeLink">Return to Home</a>
    <div id="testSummary">
        <img
            class="testLogo"
            src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
            alt="Test Logo"
        />
        <h2 class="testInfo">Summary</h2>
    </div>
    <div id="testSummaryGrid">
        <div id="totalTestCases" class="testInfo">
            <p>Total Cases</p>
        </div>
        <div id="testCasesPassed">
            <p>Passed</p>
        </div>
        <div id="testCasesFailed">
            <p>Failed</p>
        </div>
    </div>
  <div id="utilityButtonsContainer">
    <button id="getLatestVersion">Latest version available</button>
    <button id="updateKeploy">Update Extension</button>
  </div>
</body>


<style>
  .loader {
      display: none;
  }
  #testSummary {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
  }
  #testSummary img {
      width: 50%;
  }
  #testSummaryGrid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      justify-items: center;
      margin-top: 20px;
  }
  .testInfo {
      display: flex;
      align-items: center;
      justify-content: center;
  }
  .success,
  .error {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: lightgray;
      padding: 10px;
      border-radius: 5px;
  }
  #runTestsAgain {
      margin: 20px auto;
      width: 75%;
      display: block;
      padding: 10px;
      border: none;
      border-radius: 5px;
      background-color: #3498db;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
  }
  #runTestsAgain:hover {
      background-color: #2980b9;
  }
</style>
