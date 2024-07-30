<script>
  let showSettings = false;
  let appCommand = '';
  let path = './';
  let passThroughPorts = '';
  import '../app.css';

  function handleSetupConfig() {
    showSettings = true;
  }
</script>

<body class="font-sans">
  <div class="keploylogo"></div>
  <div class={showSettings ? 'hidden' : 'flex flex-col items-center justify-center h-screen p-5 text-center'}>
    <div class="image-container"></div>
    <div class="mt-12 text-xl">Get Started</div>
    <div class="mt-2 text-base max-w-sm">
      Integrate Keploy by installing the open-source agent locally. No code-changes required.
    </div>
    <button 
      class="mt-5 px-5 py-2 bg-[#FF914D] text-white rounded-full text-xl cursor-pointer hover:bg-[#FF914D]"
      id="setupConfig" 
      on:click={handleSetupConfig}
    >
      Setup Keploy Config
    </button>
  </div>

  <div class={showSettings ? 'flex flex-col items-center justify-center h-screen p-5' : 'hidden'}>
    <h1 class="text-2xl mb-5 text-center">Initialise Keploy Config File</h1>
    <div class="flex items-center justify-between w-full max-w-sm p-2 mb-3 rounded-lg shadow-md">
      <div class="code-icon"></div>
      <input 
        type="text" 
        placeholder="Enter Command to Run the Application" 
        bind:value={appCommand} 
        id="configCommand"
        class="flex-grow ml-2 outline-none"
      >
    </div>
    <div class="flex items-center justify-between w-full max-w-sm p-2 mb-3 rounded-lg shadow-md">
      <div class="code-icon"></div>
      <input 
        type="text" 
        placeholder="Enter Application Path (default : './')" 
        bind:value={path} 
        id="configPath"
        class="flex-grow ml-2 outline-none"
      >
    </div>
    <button 
      class="mt-5 px-5 py-2 bg-[#FF914D] text-white rounded-full text-xl cursor-pointer hover:bg-[#FF914D]"
      id="initialiseConfigButton"
    >
      Save Configuration
    </button>
  </div>
</body>