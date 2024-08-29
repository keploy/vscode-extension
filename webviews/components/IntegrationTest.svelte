<script>
  let showSettings = false;
  let appCommand = "";
  let path = "./";
  let passThroughPorts = "";
  let navigateToConfig = false;
  let navigateToConfig2 = false;

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
</script>

<body class="baloo-2-custom">
  {#if !showSettings}
    <div class={"keploylogo"}></div>
  {/if}

  <div class={showSettings ? "container-hide" : "container"}>
    <div class="image-container"></div>
    <div class="get-started">Get Started</div>
    <div class="description">
      Integrate Keploy by installing the open-source agent locally. No
      code-changes required.
    </div>
    <button class="button" id="setupConfig" on:click={handleSetupConfig}
      >Setup Keploy Config</button
    >
    <button class="button" id="backtoHome" on:click={NavigateToConfig}>
      Back
    </button>
  </div>

  <div class={showSettings ? "settings-container" : "container-hide"}>
    <h1 class="main-heading">Steps to setup Config</h1>
    <div class="back-button" on:click={NavigateToConfig2}>
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
    </div>
    <div class="setting-Card-Container">
    <div class="InputContainer">
      <h1 class="heading">
        <span class="BoldName">Step 1:</span> Enter the command that runs your application
      </h1>
      <div class="settings-item">
        <input
          type="text"
          placeholder="Enter Command to Run the Application"
          bind:value={appCommand}
          id="configCommand"
        />
        <div class="language-icons">
          <img src="/media/codelens.png" alt="Java" class="lang-icon" />
          <img src="/path/to/go-icon.svg" alt="Go" class="lang-icon" />
          <img src="/path/to/python-icon.svg" alt="Python" class="lang-icon" />
          <img src="/path/to/nodejs-icon.svg" alt="Node.js" class="lang-icon" />
        </div>
      </div>
    </div>
    <div class="InputContainer">
      <h1 class="heading">
        <span class="BoldName">Step 2:</span> Enter the root directory of your project
      </h1>
      <div class="settings-item">
        <input
          type="text"
          placeholder="Enter Application Path (default : './')"
          bind:value={path}
          id="configPath"
        />
      </div>
      <h1 class="subHeader">Eg : cd /path/to/my-awesome-app</h1>
    </div>
    <button class="buttonBlack" id="initialiseConfigButton"
      ><span class="BoldName">Save Configuration </span></button
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

.get-started {
  margin-top: 2rem;
  text-align: center;
  font-size: 1.2rem;
}

.description {
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.button {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #ff914d;
  color: white;
  border: none;
  border-radius: 1rem;
  font-size: 1.2rem;
  cursor: pointer;
}

.button:hover {
  background-color: #ff914d;
}

.buttonBlack {
  background-color: inherit;
  padding: 1rem;
  border-radius: 0.5rem;
  width: 100%;
  text-align: center;
  color: #e0e0e0;
  border: 2px solid #f77b3e;
  transition: all 0.3s ease;
  box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
}

.lang-icon {
  width: 2rem;
  height: 2rem;
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

.subHeader {
  font-size: 1rem;
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
}

.language-icons {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.container-hide {
  display: none;
}

.stepper-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: auto;
  margin-bottom: 20px;
  z-index: 1;
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
  white-space: nowrap; /* Prevent text from overflowing horizontally */
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
  content: '';
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
  content: '';
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
  content: '';
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

  .get-started {
    font-size: 1rem;
  }

  .description {
    font-size: 0.9rem;
  }

  .stepper-container {
    transform: scale(0.8);
  }

  .button, .buttonBlack {
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

  .get-started {
    font-size: 0.8rem;
  }

  .description {
    font-size: 0.8rem;
  }

  .stepper-container {
    transform: scale(0.7);
  }

  .button, .buttonBlack {
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
