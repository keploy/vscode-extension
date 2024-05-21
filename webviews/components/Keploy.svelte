<script>
    let appCommand = '';
    let startTestingButton;
    let startRecordingButton;
    let projectFolder;

    let selectedIconButton = 1;
    let isProjectFolderVisible = false;
    let isRecording = false;
    let isTesting = false;

    const selectButton = (buttonNumber) => {
        selectedIconButton = buttonNumber;
    };

    const toggleRecording = () => {
        isRecording = !isRecording;
    };

    const toggleTesting = () => {
        isTesting = !isTesting;
    };

    $: {
        const isAppCommandEmpty = appCommand.trim() === '';
        if (startTestingButton) startTestingButton.disabled = isAppCommandEmpty;
        if (startRecordingButton) startRecordingButton.disabled = isAppCommandEmpty;
        const recordedTestCases = document.getElementById('recordedTestCases');
        if (recordedTestCases && recordedTestCases.innerHTML.length ===0) {
            recordedTestCases.style.display ='none';
            
        }
        //set visibility of stop recording button
        const stopRecordingButton = document.getElementById('stopRecordingButton');
        if (stopRecordingButton) {
            stopRecordingButton.style.display = isRecording ? 'block' : 'none';
        }
        const stopTestingButton = document.getElementById('stopTestingButton');
        if (stopTestingButton) {
            stopTestingButton.style.display = isTesting ? 'block' : 'none';
        }
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = isRecording || isTesting ? 'block' : 'none';
            // loader.style.display = isTesting ? 'block' : 'none';
        }
        //set visibility of start recording button and start testing button
        if (startRecordingButton) {
            startRecordingButton.style.display = isRecording || isTesting ? 'none' : 'block';
        }
        if (startTestingButton) {
            startTestingButton.style.display = isRecording || isTesting ? 'none' : 'block';
        }
    }

    $: isProjectFolderVisible = projectFolder?.value.trim() !== '';
</script>

<style>
    main {
        margin: 5px;
    }
    #startRecordingButton {
        margin: 20px auto;
    }
    button {
        margin: 5px auto;
        width: 100%;
        height: 30px;
        padding: 5px;
    }
    #selectFolderDiv,
    #appCommandDiv {
        display: grid;
        place-items: center;
    }
    input {
        width: 100%;
        margin: 10px;
    }
    #stopRecordingButton , #stopTestingButton {
        background-color: #EF546B;
        margin-top: 10px;
    }
    #stopRecordingButton:hover  , #stopTestingButton:hover{
        background-color: darkred;
    }
    #startRecordingButton:disabled,
    #startTestingButton:disabled {
        background-color: rgb(80, 79, 79);
        cursor: not-allowed;
    }
    #recordStatus {
        display: none;
        text-align: center;
        display: none;
        margin: 20px;
        font-weight: bold;
    }
    #recordedTestCases {
        display: none;
        grid-template-columns: 1fr;
        place-items: center;
    }
    .loader {
        display: none;
    }
    button {
        font-size: small;
    }
    .icon-buttons {
        display: flex;
        justify-content: space-around;
    }
    .icon-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: transparent;
        border: 2px solid transparent;
        color: #ff6600;
        font-size: 24px;
        height: 50px;
        width: 80px;
        cursor: pointer;
    }
    .icon-button.selected {
        border-color: #ff9933;
    }
    .icon-button:hover {
        color: #ff9933;
    }
    #projectFolder {
        display: none;
    }
    #testResults{
    margin: 20px auto;
    text-align: center;
    display: grid;
    place-items: center;
    grid-template-columns: 1fr;
    }
    #testStatus{
      text-align: center;
      display: none;
    }
    #viewCompleteSummaryButton{
      display: none;
      width: 75%;
      margin: 10px auto;
    }
</style>

<main>
    <div class="menu">
        <div id="appCommandDiv">
            <input
                type="text"
                id="appCommand"
                name="appCommand"
                placeholder="Enter App Command"
                bind:value={appCommand}
            />
        </div>
        <div id="selectFolderDiv">
            <button id="selectRecordFolderButton" class="button">Select Project Folder</button>
            <input
                type="text"
                id="projectFolder"
                name="projectFolder"
                bind:this={projectFolder}
                class:isVisible={isProjectFolderVisible}
            />
        </div>
        <div class="icon-buttons">
            <button class="icon-button {selectedIconButton === 1 ? 'selected' : ''}" on:click={() => selectButton(1)}>
                {#if isRecording}
                    <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#ff0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#ff0000" d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6s-6 2.69-6 6s2.69 6 6 6" opacity="0.3"/><path fill="#ff0000" d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8s-8 3.58-8 8s3.58 8 8 8m0-14c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6"/></svg>
                {/if}
            </button>
            <button class="icon-button {selectedIconButton === 2 ? 'selected' : ''}" on:click={() => selectButton(2)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#00ff11" d="M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29c-.47 2.27-2.31 4.1-4.57 4.57c-3.57.75-6.75-1.7-7.23-5.01a1 1 0 0 0-.98-.85c-.6 0-1.08.53-1 1.13c.62 4.39 4.8 7.64 9.53 6.72c3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5"/></svg>
            </button>
            <button class="icon-button {selectedIconButton === 3 ? 'selected' : ''}" on:click={() => selectButton(3)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="35px" height="35px" viewBox="0 0 24 24"><path fill="#f56e00" d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6s-1.62 3.6-3.6 3.6"/></svg>
            </button>
        </div>
        <hr/>
        <h3 id="recordStatus"> </h3>
        <div id="recordedTestCases"></div>
        <h3 id="testStatus"> </h3>
        <div id="testResults">
        </div>
        <button id="viewCompleteSummaryButton">View Complete Test Summary</button>
        {#if selectedIconButton === 1}
            <button id="startRecordingButton" class="button" disabled={isRecording && isTesting} on:click={toggleRecording} bind:this={startRecordingButton}>
                Start Recording
            </button>
            <button id="startTestingButton" class="button" disabled={isRecording && isTesting} on:click={toggleTesting} bind:this={startTestingButton}>Start Testing</button>
        {/if}
        <div class="loader" id="loader"></div>
        <button id="stopRecordingButton" on:click={toggleRecording}>Stop Recording</button>
        <button id="stopTestingButton" on:click={toggleTesting}>Stop Testing</button>
        
    </div>
</main>
