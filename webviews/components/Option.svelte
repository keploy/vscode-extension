<script>
  const vscode = acquireVsCodeApi();

  function handleTestSelection(testType) {
    vscode.postMessage({
      type: 'navigate',
      value: testType === 'Unit Testing' ? 'ChooseLanguage' : '',
    });
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&display=swap');

  body, html {
    font-family: 'Baloo 2', cursive;
    display: flex;
    flex-direction: column;
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
    justify-content: flex-start;
    text-align: center;
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    /* background: rgba(255, 255, 255, 0.1); Lighter background */
    border-radius: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }

  .title {
    font-size: 28px;
    margin-bottom: 40px; /* Increased margin for more space */
    margin-top: 20px; /* Add margin to the top to position it nicely */
    font-weight: bold;
    width: 100%;
    text-align: center;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    width: 100%;
    max-width: 600px;
    margin-top: auto; /* Pushes buttons to the center vertically */
    margin-bottom: auto; /* Pushes buttons to the center vertically */
  }

  .button {
    flex: 1 1 45%;
    max-width: 45%;
    padding: 20px;
    font-size: 18px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #fff;
    background-color: #ff914d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
    word-wrap: break-word;
  }

  .button:hover {
    background-color: #d4af37;
    transform: translateY(-5px);
  }
</style>

<div class="container">
  <div class="title">Choose the type of tests you want to create with Keploy</div>
  <div class="buttons">
    <button class="button" on:click={() => handleTestSelection('Integration Testing')}>Integration Testing</button>
    <button class="button" on:click={() => handleTestSelection('Unit Testing')}>Unit Testing</button>
  </div>
</div>
