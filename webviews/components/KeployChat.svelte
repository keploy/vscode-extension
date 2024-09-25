<script>
  const vscode = acquireVsCodeApi();
  let aiQuestion = ""; // This will hold the user input for the AI question.

  // Define functions or handlers for the buttons
  function generateReport() {
    // Logic to generate a report
  }

  function visualizeSummary() {
    // Logic to visualize summary
  }

  function openDocumentation() {
    vscode.postMessage({
      type: "openLink",
      url: "https://keploy.io/docs",
    });
  }

  function askAI() {
    vscode.postMessage({
      type: "keployGenWithAdditionalPrompts",
      prompt: aiQuestion,
    });
    // Logic to ask AI
  }

  function closeWindow() {
    vscode.postMessage({
      type: "navigate",
      value: "UtgDocs",
    });
  }
</script>

<style>
  @font-face {
    font-family: 'Montserrat';
    src: url('../../font/Montserrat-VariableFont_wght.ttf') format('woff2'),
      url('../../font/Montserrat-VariableFont_wght.ttf') format('woff');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Montserrat';
    src: url('../../font/Montserrat-Italic-VariableFont_wght.ttf') format('woff2'),
      url('../../font/Montserrat-Italic-VariableFont_wght.ttf') format('woff');
    font-weight: 700;
    font-style: italic;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #000000;
    color: white;
    font-family: "Montserrat", sans-serif;
    position: relative;
  }

  .header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 10px 20px;
    background-color: #000000;
    color: #be6c39;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .content-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: #000000;
    color: white;
    gap: 10px;
    font-family: "Montserrat", sans-serif;
  }

  .image-heading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .image-heading-container h1 {
    margin-top: 10px;
  }

  .header h1 {
    font-size: 20px;
    width: 100%;
    margin: auto;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    width: 10%;
    scale: 100%;
  }

  .close-btn:focus {
    outline: none;
  }

  .logo {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin-bottom: 10px;
    margin-top: 20px;
    background-color: #1a1a1a;
    border: #333;
    margin: auto;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 5px;
    font-family: "Montserrat", sans-serif;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
    font-family: "Montserrat", sans-serif;
  }

  .button-container {
    margin: auto;
    display: flex;
    flex-direction: column;
    width: 300px;
    border: 1px solid #444;
    border-radius: 5px;
  }

  .button-container button {
    width: 100%;
    border-bottom: 1px solid #444;
    color: #c2c2c2;
    background-color: inherit;
    font-family: "Montserrat", sans-serif;
  }

  .button-container button:focus {
    outline: none;
  }

  .button-container button:last-child {
    border-bottom: none;
    color: white;
  }

  button {
    background-color: #333;
    color: orange;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    text-align: left;
  }

  .heading1 {
    color: #be6c39;
  }

  .subheading1 {
    color: #be6c39;
  }

  /* Style for AI input field and submit button */
  .chat-input-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1a1a1a;
    border-radius: 5px;
    position: relative;
    padding: 10px;
    width: 300px;
  }

  .chat-input {
    flex-grow: 1;
    background-color: transparent;
    color: white;
    border: none;
    font-size: 16px;
    outline: none;
    margin-left: 10px; /* To add space between input and first SVG */
    margin-right: 10px; /* To add space between input and second SVG */
  }

  .chat-input::placeholder {
    color: #c2c2c2;
  }

  .chat-submit {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: white;
    font-size: 18px;
  }

  .submit-svg:hover {
    cursor: pointer;
  }

  .svg-left,
  .svg-right {
    position: relative;
    z-index: 1;
  }

  /* SVG Responsiveness */
  .svg-left, 
  .svg-right {
    width: 10%; /* Relative width */
    height: auto; /* Maintain aspect ratio */
    max-width: 50px; /* Maximum size */
    min-width: 25px; /* Minimum size */
  }

  .svg-right {
    margin-left: 10px; /* Space between the input and the submit button */
  }
</style>

