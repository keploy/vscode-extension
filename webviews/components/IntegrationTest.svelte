<script>
  
  let showSettings = false;
  let appCommand = "";
  let path = "./";
  let passThroughPorts = "";
  let navigateToConfig = false;
  let navigateToConfig2 = false;
  const vscode = acquireVsCodeApi();

  function handleSetupConfig() {
    showSettings = true;
  }
  function NavigateToConfig() {
    navigateToConfig = true;
  }

  function NavigateToConfig2() {
    console.log("NavigateToConfig2");
    navigateToConfig2 = true;
  }

  function handleTestSelection(testType) {
    vscode.postMessage({
      type: "navigate",
      value: testType,
    });
  }
</script>

<body>
  <div class={"settings-container"}>
    <h1 class="main-heading">Steps to setup Config</h1>
    <button class="back-button" on:click={() => handleTestSelection("Config")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        class="bi bi-arrow-left"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M15 8a.5.5 0 0 1-.5.5H4.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L4.707 7.5H14.5A.5.5 0 0 1 15 8z"
        />
      </svg>
    </button>
    <div class="setting-Card-Container">
      <div class="InputContainer">
        <h1 class="heading">Enter the command that runs your application.</h1>
        <div class="settings-item">
          <input
            type="text"
            placeholder="Enter Command to Run the Application"
            bind:value={appCommand}
            id="configCommand"
          />
          <div class="language-icons">
            <div class="language-icons-row">
              <div class="icon-info">
                <span class="golang-icon"></span>
                <p>go run main.go</p>
              </div>
              <div class="icon-info">
                <span class="node-icon"></span>
                <p>npm run start</p>
              </div>
            </div>
            <div class="language-icons-row">
              <div class="icon-info">
                <span class="python-icon"></span>
                <p>Python3 main.py</p>
              </div>
              <div class="icon-info">
                <span class="java-icon"></span>
                <p>java xyz.jar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="buttonBlack" id="setupConfig"
        ><span class="BoldName" id="setupConfig">Save Configuration </span></button
      >
      <div class="stepper-container">
        <div class="step-line"></div>
        <div class="step">
          <span class="step-number">1. Setup Configuration</span>
          <div class="step-circle active"></div>
        </div>
        <div class="step">
          <div class="step-circle inactive"></div>
          <span class="step-number bottom">2. Record Test</span>
        </div>
        <div class="step">
          <!-- <div class="step-line"></div> -->
          <span class="step-number">3. Replay Test</span>
          <div class="step-circle inactive"></div>
        </div>
        <div class="step">
          <!-- <div class="step-line"></div> -->
          <div class="step-circle inactive"></div>
          <span class="step-number bottom">4. CI/CD setup</span>
        </div>
        <div class="step">
          <span class="step-number">5. Add users</span>
          <div class="step-circle inactive"></div>
        </div>
      </div>
    </div>
  </div>
</body>

<style>
  @font-face {
    font-family: "Montserrat";
    src:
      url("../../font/Montserrat-VariableFont_wght.ttf") format("woff2"),
      url("../../font/Montserrat-VariableFont_wght.ttf") format("woff");
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: "Montserrat";
    src:
      url("../../font/Montserrat-Italic-VariableFont_wght.ttf") format("woff2"),
      url("../../font/Montserrat-Italic-VariableFont_wght.ttf") format("woff");
    font-weight: 700;
    font-style: italic;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Montserrat", sans-serif; /* Use Montserrat here */
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background-color: #000;
  }

  .container,
  .settings-container {
    display: flex;
    flex-direction: column;
    text-align: left;
    height: 100%;
    padding: 2rem;
    background-color: black;
  }

  .setting-Card-Container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    height: 100%;
    padding: 2rem;
    background-color: black;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .main-heading {
    font-size: 2rem;
    text-align: center;
  }

  .buttonBlack {
    background-color: inherit;
    padding: 1rem;
    border-radius: 0.5rem;
    width: 60%;
    margin-top: auto;
    margin-bottom: auto;
    text-align: center;
    color: #e0e0e0;
    border: 2px solid #f77b3e;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .settings-item {
    align-items: center;
    width: 100%;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .settings-item input {
    flex-grow: 1;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  .settings-item input:focus {
    outline: none;
  }

  .golang-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/golang.png") no-repeat center center;
    background-size: contain;
  }

  .node-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/nodejs.png") no-repeat center center;
    background-size: contain;
  }

  .java-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/java.png") no-repeat center center;
    background-size: contain;
  }

  .python-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/python.png") no-repeat center center;
    background-size: contain;
  }

  .InputContainer {
    width: 100%;
    align-items: center;
    margin-bottom: 2rem;
  }

  .heading {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .BoldName {
    font-weight: bold;
  }

  .back-button {
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    background-color: inherit;
    cursor: pointer;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: start;
    width: 10%;
  }

  button:focus {
    outline: none; /* Remove the blue border on focus for all buttons */
  }
  button {
    outline: none; /* Remove the blue border on focus for all buttons */
  }

  .language-icons {
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    padding-right: 20px;
    gap: 0.5rem;
    margin-top: 20px;
  }

  .language-icons-row {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .icon-info {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .stepper-container {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-top: 50px;
    z-index: 1;
    scale: 120%;
    position: relative;
  }

  .step:nth-of-type(2) div {
    margin-right: auto;
  }

  .step:last-child {
    align-items: flex-end; /* Align last circle to the right */
    text-align: right;
  }

  .step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1rem;
    color: white;
    z-index: 2;
    flex: 1; /* Allows the steps to take equal space */
  }

  .step-number {
    position: absolute;
    top: -2.5rem; /* Adjust to position text above the circle */
    font-size: 0.9rem;
    color: white;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis; /* Add ellipsis if text is too long */
    padding: 0 0.5rem;
  }

  .step-number.bottom {
    top: 2.5rem; /* Adjust to position text below the circle */
  }

  .step-circle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: black;
    position: relative;
    z-index: 3;
  }

  .step-circle.active {
    border: 2px solid #ff914d;
  }

  .step-circle.inactive {
    border: 2px solid #969390;
  }

  .step-circle.active::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    background-color: #ff914d;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .step-circle.inactive::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    background-color: #969390;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .step-line {
    width: 100%;
    height: 2px;
    background-color: #ff914d;
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 1;
  }

  .step:not(:first-child) .step-line {
    left: 0;
  }

  .step:not(:last-child) .step-line::after {
    content: "";
    width: 100%;
    height: 2px;
    background-color: #ff914d;
    position: absolute;
    top: 0;
    left: 100%;
  }

  @media screen and (max-width: 768px) {
    .main-heading {
      font-size: 1.5rem;
    }

    .stepper-container {
      transform: scale(0.8);
    }

    .buttonBlack {
      font-size: 1rem;
      padding: 0.8rem;
    }

    .step-circle {
      width: 1.5rem;
      height: 1.5rem;
    }

    .step-circle.active::before,
    .step-circle.inactive::before {
      width: 0.75rem;
      height: 0.75rem;
    }
  }

  @media screen and (max-width: 480px) {
    .main-heading {
      font-size: 1.2rem;
    }

    .stepper-container {
      transform: scale(0.7);
    }

    .buttonBlack {
      font-size: 0.9rem;
      padding: 0.7rem;
    }

    .step-circle {
      width: 1.25rem;
      height: 1.25rem;
    }

    .step-circle.active::before,
    .step-circle.inactive::before {
      width: 0.6rem;
      height: 0.6rem;
    }
  }
</style>
