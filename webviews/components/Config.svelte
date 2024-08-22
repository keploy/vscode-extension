<script>
  let showSettings = false;

  const vscode = acquireVsCodeApi();

  function handleTestSelection(testType) {
    vscode.postMessage({
      type: "navigate",
      value: testType === "Unit Testing" ? "UtgDocs" : "",
    });
  }
</script>

<div class={showSettings ? "container-hide" : "main-container"}>
  <div class="section welcome-section">
    <h1 class="heading">
      Welcome to <img
        src="https://keploy.io/docs/img/keploy-logo-dark.svg"
        alt="Keploy"
        class="logo"
      />
    </h1>
  </div>

  <div class="section button-section">
    <button
      class="large-button unit-button"
      on:click={() => handleTestSelection("Unit Testing")}
      >Generate Unit Test</button
    >
  </div>

  <div class="section button-section">
    <button
      class="large-button integration-button"
      on:click={() => handleTestSelection("Integration Testing")}
      >Generate Integration Test</button
    >
  </div>
</div>

<div class={showSettings ? "settings-container" : "container-hide"}>
  <h1 class="heading">Initialise Keploy Config File</h1>
  <div class="settings-item">
    <div class="code-icon" alt="Icon"></div>
    <input
      type="text"
      placeholder="Enter Command to Run the Application"
      id="configCommand"
    />
  </div>
  <div class="settings-item">
    <div class="code-icon" alt="Icon"></div>
    <input
      type="text"
      placeholder="Enter Application Path (default : './')"
      id="configPath"
    />
  </div>
  <button class="button" id="initialiseConfigButton">Save Configuration</button>
</div>

<style>
  body {
    font-family: "Baloo 2", sans-serif;
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f4f4f4;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    text-align: center;
    padding: 0;
  }

  .welcome-section {
    flex-direction: column;
    max-height: 10vh;
    color: #ff914d;
  }

  .heading {
    font-size: 36px;
    font-weight: bold;
  }

  .logo {
    height: 40px;
    vertical-align: top;
  }

  .gif-container {
    margin-top: 10px;
    width: 100%;
    height: 150px; /* Adjust as needed */
    background-color: #dcdcdc;
  }

  .button-section {
    padding: 0;
    flex-direction: column;
  }

  .large-button {
    width: 100%;
    height: 100%;
    padding: 0;
    font-size: 28px;
    color: white;
    border: none;
    border-radius: 0; /* Remove border radius to make it fill the entire div */
    cursor: pointer;
    transition:
      transform 0.3s ease,
      background-color 0.3s ease;
    background-size: cover; /* Ensure the background image covers the entire button */
    background-position: center; /* Center the background image */
    background-repeat: no-repeat; /* Prevent the background image from repeating */
  }

  .large-button:hover {
    transform: scale(1.05); /* Slight zoom effect on hover */
  }

  .integration-button {
    /* background-image: url("https://images.unsplash.com/photo-1517167685284-96a27681ad75?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGFyayUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"); Replace with your image path */
    background-color: transparent; /* Fallback color */
  }

  .integration-button:hover {
    /* background-color: #ff914d; */
    color: #ff914d;
  }

  .unit-button {
    /* background-image: url("https://plus.unsplash.com/premium_photo-1686195842977-cf9e434d9a49?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZGFyayUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"); Replace with your image path */
    background-color: transparent; /* Fallback color */
    border-radius: 5px;
  }

  .unit-button:hover {
    /* background-color: #ff914d; */
    color: #ff914d;
  }

  .settings-container,
  .container-hide {
    display: none;
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .settings-item {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }

  .code-icon {
    margin-right: 10px;
  }

  .button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: #0056b3;
  }
</style>
