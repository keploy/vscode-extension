<script>
  let screenshot1 = "media/codelens.png";
  let screenshot2 = "media/commandpellete.png";
</script>

<div class="container">
  <h1 class="heading">Follow these steps to use Keploy UTG</h1>

  <div class="instructions-box">
    <div class="instructions">
      <div class="step">
        <span class="step-number">1)</span> Open the desired source file.
      </div>

      <div class="step">
        <span class="step-number">2)</span> Click on the "Generate unit test".
        <img
          src={screenshot1}
          alt="Generate unit test screenshot"
          class="screenshot"
        />
      </div>

      <div class="step">
        <span class="step-number">3)</span> Use the command palette by
        right-clicking.
        <img
          src={screenshot2}
          alt="Command palette screenshot"
          class="screenshot"
        />
      </div>

      <div class="step">
        <span class="step-number">4)</span> Your unit tests will get generated for
        that source file under the `.test.js` or `.test.ts` file.
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background-color: var(--vscode-editor-background);
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px;
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    overflow-y: auto; /* Allow scrolling if content is too long */
  }

  .heading {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
    color: var(--vscode-editor-foreground);
  }

  .instructions-box {
    background-color: var(
      --vscode-sideBar-background
    ); /* Slightly lighter background */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(234, 221, 221, 0.2);
    width: 100%;
    max-width: 800px;
  }

  .instructions {
    font-size: 16px;
    line-height: 1.6;
    color: var(--vscode-editor-foreground);
  }

  .screenshot {
    width: 100%;
    margin: 20px 0;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .step {
    margin-bottom: 20px;
  }

  .step-number {
    font-weight: bold;
    color: var(--vscode-button-background);
  }
</style>
