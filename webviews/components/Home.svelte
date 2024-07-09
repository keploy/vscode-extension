<script>
  let showSettings = false;
  let appCommand = '';
  let noise = '';
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

  .image-container {
    position: relative;
    width: 250px;
    height: 150px;
    background: url('/mnt/data/image.png') no-repeat center center;
    background-size: contain;
  }

  .tag {
    position: absolute;
    background-color: white;
    border-radius: 10px;
    padding: 2px 10px;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .tag-html { top: 100px; left: 10px; }
  .tag-api { top: 10px; left: 50px; }
  .tag-test { top: 10px; right: 50px; }
  .tag-mock { top: 70px; right: 10px; }

  .get-started {
    margin-top: 150px;
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
    background-color: #ff7e47;
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
  }

  .button:hover {
    background-color: #ff5722;
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

  .settings-item img {
    width: 30px;
    height: 30px;
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

<div class="{showSettings ? 'container-hide' : 'container'}">
  <div class="image-container">
    <div class="tag tag-html">HTML</div>
    <div class="tag tag-api">API Calls</div>
    <div class="tag tag-test">Test Cases</div>
    <div class="tag tag-mock">Data Mocks</div>
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
    <img src="/path/to/your/icon.png" alt="Icon">
    <input type="text" placeholder="Enter App Command" bind:value={appCommand} id="configCommand">
  </div>
  <div class="settings-item">
    <img src="/path/to/your/icon.png" alt="Icon">
    <input type="text" placeholder="Enter Path (Default : './'" bind:value={noise} id="configPath">
  </div>
  <button class="button" id="initialiseConfigButton">Save Configuration</button>
</div>
