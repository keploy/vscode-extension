<script>
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
      })
      .catch((error) => {
        console.error('Failed to copy text to clipboard:', error);
      });
  }
</script>

<body>
  <div id="mainGrid">
    <div id="topGrid">
    <img
      class="keploylogo"
      src="https://avatars.githubusercontent.com/u/92252339?s=200&v=4"
      alt="Keploy Logo"
    />
      <div>
    <h2 class="mainHeading">AI Generated Tests</h2>
      <h2 class="mainHeading">that actually work!</h2>
  </div>
  </div>
    <div class="gettingStartedContainer">
     <h2> Getting Started</h2>
<h2 class="step" >1. Installing 📥</h2>
<h5>Integrate Keploy by installing the open-source agent locally. No code-changes required.</h5>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<pre class="terminal" on:click={() => copyToClipboard(' curl --silent -O -L https://keploy.io/install.sh && source install.sh')}>curl -O -L
  https://keploy.io/install.sh 
  && source install.sh
  </pre>
 
<h2 class="step">2. Record 🎬</h2>
<h5>Start your app with keploy to convert API calls as tests and mocks/stubs. Make some API calls to your app.</h5>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<pre class="terminal" on:click={() => copyToClipboard('keploy record -c CMD_TO_RUN_APP')}>keploy record -c CMD_TO_RUN_APP</pre>

<h2 class="step">3. Test 🧪</h2>
<h5>Shut down Database , Redis , Kafka and other services. Keploy don't need those during test.</h5>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<pre class="terminal" on:click={() => copyToClipboard('keploy test -c CMD_TO_RUN_APP --delay 10')}>keploy test -c CMD_TO_RUN_APP --delay 10</pre>

<button id="openRecordPageButton">Try It Now</button>
    </div>
  </div>
</body>

<style>
.terminal {
  cursor:copy;
  background-color: #212121; 
  color: #fff; 
  font-family: 'Courier New', Courier, monospace; 
  padding: 10px 5px;
  border-radius: 5px;
}

#topGrid {
  display: grid;
  place-items: center;
  grid-template-columns: 1fr ;
  /* gap: 10px; */
}

.terminal:hover {
  background-color: #333;
}
#mainGrid {
  display: grid;
  place-items: center;
  align-items: center;
  text-wrap: wrap;
  gap: 20px;
  text-align: center;
}
#mainGrid img {
  width: 100px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
#mainGrid{
  height: 100%;
}
.gettingStartedContainer {
  text-align: center;
  padding: 10px ;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

h2 {
  font-size: 16px;
  margin-bottom: 10px;
}

.step {
  color: #ff914d;
  font-size: 12px;
  margin-bottom: 10px;
}

 pre{
  color: #ff914d;
  margin-bottom: 10px;
  font-size: 10px;
}
 
button {
  background-color: #C95919;
  padding: 10px; 
  border: none;
  border-radius: 5px;
  cursor: pointer;  
  font-size: 12px;
  margin-top: 10px;  
}

</style>
