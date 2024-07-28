<script>
  let showSettings = false;
  let appCommand = '';
  let noise = '';
  let passThroughPorts = '';

  const vscode = acquireVsCodeApi();

  function handleSetupConfig() {
    showSettings = true;
  }

  function handleOAuthClick(provider) {
    vscode.postMessage({
      type: 'navigate',
      value: provider,
    });
  }

  function handleSignIn() {
    vscode.postMessage({
      type: 'navigate',
      value: 'Option',
    });
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
    margin-top: 20px;
    text-align: center;
    font-size: 18px;
  }

  .description {
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
    max-width: 300px;
  }

  .button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #FF914D;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: #FF7A33;
  }

  .oauth-button {
    padding: 10px 20px;
    background-color: #4285F4; /* default color for google */
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin: 10px;
    transition: background-color 0.3s ease;
  }

  .oauth-button:hover {
    background-color: #357AE8; /* slightly darker shade */
  }

  .oauth-button.microsoft {
    background-color: #F3F3F3;
    color: #000;
  }

  .oauth-button.microsoft:hover {
    background-color: #E0E0E0;
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

<div class="{showSettings ? 'container-hide' : 'container'}">
  <h1 class="heading">Welcome to Keploy</h1>
  <h2 class="subheading">Your AI Generator Tool</h2>
  <div class="image-container">
    <!-- Add your image here -->
  </div>
  <div class="oauth-buttons">
    <button class="oauth-button" on:click={() => handleOAuthClick('google')}>Login with Google</button>
    <button class="oauth-button microsoft" on:click={() => handleOAuthClick('microsoft')}>Login with Microsoft</button>
    <button class="oauth-button github" on:click={() => handleOAuthClick('github')}>Login with GitHub</button>
  </div>
  <div class="get-started">Get Started</div>
  <div class="description">
    Integrate Keploy by installing the open-source agent locally. No code-changes required.
  </div>
  <button class="button" id="setupConfig" on:click={handleSetupConfig}>Setup Keploy Config</button>
  <button class="button" on:click={handleSignIn}>Sign In</button>
</div>
