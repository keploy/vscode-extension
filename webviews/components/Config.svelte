<script>
  let showSettings = false;
  let appCommand = '';
  let path = './';
  let passThroughPorts = '';

  function handleSetupConfig() {
    showSettings = true;
  }

  function handleOAuthClick(provider) {
    vscode.postMessage({
      type: "navigate",
      value: provider,
    });
  }

  function handleSignIn() {
    vscode.postMessage({
      type: "signIn",
      value: "true",
    });
  }
</script>

<div class={showSettings ? "container-hide" : "container"}>
  <h1 class="heading">Welcome to Keploy</h1>
  <h2 class="subheading">Your AI Generator Tool</h2>
  <div class="image-container">
    <!-- Add your image here -->
  </div>
  <div class="oauth-buttons">
    <!-- <button class="oauth-button" on:click={() => handleOAuthClick('google')}>Login with Google</button>
    <button class="oauth-button microsoft" on:click={() => handleOAuthClick('microsoft')}>Login with Microsoft</button>
    <button class="oauth-button github" on:click={() => handleOAuthClick('github')}>Login with GitHub</button> -->
  </div>
  <div class="get-started">Get Started</div>
  <div class="description">
    Integrate Keploy by installing the open-source agent locally. No
    code-changes required.
  </div>
  <button class="button" id="setupConfig" on:click={handleSetupConfig}
    >Setup Keploy Config</button
  >
  <!-- <button class="button" on:click={handleSignIn}>Sign In</button> -->
</div>

<style>
  .container,
  .settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: left;
    height: 100vh;
    padding: 20px;
  }

  .get-started {
    margin-top: 20px;
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
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: #ff7a33;
  }

  .oauth-button {
    padding: 10px 20px;
    background-color: #4285f4; /* default color for google */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin: 10px;
    transition: background-color 0.3s ease;
  }

  .oauth-button:hover {
    background-color: #357ae8; /* slightly darker shade */
  }

  .oauth-button.microsoft {
    background-color: #f3f3f3;
    color: #000;
  }

  .oauth-button.microsoft:hover {
    background-color: #e0e0e0;
  }

  .oauth-button.github {
    background-color: #333;
    color: #fff;
  }

  .oauth-button.github:hover {
    background-color: #242424;
  }

  .heading {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
  }

  .subheading {
    font-size: 20px;
    margin-bottom: 20px;
    text-align: center;
  }

  .oauth-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
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