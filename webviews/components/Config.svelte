<script>
  import { onMount } from "svelte";
  let showSettings = false;
  let appCommand = "";
  let path = "./";
  let passThroughPorts = "";
  const configNotFound = document.getElementById("keployConfigInfo");

  onMount(() => {
    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log("From Config",message)
      switch (message.type) {
        case "navigateToHome":
          vscode.postMessage({
            type: "navigate",
            value: "KeployHome",
          });

        case "configNotFound": {
          if (configNotFound) {
            configNotFound.classList.add("error");
            configNotFound.textContent = message.value;
          }
          const configInstruction = document.createElement("pre");
          configInstruction.classList.add("info");
          configInstruction.textContent = `Run the below command to generate the config file`;
          configNotFound.appendChild(configInstruction);
          const configCommand = document.createElement("pre");
          configCommand.classList.add("terminal");
          configCommand.textContent = `keploy config --generate`;
          configCommand.addEventListener("click", async () => {
            navigator.clipboard.writeText("keploy config --generate");
          });
          configNotFound.appendChild(configCommand);
        }

        case "configUninitialized": {
          try {
            const initialiseConfigDiv =
              document.getElementById("initialiseConfig");
            const keployConfigInfo =
              document.getElementById("keployConfigInfo");
            keployConfigInfo.style.display = "none";
            initialiseConfigDiv.style.display = "grid";
            initialiseConfigButton.style.display = "block";
          } catch (error) {
            console.log("error", error);
          }
        }
      }
    });
  });

  function handleSetupConfig() {
    showSettings = true;

    vscode.postMessage({
      type: "openConfigFile",
      value: `/keploy.yml`,
    });
  }

  function handleInitaliseConfig() {
    console.log("initialiseConfigButton clicked");
    vscode.postMessage({
      type: "initialiseConfig",
      value: `Initialise Config`,
      command: appCommand,
      path: path,
    });
  }
</script>

<body class="baloo-2-custom">
  <div class="keploylogo"></div>
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
  </div>

  <div class={showSettings ? "settings-container" : "container-hide"}>
    <h1 class="heading">Initialise Keploy Config File</h1>
    <div class="settings-item">
      <div class="code-icon" alt="Icon"></div>
      <input
        type="text"
        placeholder="Enter Command to Run the Application"
        bind:value={appCommand}
        id="configCommand"
      />
    </div>
    <div class="settings-item">
      <div class="code-icon" alt="Icon"></div>
      <input
        type="text"
        placeholder="Enter Application Path (default : './')"
        bind:value={path}
        id="configPath"
      />
    </div>
    <button
      class="button"
      id="initialiseConfigButton"
      on:click={handleInitaliseConfig}>Save Configuration</button
    >
  </div>
</body>

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
