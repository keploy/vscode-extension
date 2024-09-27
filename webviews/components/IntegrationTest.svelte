<script>
  import KeployHome from "./KeployHome.svelte";
  import { onMount } from "svelte";
  let showSettings = false;
  let appCommand = "";
  let path = "./";
  let passThroughPorts = "";
  let command="";
  let initialiseConfigButton;
  const vscode = acquireVsCodeApi();

  onMount(() => {
    vscode.postMessage({
      type: "openConfigFile",
      value: `/keploy.yml`,
    });

  });

 
  function handleTestSelection(testType) {
    vscode.postMessage({
      type: "navigate",
      value: testType,
    });
  }

  function handleConfig() {
    command = document.getElementById("configCommand").value;
    if (command) {
      console.log("Initializing Config with command:", command);
      vscode.postMessage({
        type: "initialiseConfig",
        value: `Initialise Config`,
        command: command,
        path: path
      });
      handleTestSelection("KeployHome");
    } else {
      console.error("Command is required to initialize the config.");
      alert("Please enter a valid command to run your application.");
    }
    handleTestSelection("KeployHome");
  }

</script>

<body>
  <div class="settings-container container-card">
    <div class="subTools">
      <div class="back-button" on:click={()=>handleTestSelection("Config")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          class="bi bi-arrow-left"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M15 8a.5.5 0 0 1-.5.5H4.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708.708L4.707 7.5H14.5A.5.5 0 0 1 15 8z"
          />
        </svg>
      </div>
  
      <div class="icon-buttons">
  
      <a href="https://keploy.io/docs/" target="_blank">
        <button id="openConfig" class="icon-button">
          <span class="docs-icon"></span>
        </button>
      </a>
    
      <a href="https://join.slack.com/t/keploy/shared_invite/zt-2rak7xfq9-KgZDi0qzW350ZO8nzo08VA" target="_blank">
        <button
          id="openConfig"
          class="icon-button"
        >
          <span class="support-icon"></span>
        </button>
      </a>
      </div>
    </div>
    <div>
      <h1 class="main-heading">Steps to setup Config</h1>
    </div>

    <div class="setting-Card-Container">
      <div class="InputContainer">
        <h1 class="heading">Command to run your application</h1>
        <div class="settings-item">
          <input
            type="text"
            placeholder="Enter Command to Run the Application"
            bind:value={appCommand}
            id="configCommand"
          />
          <div class="language-icons">
            <div class="language-icons-row">
              <div class="icon-info">
                <span class="golang-icon"></span>
                <p>go run main.go</p>
              </div>
              <div class="icon-info">
                <span class="node-icon"></span>
                <p>npm run start</p>
              </div>
            </div>
            <div class="language-icons-row">
              <div class="icon-info">
                <span class="python-icon"></span>
                <p>Python3 main.py</p>
              </div>
              <div class="icon-info">
                <span class="java-icon"></span>
                <p>java xyz.jar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button class="buttonBlack" id="setupConfig" on:click={handleConfig}
        ><span class="BoldName" id="setupConfig"
          >Save Configuration
        </span></button
      >
      <div class="stepper-container">
        <div class="step-line"></div>
        <div class="step">
          <span
            class="step-number activeStep ">
                 <span class="text">Setup Configuration</span>
                 <span class="timeline-icon">
  <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
  <svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
  
    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
    
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
    
    <g id="SVGRepo_iconCarrier">
    
    <path d="M11.969 14a1.237 1.237 0 0 0 .044.863l.061.137H8v-1zm5.183-3.25h1.65a1.216 1.216 0 0 1 .198.03V10H8v1h8.412a1.243 1.243 0 0 1 .74-.25zM19 6H8v1h11zM4 13h3v3H4zm1 2h1v-1H5zm5.75 3H2V3h19v9.077l.135-.06a1.1 1.1 0 0 1 .865-.039V2H1v17h9.773a1.201 1.201 0 0 1-.023-.152zM7 8H4V5h3zM6 6H5v1h1zm1 6H4V9h3zm-1-2H5v1h1zm14 8a2 2 0 1 1-2-2 2 2 0 0 1 2 2zm-1 0a1 1 0 1 0-1 1 1 1 0 0 0 1-1zm3.414 1.392l-.296.628.724 1.624-1.162 1.17-1.543-.71-.653.236-.636 1.66h-1.65l-.59-1.586-.628-.295-1.627.727-1.167-1.166.71-1.543-.236-.653-1.66-.636v-1.65l1.586-.59.295-.628-.727-1.627 1.166-1.167 1.543.71.653-.236.636-1.66h1.65l.59 1.586.628.296 1.624-.724 1.166 1.167-.705 1.538.235.653 1.66.636v1.65zm-1.277.523l.544-1.158 1.319-.49v-.582l-1.427-.548-.434-1.204.585-1.28-.412-.412-1.397.622-1.158-.544-.49-1.319h-.582l-.548 1.427-1.206.434-1.283-.59-.41.411.626 1.4-.545 1.161-1.319.49v.582l1.427.548.434 1.206-.59 1.283.411.41 1.4-.626 1.161.545.49 1.319h.582l.548-1.427 1.206-.434 1.28.588.411-.413z"/>
    
    <path fill="none" d="M0 0h24v24H0z"/>
    
    </g>
    
    </svg>
  
              
                </span>
           </span>
          <div
            class="step-circle active "
          ></div>
        </div>
        <div class="step">
          <div
            class="step-circle inactive "
          ></div>
          <span
            class="step-number bottom InactiveStep">
                             <span class="text">Record Test</span>
                             <span class="timeline-icon">
                              <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M400 733.333C584.095 733.333 733.333 584.095 733.333 400C733.333 215.905 584.095 66.6667 400 66.6667C215.905 66.6667 66.6665 215.905 66.6665 400C66.6665 584.095 215.905 733.333 400 733.333Z" stroke="currentColor" stroke-width="50"/>
                                <path d="M400 533.333C473.638 533.333 533.333 473.638 533.333 400C533.333 326.362 473.638 266.667 400 266.667C326.362 266.667 266.667 326.362 266.667 400C266.667 473.638 326.362 533.333 400 533.333Z" stroke="currentColor" stroke-width="50"/>
                                </svg>
                                
                            </span>
                       </span>
        </div>
        <div class="step">
          <!-- <div class="step-line"></div> -->
          <span
            class="step-number InactiveStep"
            >
            <span class="text">Replay Test</span>
            <span class="timeline-icon">
              <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M400 691.667C335.933 691.58 274.515 666.09 229.213 620.787C183.911 575.483 158.422 514.067 158.333 450C158.333 443.37 160.967 437.01 165.656 432.323C170.344 427.633 176.703 425 183.333 425C189.964 425 196.323 427.633 201.011 432.323C205.7 437.01 208.333 443.37 208.333 450C208.333 487.907 219.574 524.963 240.635 556.483C261.696 588.003 291.63 612.57 326.652 627.077C361.673 641.583 400.214 645.38 437.393 637.983C474.573 630.59 508.724 612.333 535.53 585.53C562.334 558.723 580.59 524.573 587.983 487.393C595.38 450.213 591.583 411.673 577.077 376.653C562.57 341.63 538.003 311.696 506.483 290.635C474.963 269.574 437.907 258.333 400 258.333H316.667C310.036 258.333 303.678 255.699 298.989 251.011C294.301 246.323 291.667 239.964 291.667 233.333C291.667 226.703 294.301 220.344 298.989 215.656C303.678 210.967 310.036 208.333 316.667 208.333H400C464.093 208.333 525.563 233.795 570.883 279.116C616.207 324.437 641.667 385.907 641.667 450C641.667 514.093 616.207 575.563 570.883 620.883C525.563 666.207 464.093 691.667 400 691.667Z" fill="currentColor"/>
                <path d="M400 358.333C396.717 358.35 393.46 357.71 390.427 356.45C387.393 355.19 384.64 353.337 382.333 351L282.333 251.001C277.652 246.314 275.022 239.959 275.022 233.334C275.022 226.709 277.652 220.355 282.333 215.668L382.333 115.668C384.623 113.211 387.383 111.241 390.45 109.875C393.517 108.509 396.827 107.774 400.183 107.715C403.54 107.655 406.873 108.273 409.987 109.53C413.1 110.788 415.927 112.659 418.3 115.033C420.677 117.407 422.547 120.235 423.803 123.348C425.06 126.461 425.68 129.795 425.62 133.152C425.56 136.509 424.827 139.819 423.46 142.886C422.093 145.952 420.123 148.712 417.667 151.001L335.333 233.334L417.667 315.668C422.347 320.355 424.977 326.709 424.977 333.333C424.977 339.96 422.347 346.313 417.667 351C415.36 353.337 412.607 355.19 409.573 356.45C406.54 357.71 403.283 358.35 400 358.333Z" fill="currentColor"/>
                </svg>
           </span>
      </span>
          <div
            class="step-circle inactive"
          ></div>
        </div>
        <div class="step">
          <!-- <div class="step-line"></div> -->
          <div
            class="step-circle inactive"
          ></div>
          <span
            class="step-number bottom"> 
                        <span class="text">CI/CD setup</span>
                        <span class="timeline-icon">
                         <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M522.889 440.222C510.556 440.259 498.257 438.917 486.222 436.222C493.237 451.381 498.602 467.25 502.222 483.556C508.889 483.556 515.778 483.556 522.889 483.556C545.551 483.52 568.06 479.844 589.556 472.667L568.889 432.444C553.984 437.133 538.506 439.75 522.889 440.222Z" fill="currentColor"/>
                           <path d="M408 397.111L400 388.667C382.65 371.704 369.269 351.111 360.816 328.366C352.364 305.621 349.05 281.288 351.111 257.111C353.381 224.728 365.3 193.767 385.333 168.222L383.556 200C383.533 205.563 385.598 210.932 389.342 215.047C393.086 219.161 398.237 221.722 403.778 222.222H405.778C411.341 222.245 416.71 220.18 420.824 216.436C424.939 212.692 427.499 207.54 428 202L435.556 111.111C435.822 107.892 435.383 104.654 434.27 101.622C433.157 98.5905 431.397 95.8377 429.111 93.5556C426.679 91.5851 423.857 90.1507 420.832 89.3465C417.807 88.5423 414.645 88.3864 411.556 88.8889L320.667 96.6667C314.773 97.1676 309.32 99.9894 305.506 104.511C301.693 109.033 299.832 114.884 300.333 120.778C300.834 126.671 303.656 132.125 308.178 135.938C312.699 139.751 318.551 141.612 324.444 141.111L353.111 138.667C326.117 172.444 310.208 213.731 307.556 256.889C305.259 286.466 309.371 316.19 319.611 344.032C329.851 371.875 345.977 397.181 366.889 418.222L373.778 426.444C402.175 455.791 418.513 494.733 419.556 535.556C420.74 554.047 418.786 572.605 413.778 590.444L453.778 610.667C462.383 585.618 465.785 559.076 463.778 532.667C462.413 482.175 442.566 433.941 408 397.111Z" fill="currentColor"/>
                           <path d="M720 398L693.111 400C717.647 368.244 732.78 330.24 736.789 290.309C740.797 250.379 733.521 210.126 715.787 174.126C698.054 138.126 670.574 107.824 636.473 86.6669C602.373 65.5096 563.02 54.3456 522.889 54.4445C500.221 54.4053 477.7 58.0837 456.222 65.3333L476.444 105.333C501.814 98.1484 528.505 96.9474 554.417 101.825C580.329 106.702 604.757 117.525 625.778 133.442C646.8 149.358 663.842 169.935 675.564 193.554C687.286 217.172 693.368 243.188 693.333 269.556C693.326 307.659 680.4 344.635 656.667 374.444L658.889 340.222C659.078 337.304 658.692 334.377 657.75 331.608C656.809 328.839 655.331 326.283 653.401 324.086C651.472 321.888 649.129 320.092 646.505 318.8C643.882 317.508 641.029 316.745 638.111 316.556C635.193 316.366 632.266 316.753 629.497 317.694C626.728 318.636 624.172 320.114 621.974 322.043C619.777 323.972 617.981 326.316 616.689 328.939C615.397 331.563 614.634 334.415 614.444 337.333L608.222 428C608.046 431.216 608.571 434.432 609.76 437.424C610.949 440.417 612.775 443.116 615.111 445.333C617.108 447.36 619.499 448.958 622.135 450.028C624.772 451.097 627.6 451.617 630.444 451.556H632.667L723.333 442.222C726.257 441.945 729.097 441.09 731.688 439.708C734.28 438.326 736.572 436.445 738.432 434.171C740.292 431.898 741.682 429.279 742.524 426.465C743.365 423.651 743.64 420.699 743.333 417.778C742.716 412.12 739.952 406.915 735.611 403.236C731.27 399.556 725.682 397.682 720 398Z" fill="currentColor"/>
                           <path d="M90.4443 454.222H92.2221L183.111 446.444C186.029 446.196 188.87 445.376 191.471 444.03C194.072 442.684 196.383 440.839 198.271 438.6C200.159 436.361 201.588 433.772 202.476 430.981C203.363 428.19 203.692 425.252 203.444 422.333C203.196 419.415 202.376 416.574 201.03 413.973C199.684 411.372 197.839 409.061 195.6 407.173C193.361 405.285 190.772 403.856 187.981 402.969C185.19 402.081 182.251 401.752 179.333 402L148.444 404.667C177.539 383.203 212.733 371.601 248.889 371.556C261.069 371.629 273.208 372.969 285.111 375.556C278.131 360.404 272.84 344.531 269.333 328.222C262.667 328.222 255.778 328.222 248.889 328.222C201.476 328.151 155.374 343.779 117.778 372.667L120.444 343.556C120.687 340.635 120.35 337.696 119.453 334.907C118.556 332.117 117.115 329.533 115.215 327.302C113.315 325.072 110.992 323.239 108.381 321.909C105.77 320.58 102.922 319.78 99.9999 319.556C94.1374 319.063 88.3189 320.915 83.8199 324.706C79.3209 328.497 76.5087 333.917 75.9999 339.778L68.2221 430.444C67.9762 433.509 68.3687 436.591 69.3748 439.495C70.3809 442.4 71.9787 445.065 74.0673 447.32C76.1559 449.576 78.6897 451.374 81.5086 452.6C84.3276 453.826 87.3703 454.454 90.4443 454.444V454.222Z" fill="currentColor"/>
                           <path d="M409.333 627.333L318.444 633.333C312.551 633.716 307.051 636.425 303.154 640.863C299.257 645.302 297.284 651.106 297.667 657C298.05 662.894 300.758 668.394 305.197 672.29C309.635 676.187 315.44 678.161 321.333 677.778L355.556 675.333C330.388 695.561 300.018 708.265 267.944 711.981C235.87 715.698 203.399 710.276 174.273 696.34C145.147 682.404 120.552 660.522 103.322 633.215C86.0921 605.908 76.929 574.288 76.8889 542C77.049 526.964 79.2163 512.017 83.3333 497.556L44.4444 476.889C37.5601 498.061 34.0359 520.181 34 542.444C34.2607 582.689 45.7831 622.058 67.2627 656.092C88.7422 690.127 119.321 717.468 155.537 735.021C191.753 752.574 232.16 759.638 272.184 755.412C312.207 751.186 350.248 735.84 382 711.111L379.333 737.333C379.025 740.237 379.293 743.173 380.12 745.974C380.948 748.775 382.319 751.385 384.156 753.655C385.993 755.925 388.259 757.811 390.825 759.205C393.391 760.599 396.207 761.473 399.111 761.778H401.556C407.084 761.805 412.424 759.772 416.533 756.074C420.642 752.375 423.225 747.278 423.778 741.778L433.111 651.556C433.441 648.34 433.066 645.092 432.012 642.037C430.957 638.982 429.249 636.193 427.007 633.866C424.764 631.539 422.041 629.729 419.027 628.562C416.013 627.395 412.781 626.9 409.556 627.111L409.333 627.333Z" fill="currentColor"/>
                           </svg>
                       </span>
                  </span>
              
        </div>
        <div class="step">
          <span
            class="step-number InactiveStep"
            >
            <span class="text">Add users</span>
            <span class="timeline-icon">
              <svg width="20" height="20" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M566.667 700V633.333C566.667 597.971 552.619 564.057 527.614 539.052C502.609 514.048 468.695 500 433.333 500H166.667C131.304 500 97.3905 514.048 72.3857 539.052C47.3808 564.057 33.3333 597.971 33.3333 633.333V700" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M300 366.667C373.638 366.667 433.333 306.971 433.333 233.333C433.333 159.695 373.638 100 300 100C226.362 100 166.667 159.695 166.667 233.333C166.667 306.971 226.362 366.667 300 366.667Z" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M566.667 366.667H766.666" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M666.667 266.667V466.667" stroke="currentColor" stroke-width="66.6667" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                
           </span>
      </span>
          <div
            class="step-circle inactive "
          ></div>
        </div>
      </div>
    </div>
  </div>
</body>

<style>
  @font-face {
    font-family: "Montserrat";
    src:
      url("../../font/Montserrat-VariableFont_wght.ttf") format("woff2"),
      url("../../font/Montserrat-VariableFont_wght.ttf") format("woff");
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: "Montserrat";
    src:
      url("../../font/Montserrat-Italic-VariableFont_wght.ttf") format("woff2"),
      url("../../font/Montserrat-Italic-VariableFont_wght.ttf") format("woff");
    font-weight: 700;
    font-style: italic;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: "Montserrat", sans-serif; /* Use Montserrat here */
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background-color: #000;
  }

  .container,
  .settings-container {
    display: flex;
    flex-direction: column;
    text-align: left;
    height: 100%;
    padding: 2rem;
    background-color: black;
  }

  .setting-Card-Container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    height: 100%;
    padding: 2.5rem 2rem;
  }

  .main-heading {
    font-size: 2.7rem;
    text-align: center;
  }

  .buttonBlack {
    font-size: 1rem;
    background-color: inherit;
    padding: 1rem;
    border-radius: 5px;
    width: 60%;
    margin-top: auto;
    margin-bottom: auto;
    text-align: center;
    color: #e0e0e0;
    border: 1px solid #ff914d;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255, 145, 77, 0.8); /* Glowing shadow effect based on #ff914d */
  }
  .buttonBlack:hover {
  box-shadow: 0 0 20px rgba(255, 153, 0, 1), 0 0 40px rgba(255, 153, 0, 0.5);  /* Stronger glow on hover */
  transform: scale(1.1); 
}

  .settings-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80vw;
    padding: 1.5rem 0;
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .settings-item input {
    flex-grow: 1;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  .settings-item input:focus {
    outline: none;
  }

  .golang-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/golang.png") no-repeat center center;
    background-size: contain;
  }

  .node-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/nodejs.png") no-repeat center center;
    background-size: contain;
  }

  .java-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/java.png") no-repeat center center;
    background-size: contain;
  }

  .python-icon {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: transform 0.3s;
    background: url("../../sidebar/python.png") no-repeat center center;
    background-size: contain;
  }

  .InputContainer {
    width: 100%;
    align-items: center;
    margin-bottom: 2rem;
  }

  .heading {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .BoldName {
    font-weight: bold;
  }

  .back-button {
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    background-color: inherit;
    cursor: pointer;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: start;
    width: 10%;
  }

  button:focus {
    outline: none; /* Remove the blue border on focus for all buttons */
  }
  button {
    outline: none; /* Remove the blue border on focus for all buttons */
  }

  .language-icons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 20px;
  }

  .language-icons-row {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    gap: 2vw;
  }

  .icon-info {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size:0.85rem;
  }

  .stepper-container {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-top: auto;
    z-index: 1;
    scale: 90%;
    position: relative;
    margin-bottom: 20px;
  }


  .step:nth-of-type(2) div {
    margin-right: auto;
  }

  .step:last-child {
    align-items: flex-end; /* Align last circle to the right */
    text-align: right;
  }

  .step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1rem;
    color: white;
    z-index: 2;
    flex: 1; /* Allows the steps to take equal space */
  }

  .step-number {
    position: absolute;
    top: -2.5rem; /* Adjust to position text above the circle */
    font-size: 0.9rem;
    color: grey;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis; /* Add ellipsis if text is too long */
    padding: 0 0.5rem;
  }

  .step-number.bottom {
    top: 2.5rem; /* Adjust to position text below the circle */
  }
  .step:nth-of-type(5) .step-number.activeStep:hover,
  .step:nth-of-type(6) .step-number.activeStep:hover {
  font-size: 1rem; /* Increase the font size */
  transition: font-size 0.3s ease; /* Smooth transition for the font size */
  cursor: pointer; /* Show pointer cursor to indicate it is clickable */
  }
  .step-circle {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: black;
    position: relative;
    z-index: 3;
  }

  .step-circle.active {
    border: 2px solid #ff914d;
  }

  .step-circle.inactive {
    border: 2px solid #969390;
  }

  .step-circle.active::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    background-color: #ff914d;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .step-circle.inactive::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1rem;
    height: 1rem;
    background-color: #969390;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .step-line {
    width: 100%;
    height: 2px;
    background-color: #ff914d;
    position: absolute;
    top: 50%;
    left: 0;
    z-index: 1;
  }

  .step:not(:first-child) .step-line {
    left: 0;
  }

  .step:not(:last-child) .step-line::after {
    content: "";
    width: 100%;
    height: 2px;
    background-color: #ff914d;
    position: absolute;
    top: 0;
    left: 100%;
  }
  .icon-button {
    display: flex;
    justify-content: start;
    border-radius: 5px;
    color: white;
    background-color: black;
    font-size: 24px;
    height: 40px;
    padding: 0 10px; /* Add padding inside buttons */
    cursor: pointer;
    border: none;
    width: auto;
  }
  .subTools {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-bottom: 20px;
    justify-content: space-between;
    align-items: center;
  }
  .icon-buttons {
   display: flex;
   flex-direction: row;
   align-items: start;
   padding: 5vw;
   width: 100%; /* Full width of the container */
   justify-content: flex-end; /* Align icons to the left */
 }
  .container-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: left;
    height: 100%;
    padding: 2rem;
    background-color: black;
    border: 1px solid #f77b3e;
    border-radius: 5px;
    transition: all 0.3s ease;
    box-shadow: inset 0px 4px 36px 1px rgba(255, 145, 77, 0.8),
              inset 0px 4px 4px 0px rgba(255, 153, 0, 0.8);
  }
  .text {
  display: inline; /* Show text */
}
.timeline-icon {
  display: none; /* Hide icon */
}
#configCommand {
      width: 80%;
      padding: 10px;
      font-size: 0.85rem;
      border-radius: 0.75rem;
      border: 0.5px solid #9a9a9a;
      background: linear-gradient(249.22deg, rgba(255, 255, 255, 0.2) 61.6%, rgba(247, 107, 28, 0.2) 109.47%);  
      color: white;
      background: linear-gradient(249.22deg, rgba(255, 255, 255, 0.2) 61.6%, rgba(247, 107, 28, 0.2) 109.47%);
      box-shadow: 0px 1.24px 0px 0px #000000 inset;
    }

  @media screen and (max-width: 768px) {
    .step-circle {
    height: 6vw; /* Responsive step circle size */
    width: 6vw;
  }
  .step-circle.active::before,
  .step-circle.inactive::before {
    width: 3vw; /* Inner circle size */
    height: 3vw;
  }

    .step-circle {
      width: 1.5rem;
      height: 1.5rem;
    }

    .step-circle.active::before,
    .step-circle.inactive::before {
      width: 0.75rem;
      height: 0.75rem;
    }
  }

  @media screen and (max-width: 480px) {
    .heading {
    font-size: 4vw;

  }
  .main-heading {
    font-size: 7vw;
    text-align: center;
  }

    .buttonBlack {
      font-size: 3vw;
      /* padding: 0.7rem; */
    }

    .step-circle {
      width: 1.25rem;
      height: 1.25rem;
    }

    .step-circle.active::before,
    .step-circle.inactive::before {
      width: 0.6rem;
      height: 0.6rem;
    }
    .text {
    display: none; /* Hide text */
  }
    .timeline-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  transition: color 0.3s ease;
}
  .activeStep .timeline-icon {
  color: white; /* Set to white when active */
}
.InactiveStep .timeline-icon {
  color: grey; /* Set to grey when inactive */
}
#configCommand, 
.icon-info {
    font-size:2.5vw;
  }

  }


</style>
