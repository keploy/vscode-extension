<script>
  import { onMount } from "svelte";

let showSettings = false;

  const vscode = acquireVsCodeApi();
  let userSignedIn = false;

  function navigateToKeploy() {
    vscode.postMessage({
      type: "signinwithstate",
    });
  }


  onMount(() => {
    // Add event listener for messages from the VSCode extension
    window.addEventListener("message", (event) => {
      const message = event.data;
     
      if(message.type === "signedIn"){
        const signedInResponse = message.value;
          if(signedInResponse == "false"){
              userSignedIn = false;
              // console.log("Progress Bar is not Visible")
          }else{
            // console.log("Progress Bar is  Visible")
            userSignedIn = true;
          }
      }
    });
  });

  function handleTestSelection(testType) {

    if(testType != "Unit Testing"){
      if(userSignedIn){
        vscode.postMessage({
      type: "navigate",
      value: "IntegrationTest",
    });
      }else{
        navigateToKeploy();
      }
    }else{
      vscode.postMessage({
      type: "navigate",
      value: "UtgDocs"
    });
    }

   
  }
</script>

<div class={showSettings ? "container-hide" : "main-container"}>
  <div class="main">
    <div class="header">
      <img
        src="https://raw.githubusercontent.com/Sarthak160/goApi/a47fc440a11368062260dcff9828b468bc9b2872/print_transparent.svg"
        alt="Keploy"
        class="logo"
      />
      <h1 class="welcome-heading">Welcome to Keploy</h1>
    </div>

    <div class="body-text">
      <p>Ready to <span class="highlight">supercharge</span> your testing?</p>
      <p>
        Generate your Unit Tests and <br /> Integration Tests with a click below!
      </p>
    </div>

    <div class="btn-container">
      <button class="btn" on:click={() => handleTestSelection("Unit Testing")}
        >Generate Unit tests</button
      >
      <button
        class="btn"
        on:click={() => handleTestSelection("Integration Testing")}
        >Generate Integration tests</button
      >
    </div>
  </div>
</div>


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



  .main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .heading {
    font-size: 36px;
    font-weight: bold;
  }

  .logo {
    height: 40px;
    vertical-align: top;
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
  .main {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif; /* Use Montserrat here */
    background-color: #000;
    color: white;
    text-align: center;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
  }

  .header {
    flex: 0 0 20%;
    padding-top: 40px;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .logo {
    height: 70px;
    margin-bottom: 20px;
  }

  .welcome-heading {
    font-size: 2.5rem;
    font-weight: bold;
    padding: 15px 0;
  }

  .body-text {
    flex: 0 0 20%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .body-text p:first-child {
    font-size: 2.35rem;
  }

  .body-text p:nth-child(2) {
    margin-top: 40px;
    font-size: 1.5rem;
    line-height: 1.5;
  }

  .highlight {
    background: linear-gradient(90deg, #ffb388 0%, #ff5c00 50%, #f76b1c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .btn-container {
    flex: 0 0 60%;
    display: flex;
    flex-direction: column;
    justify-content: initial;
    align-items: center;
    margin-top: 20px;
  }

  .btn {
    width: 300px;
    padding: 15px;
    margin: 15px 0;
    text-decoration: none;
    color: white;
    background-color: #1a1a1a;
    border: 2px solid #f77b3e;
    border-radius: 5px;
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(247, 123, 62, 0.7);
  }

  .btn:hover {
    box-shadow: 0 0 40px rgba(247, 123, 62, 1);
    transform: scale(1.05);
  }
</style>
