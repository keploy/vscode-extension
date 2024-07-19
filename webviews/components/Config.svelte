<script>
  let showSettings = false;
  let appCommand = '';
  let path = './';
  let passThroughPorts = '';

  function handleSetupConfig() {
    showSettings = true;
  }
</script>

<style>
  .container, .settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: left;
    height: 100vh;
    padding: 20px;
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
    background-color: #FF914D;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 20px;
    cursor: pointer;
  }

  .button:hover {
    background-color: #FF914D;
  }

  /* New UI Styles */
  .settings-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 300px;
    padding: 10px;
    margin: 10px 0;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  
  .settings-item input {
    flex-grow: 1;
  }

  .heading {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
  }

  .container-hide {
    display: none; /* Hide container when showSettings is true */
  }
</style>
<body class="baloo-2-custom">
<div class="keploylogo"></div>
<div class="{showSettings ? 'container-hide' : 'container'}">
  
  <div class="image-container">
  </div>
  <div class="get-started">Get Started</div>
  <div class="description">
    Integrate Keploy by installing the open-source agent locally. No code-changes required.
  </div>
  <button class="button" id="setupConfig" on:click={handleSetupConfig}>Setup Keploy Config</button>
</div>

<div class="{showSettings ? 'settings-container' : 'container-hide'}">
  <h1 class="heading">Initialise Keploy Config File</h1>
  <div class="settings-item">
    <div class="code-icon "alt="Icon" > </div>
    <input type="text" placeholder="Enter Command to Run the Application" bind:value={appCommand} id="configCommand">
  </div>
  <div class="settings-item">
    <div class="code-icon "alt="Icon" > </div>
    <input type="text" placeholder="Enter Application Path (default : './')" bind:value={path} id="configPath" >
  </div>
  <button class="button" id="initialiseConfigButton">Save Configuration</button>
</div>
</body>