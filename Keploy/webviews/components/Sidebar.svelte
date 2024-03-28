<script>
  let loading = false;
  let actionButtonId = 'openRecordPageButton';
  let selectedCode = '';

  const handleSubmit = () => {
    loading = true;
    console.log(actionButtonId);
    answerPrompt(prompt, selectedCode, selectedCode, apikey)
      .then((data) => {
        loading = false;
        text = data;
        getTypingEffect(text);
      })
      .catch((err) => {
        initializeVariables();
        tsvscode.postMessage({
          type: "onError",
          value: "Error: Please check your API key.",
        });
      });

    promptSelection = false;
  };

  let activeTab = 'Tab1'; 

  const setActiveTab = (tab) => {
    activeTab = tab;
  };
</script>

<body>
    <img
      class="keploylogo"
      src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
      alt="Keploy Logo"
    />
  <div class="buttons-container">
    <button id="openRecordPageButton" class="action-button record-button" on:click={handleSubmit} disabled={loading}>
      <span>Record Test Cases</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"/></svg>
    </button>
    
    <button id="openTestPageButton" class="action-button test-button" on:click={handleSubmit} disabled={loading}>
      <span>Run Test Cases</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
    </button>
    
    <button id="runCustomCommandButton" class="action-button log-button" on:click={handleSubmit} disabled=rue>
      <span>Generate Log</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm96-114.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/></svg>
    </button>
  </div>
<div class="tabs">
  <button class="tab" class:active={activeTab === 'Tab1'} on:click={() => setActiveTab('Tab1')}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5m0-6l7-4 7 4m-7-4v12"/>
    </svg>
  </button>
  <button class="tab" class:active={activeTab === 'Tab2'} on:click={() => setActiveTab('Tab2')}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h4a4 4 0 0 1 0 8h-4a4 4 0 0 1 0-8z"/>
    </svg>
  </button>
  <button class="tab" class:active={activeTab === 'Tab3'} on:click={() => setActiveTab('Tab3')}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  </button>
</div>

<div class="tab-content">
  {#if activeTab === 'Tab1'}
    <p class="tab-text">No test cases recorded.</p>
  {:else if activeTab === 'Tab2'}
    <p class="tab-text">No test cases tested.</p>
  {:else if activeTab === 'Tab3'}
    <p class="tab-text">No errors were found.</p>
  {/if}
</div>
</body>

<style>
  .keploylogo{
    margin-left: 90px;
  }
  .keploylogo:hover{
    transition: transform 0.3s ease-in-out;
  transform: rotate(360deg)
  }
  .buttons-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease-in-out;
  position: relative;
}

.action-button span {
  margin-right: 10px;
}

.record-button {
  background-color: #3498db;
  color: #fff;
}

.test-button {
  background-color: #27ae60;
  color: #fff;
}

.log-button {
  background-color: #f39c12;
  color: #fff;
}

.action-button:hover {
  filter: brightness(1.1);
}
  img {
    width: 40%;
  }

.action-button:hover svg {
  animation: rotate 1s linear infinite;
}
svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease-in-out;
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }}
  .tabs {
  display: flex;
  background-color: #474747;
  border-radius: 4px;
}
  #runCustomCommandButton:disabled {
    background-color: rgb(80, 79, 79);
  }
.tab {
  border: none;
  background: none;
  cursor: pointer;
  padding: 5px;
}

.tab-content {
  margin: 2px;
}

.tab-content p {
  margin: 2px;
  background-color: #3d4045;
  flex: 1;
}

.tab.active {
  color: #000;
  border-bottom: 2px solid #bdbbbb;
}

  .tab:hover {
    background-color: #3879fa;
  }

  .tabs .tab svg {
  width: 20px;
  height: 20px;
}
  .tabs .tab svg:hover {
    transition: transform 0.3s ease-in-out;
  transform: rotate(180deg)
  }
  .tab-text{
    color: red;
  }
  
</style>
