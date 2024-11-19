<script>
  import { onMount } from "svelte";
  import TreeItem from './TreeItem.svelte'; // Import the `recursive component`

  const vscode = acquireVsCodeApi();
  let folderStructure = [];
  let selectedColumn = 'Column 1'; // State to track the selected column

  onMount(() => {
    let isDataUpdated = false;

    const messageListener = (event) => {
      const message = event.data;
      if (message.command === 'updateData') {
        folderStructure = message.data.folderStructure.map(addCollapsedState);
        isDataUpdated = true;
      }
    };

    window.addEventListener('message', messageListener);
    vscode.postMessage({ type: 'fetchData', value: 'fetchData' });

    const timeout = setTimeout(() => {
      if (!isDataUpdated) {
        console.warn('SidebarProvider did not respond in time. Using default folder structure.');
        folderStructure = [];
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('message', messageListener);
    };
  });

  const addCollapsedState = (item) => ({
    ...item,
    collapsed: true,
    children: item.children?.map(addCollapsedState) || [],
  });


  function backtoConfig(){
    console.log("back button clicked")
    vscode.postMessage({type:"navigate",value:"Config"})
  }
</script>

<body>
  <div class="columns">
    <button class="icon-button"  on:click={()=>backtoConfig()}>
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
    </button>
    <div
      class="column {selectedColumn === 'Column 1' ? 'selected' : ''}"
      on:click={() => selectColumn('Column 1')}
    >
      <p>Folder Structure</p>
    </div>
  </div>

  <div class="main-container">
    {#if folderStructure.length > 0}
      <ul>
        {#each folderStructure as item}
          <TreeItem {item} {vscode} />
        {/each}
      </ul>
    {:else}
      <p>Loading folder structure...</p>
    {/if}
  </div>
</body>

<style>

body {
    height: 100%;
    width: full;
    overflow: hidden;
    margin: 0 0; /* Center the body horizontally */
    padding: 0; /* Remove default padding */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
    background-color: var(--vscode-sideBarSectionHeader-background); /* Matches VSCode's editor background */
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif); /* Use VSCode's font */
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif); /* Use VSCode's font */
    font-size: var(--vscode-font-size, 13px); /* Use VSCode's font size */
    font-weight: 300; /* Light font-weight */
    color: var(--vscode-foreground); /* Use VSCode's foreground color */
  }

  li {
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
    font-size: var(--vscode-font-size, 13px);
    font-weight: 300; /* Light font-weight */
    color: var(--vscode-foreground);
  }

  .list-items {
    margin: 5px 0;
    padding: 5px;
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: var(--vscode-list-hoverBackground); /* Background for hover */
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }

  .list-items:hover {
    background-color: var(--vscode-list-hoverForeground); /* Background when hovered */
  }

  .toggle-icon {
    margin-right: 5px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, var(--vscode-foreground)); /* Use icon foreground color */
  }

  .main-container {
    height: 100vh;
    background-color: var(--vscode-titleBar-activeBackground); /* Matches VSCode's title bar background */
    max-width: 100%;
    padding-top: 10px;
    padding-right: 20%;
  }

  .columns {
    display: flex;
    gap: 4px;
    width: 100%;
    max-width: 300px;
    align-items: center;
    background-color: var(--vscode-sideBarSectionHeader-background);
  }

  .column {
    text-align: center;
    padding: 5px;
    border-bottom: 1px solid transparent; /* Default no border */
    color: var(--vscode-foreground); /* Use VSCode's foreground color */
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, border-bottom 0.3s ease;
  }

  .column:hover {
    background-color: var(--vscode-list-hoverBackground); /* Use hover background color */
    color: var(--vscode-hoverForeground); /* Use hover text color */
  }

  .column.selected {
    border-bottom: 1px solid var(--vscode-foreground); /* Add bottom border for the selected column */
  }

  .icon-button {
  display: flex;
  align-items: center; /* Vertically align icon and text */
  justify-content: center;
  border: none;
  background-color: transparent;
  color: var(--vscode-foreground);
  font-size: 20px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  box-shadow: none; /* Remove any shadow */
}
button:focus {
    outline: none; /* Remove the blue border on focus for all buttons */
  }
  button {
    
    outline: none; /* Remove the blue border on focus for all buttons */
  }
</style>
