<script>

  const vscode = acquireVsCodeApi();

  let selectedLanguage = "";

  function handleLanguageSelection(language) {
    selectedLanguage = language;
    vscode.postMessage({
      type: "navigate",
      value: "Forms",
      language,
    });
  }

  $: languageStyle = (language) => {
    switch (language) {
      case "Go":
        return "background-color: #87b1f5;";
      case "Java":
        return "background-color: #610e05;";
      case "JS":
        return "background-color: yellow; color: black;";
      case "Python":
        return "background-color: #133605;";
      default:
        return "";
    }
  };
</script>

<div class="container">
  <div class="title">Choose your language</div>
  <div class="buttons">
    <button
      class="button"
      on:click={() => handleLanguageSelection("Go")}
      style={selectedLanguage === "Go" ? languageStyle("Go") : ""}
    >
      Go
    </button>
    <button
      class="button"
      on:click={() => handleLanguageSelection("Java")}
      style={selectedLanguage === "Java" ? languageStyle("Java") : ""}
    >
      Java
    </button>
    <button
      class="button"
      on:click={() => handleLanguageSelection("JS")}
      style={selectedLanguage === "JS" ? languageStyle("JS") : ""}
    >
      JS
    </button>
    <button
      class="button"
      on:click={() => handleLanguageSelection("Python")}
      style={selectedLanguage === "Python" ? languageStyle("Python") : ""}
    >
      Python
    </button>
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&display=swap");

  body,
  html {
    font-family: "Baloo 2", cursive;
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
    transform: translateY(-5px);
  }
</style>