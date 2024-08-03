<script>
  let sourceFilePath = '';
  let testFilePath = '';
  let testCommand = '';
  let coverageReportPath = '';

  const vscode = acquireVsCodeApi();

  function handleSubmit() {
    // Logic to handle form submission
    console.log({
      sourceFilePath,
      testFilePath,
      testCommand,
      coverageReportPath
    });
  }

  function handleBackClick() {
    vscode.postMessage({
      type: 'navigate',
      value: 'ChooseLanguage',
    });
  }

  // Placeholder values based on selected language
  $: if (vscode.getState() && vscode.getState().language) {
    const language = vscode.getState().language;
    if (language === 'JS' || language === 'Java' || language === 'Python') {
      sourceFilePath = './src/routes/routes.js';
      testFilePath = './test/routes.test.js';
      testCommand = 'npm test';
      coverageReportPath = './coverage/cobertura-coverage.xml';
    } else if (language === 'Go') {
      sourceFilePath = 'app.go';
      testFilePath = 'app_test.go';
      testCommand = 'go test -v ./... -coverprofile=coverage.out && gocov convert coverage.out | gocov-xml > coverage.xml';
      coverageReportPath = './coverage.xml';
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&display=swap');

  body, html {
    font-family: 'Baloo 2', cursive;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #ff6f61, #d4af37);
    color: #fff;
    box-sizing: border-box;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    height: 100%;
    max-width: 600px;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .title {
    font-size: 28px;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .instructions {
    font-size: 16px;
    color: #f3e6dff5; /* Darker font color */
    text-align: left;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.197); /* Lighter background */
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .instructions ol {
    margin: 0;
    padding-left: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    font-size: 16px;
    margin-bottom: 5px;
    display: block;
    text-align: left;
  }

  input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .button {
    padding: 15px 30px;
    font-size: 18px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #fff;
    background-color: #ff914d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
    margin-top: 10px;
  }

  .button:hover {
    background-color: #d4af37;
    transform: translateY(-5px);
  }

  .back-button {
    background-color: #333;
  }

  .back-button:hover {
    background-color: #555;
  }
</style>

<div class="container">
  <div class="title">Generate Your Keploy Unit Tests</div>
  <div class="instructions">
    <ol>
      <li>Keploy UTG needs coverage report in cobertura format. For information visit - <a href="https://keploy.io/docs/running-keploy/unit-test-generator/" target="_blank" style="color: #ff914d;">Keploy Documentation</a>.</li>
      <li>Make sure you are connected to the internet.</li>
    </ol>
  </div>
  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="sourceFilePath">Source File Path</label>
      <input
        type="text"
        id="sourceFilePath"
        bind:value={sourceFilePath}
        placeholder={sourceFilePath}
      />
    </div>
    <div class="form-group">
      <label for="testFilePath">Test File Path</label>
      <input
        type="text"
        id="testFilePath"
        bind:value={testFilePath}
        placeholder={testFilePath}
      />
    </div>
    <div class="form-group">
      <label for="testCommand">Test Command</label>
      <input
        type="text"
        id="testCommand"
        bind:value={testCommand}
        placeholder={testCommand}
      />
    </div>
    <div class="form-group">
      <label for="coverageReportPath">Coverage Report Path</label>
      <input
        type="text"
        id="coverageReportPath"
        bind:value={coverageReportPath}
        placeholder={coverageReportPath}
      />
    </div>
    <button type="submit" class="button">Generate</button>
    <button type="button" class="button back-button" on:click={handleBackClick}>Back</button>
  </form>
</div>
