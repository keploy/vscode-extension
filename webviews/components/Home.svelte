<script>
  // You can add any necessary script here
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: left;
    height: 100vh;
    /* background-color:  var(--vscode-foreground); */
    padding: 20px;
  }

  .image-container {
    position: relative;
    width: 250px;
    height: 150px;
    background: url('/path/to/your/image.png') no-repeat center center;
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
    /* color: #333; */
  }

  .description {
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
    /* color: #666; */
    max-width: 300px;
  }

  .button {
    margin-top: 20px;
    padding: 10px 20px;
    margin-top: 250px;
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
</style>

<div class="container">
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
  <button class="button" id="setupConfig">Setup Keploy Config</button>
</div>
