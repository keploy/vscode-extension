<script>
  import { onMount } from "svelte";

  let showSettings = false;
  let isLoading = true; // Loading state
  const vscode = acquireVsCodeApi();
  let userSignedIn = false;
  const loader = document.getElementById("loader");

  function navigateToKeploy() {
    vscode.postMessage({
      type: "signinwithstate",
    });
  }

  onMount(() => {
    // Add event listener for messages from the VSCode extension
    window.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "signedIn") {
        const signedInResponse = message.value;
        if (signedInResponse === "false") {
          userSignedIn = false;
        } else {
          userSignedIn = true;
        }
        isLoading = false; // Set loading to false after receiving message
      }
    });

    setTimeout(() => {
      if (isLoading) {
        isLoading = false; 
      }
    }, 3000); 
  });

  function handleTestSelection(testType) {
    if (isLoading) {
      // Prevent action when still loading
      return;
    }

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

  function ChangingView(testType){
    vscode.postMessage({
      type: "changeView",
      value: "IntegrationTest",
    });
  }
</script>

<div class={showSettings ? "container-hide" : "main-container"} >
  <div class="main container-card">
    <div class="logo-header">
      <img
      src="https://raw.githubusercontent.com/Sarthak160/goApi/a47fc440a11368062260dcff9828b468bc9b2872/print_transparent.svg"
      alt="Keploy"
      class="logo"
    />
    </div>
    <div class="header">
      <h1 class="welcome-heading">Welcome to Keploy</h1>
    </div>

    <div class="body-text">
      <p>Ready to <span class="highlight">supercharge</span> your testing?</p>
      <p>
        Generate your Unit Tests and <br /> Integration Tests with a click below!
      </p>
    </div>

    <div class="btn-container">
      <button class="btn" on:click={() => ChangingView("Unit Testing")}
        >Generate Unit tests</button
      >
      <button
        class="btn"
        on:click={() => handleTestSelection("Integration Testing")}
        >Generate Integration tests</button
      >
      {#if isLoading}
      <div class="loader" id="loader"></div>
    {/if}
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
    overflow: hidden;
    border: 1px solid var(--vscode-editor-background); 
  }
  .container-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  height: 100%;
  padding: 2rem;
  background-color: var(--vscode-editor-background);
  color: var(--vscode-editor-foreground); /* Optional: matches VSCode text color */
  border-radius: 5px;
  transition: all 0.3s ease;
}

  .logo {
    height: 65px;
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
  .main {
    margin: 0;
    padding: 0;
    font-family: 'Montserrat', sans-serif; 
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground); /* Optional: matches VSCode text color */
    text-align: center;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;
    overflow: hidden; /* Ensures the overlay stays within the bounds */
}

.main::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.1); /* Adjust opacity for more or less darkness */
    pointer-events: none;
}


  

  .header {
    flex: 0 0 15%;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .welcome-heading {
    font-size: 40px; 
    font-weight: bold;
    padding: 15px 0;
  }

  .body-text {
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 5%;
}

.body-text p:first-child {
  font-size: 28px;
  font-weight: bold; /* Make the first line bold for contrast */
}

.body-text p:nth-child(2) {
  margin-top: 40px;
  font-size: 22px;
  line-height: 1.5;
  font-weight: 300 !important; /* Lighter font weight for the second line */
}
  .highlight {
    background: linear-gradient(90deg, #ffb388 0%, #ff5c00 50%, #f76b1c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .btn-container {
    display: flex;
    flex-direction: column;
    justify-content: initial;
    align-items: center;
    margin: 20px 0px;
  }


  .btn {
    font-family: 'Montserrat', sans-serif; 
    width: 300px; 
    font-size: 20px; 
    padding: 15px;
    margin: 20px 0;
    text-decoration: none;
    color: var(--vscode-editor-foreground); /* Optional: matches VSCode text color */
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-editor-foreground);
    border-radius: 5px;
    font-weight: bold;
    text-align: center;
    position: relative;
    overflow: hidden; /* Ensures the overlay is contained within the button */
    transition: all 0.3s ease;
}

.btn::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(20, 19, 19, 0.1); /* Adjust opacity for more/less darkening */
    border-radius: 5px;
    pointer-events: none;
}

  .logo-header{
    display: flex;
    justify-content: flex-start;
    width: 100vw;
    margin-left: 9vw;
  }
  .btn:hover {
  /* box-shadow: 0 0 20px rgba(255, 153, 0, 1), 0 0 40px rgba(255, 153, 0, 0.5);  Stronger glow on hover */
  transform: scale(1.1); 
}
@media screen and (max-width: 480px) {
  .welcome-heading {
    font-size: 8vw; 
  }
  .logo-header{
    width: 100vw;
    margin-left: 9vw;
  }
  .btn {
    width: 65vw; 
    font-size: 4vw; 
    padding: 3vw;
  }
  .body-text p:first-child {
  font-size: 6vw;
}

.body-text p:nth-child(2) {
  font-size: 4.5vw;
}
.logo {
    height: 14vw;
  }
  }
</style>