<div class="container">
  <div class="header">
    <h1>Keploy Chatbot</h1>
    <button class="close-btn" on:click={() => closeWindow()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-x"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>

  <div class="content-screen">
    <div class="image-heading-container">
      <img
        src="https://raw.githubusercontent.com/Sarthak160/goApi/a47fc440a11368062260dcff9828b468bc9b2872/print_transparent.svg"
        alt="Keploy"
        class="logo"
      />

      <h1 class="heading1">Hey, there</h1>
      <p class="subheading1">How can I help you today?</p>
    </div>

    <div class="button-container">
      <button on:click={generateReport}>Generate Report for this file</button>
      <button on:click={visualizeSummary}>Visualize summary of tests generated...</button>
      <button on:click={openDocumentation}>Visit Documentation</button>
    </div>

    <!-- Chat Input with Icon -->
    <div class="chat-input-container">
      <!-- Left SVG -->
      <svg
        class="svg-left"
        width="27"
        height="30"
        viewBox="0 0 51 67"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40.9342 21.44C32.8992 25.4689 24.9492 33.543 20.4671 42.88C15.985 33.543 8.03616 25.4689 0 21.44C8.03499 17.4111 15.985 9.33696 20.4671 0C24.9492 9.33696 32.8981 17.4111 40.9342 21.44Z"
          fill="#FF9900"
        />
        <path
          d="M44.9605 52.2603C39.6917 55.0302 34.4786 60.5811 31.5395 67.0003C28.6004 60.5811 23.388 55.0302 18.1184 52.2603C23.3873 49.4904 28.6004 43.9394 31.5395 37.5203C34.4786 43.9394 39.6909 49.4904 44.9605 52.2603Z"
          fill="#FF9900"
        />
        <path
          d="M51 33.4999C47.1801 35.2625 43.4006 38.795 41.2697 42.8799C39.1389 38.795 35.3599 35.2625 31.5395 33.4999C35.3594 31.7372 39.1389 28.2048 41.2697 24.1199C43.4006 28.2048 47.1795 31.7372 51 33.4999Z"
          fill="#FF9900"
        />
      </svg>

      <!-- Input Field -->
      <input
        type="text"
        class="chat-input"
        placeholder="Ask AI Anything..."
        bind:value={aiQuestion}
      />

      <!-- Right SVG (Submit button) -->
        <svg
          width="27"
          height="27"
          viewBox="0 0 58 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          on:click={askAI}
          class="submit-svg"
        >
          <mask id="path-1-inside-1_528_6" fill="white">
            <path
              d="M58 27.5C58 12.3103 45.016 0 29 0C12.984 0 0 12.3103 0 27.5C0 42.6876 12.984 55 29 55C45.016 55 58 42.6876 58 27.5ZM2.32212 27.5C2.32212 13.5497 14.291 2.19992 29.0022 2.19992C43.7134 2.19992 55.6823 13.5497 55.6823 27.5C55.6823 41.4503 43.7156 52.8001 29.0022 52.8001C14.291 52.8001 2.32212 41.4503 2.32212 27.5Z"
            />
          </mask>
          <path
            d="M58 27.5C58 12.3103 45.016 0 29 0C12.984 0 0 12.3103 0 27.5C0 42.6876 12.984 55 29 55C45.016 55 58 42.6876 58 27.5ZM2.32212 27.5C2.32212 13.5497 14.291 2.19992 29.0022 2.19992C43.7134 2.19992 55.6823 13.5497 55.6823 27.5C55.6823 41.4503 43.7156 52.8001 29.0022 52.8001C14.291 52.8001 2.32212 41.4503 2.32212 27.5Z"
            fill="white"
            fill-opacity="0.32"
          />
          <path
            d="M41.2219 26.0432L42.8308 24.5152L28.999 11.3794L15.1693 24.5152L16.7782 26.0432L27.8628 15.5164V41.7242H30.1374V15.5164L41.2219 26.0432Z"
            fill="white"
            fill-opacity="0.32"
          />
        </svg>
    </div>
  </div>
</div>
