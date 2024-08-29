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
    </div>
    <div class="stepper-container">
      <div class="step">
        <span class="step-number">1.</span> Setup Configuration
        <div class="step-circle active"></div>
      </div>
      <div class="step">
        <div class="step-line"></div>
        <span class="step-number">2.</span> Record Test
        <div class="step-circle"></div>
      </div>
      <div class="step">
        <div class="step-line"></div>
        <span class="step-number">3.</span> Replay Test
        <div class="step-circle"></div>
      </div>
      <div class="step">
        <div class="step-line"></div>
        <span class="step-number">4.</span> CI/CD setup
        <div class="step-circle"></div>
      </div>
      <div class="step">
        <div class="step-line"></div>
        <span class="step-number">5.</span> Add users
        <div class="step-circle"></div>
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
    height: 100vh;
    padding: 50px;
    background-color: black;
  }

  .setting-Card-Container{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    height: 100vh;
    padding: 40px;
    background-color: black; 
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  
  }
  .main-heading{
    font-size: 35px;
    text-align: center;
  }

  .get-started {
    margin-top: 50px;
    text-align: center;
    font-size: 18px;
  }

  .description {
    margin-top: 10px;
    text-align: center;
    font-size: 16px;
    max-width: 300px;
  }

  .button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #ff914d;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 20px;
    cursor: pointer;
  }

  .button:hover {
    background-color: #ff914d;
  }

  .buttonBlack{
    background-color: inherit;
    padding: 20px;
    border-radius: 10px;
    width: 100%; /* Full width on small screens */
    max-width: 45%; /* 45% width on larger screens */
    text-align: center;
    color: #e0e0e0;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  
  }

  .lang-icon {
    width: 24px;
    height: 24px;
  }

  /* New UI Styles */
  .settings-item {
    align-items: center;
    width: 100%;
    padding: 10px;
    margin: 10px 5px 0 0;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .settings-item input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 5px;
  }

  .InputContainer{
    width: 70%; 
    align-items: center;
    margin-bottom: 30px;
  }

  .heading {
    font-size: 18px;
    margin-bottom: 5px;
    text-align: center;
  }

  .subHeader{
    font-size: 13px;
    text-align: center;
  }

  .BoldName {
    font-weight: bold;
  }

  .back-button{
    color: #ffffff;
    border: none;
    border-radius: 5px;
    background-color: inherit;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
  
  }

  .language-icons {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }


  .container-hide {
    display: none; /* Hide container when showSettings is true */
  }

  .stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  padding: 0 10px;
}

.step {
  display: flex;
  align-items: center;
  position: relative;
  font-size: 18px;
  color: white;
}

.step-number {
  margin-right: 10px;
  font-weight: bold;
}

.step-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ff914d;
  background-color: #333;
  position: relative;
}

.step-circle.active {
  background-color: #ff914d;
}

.step-line {
  width: 100px;
  height: 2px;
  background-color: #ff914d;
  position: absolute;
  top: 50%;
  left: -50px;
  z-index: -1;
}

.step:not(:first-child) .step-line {
  left: 10px;
  right: -50px;
}

.step:not(:last-child) .step-line:after {
  content: '';
  width: 100px;
  height: 2px;
  background-color: #ff914d;
  position: absolute;
  top: 0;
  left: 100%;
}

</style>
