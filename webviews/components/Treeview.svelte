<script>
  import { onMount } from "svelte";
  import TreeItem from './TreeItem.svelte';

  const vscode = acquireVsCodeApi();
  let folderStructure = [];
  let selectedColumn = 'Column 1'; // State to track the selected column

  onMount(() => {
    let isDataUpdated = false;

    const messageListener = (event) => {
      const message = event.data;
      if (message.command === 'updateData') {
        folderStructure = mergeFolderStructure(folderStructure, message.data.folderStructure);
        isDataUpdated = true;
      }
      console.log("new folder strucuture , ", folderStructure);
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

  const mergeFolderStructure = (existing, incoming) => {
  const existingMap = new Map(existing.map((item) => [item.id, item]));

  return incoming.map((incomingItem) => {
    const existingItem = existingMap.get(incomingItem.id);

    if (existingItem) {
      // Merge children recursively and preserve the collapsed state
      return {
        ...incomingItem,
        collapsed: existingItem.collapsed ?? true, // Preserve existing item's state
        children: mergeFolderStructure(existingItem.children || [], incomingItem.children || []),
      };
    } else {
      // New item: set default collapsed state to `false` for new children
      return addCollapsedState(incomingItem, false);
    }
  });
};

const addCollapsedState = (item, defaultState = true) => ({
  ...item,
  collapsed: item.collapsed ?? defaultState,
  children: item.children?.map((child) => addCollapsedState(child, defaultState)) || [],
});


  function backtoConfig() {
    console.log("Back button clicked");
    vscode.postMessage({ type: "navigate", value: "Config" });
  }
</script>

<body>
  <div class="columns">
    <button class="icon-button" on:click={() => backtoConfig()}>
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
      on:click={() => (selectedColumn = 'Column 1')}
    >
      <strong>FOLDER STRUCTURE</strong>
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
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: var(--vscode-sideBarSectionHeader-background);
    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .main-container {
    height: 100vh;
    background-color: var(--vscode-titleBar-activeBackground);
    max-width: 100%;
    padding-top: 10px;
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
    color: var(--vscode-foreground);
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, border-bottom 0.3s ease;
  }

  .column:hover {
    background-color: var(--vscode-list-hoverBackground);
    color: var(--vscode-hoverForeground);
  }

  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    color: var(--vscode-foreground);
    font-size: 20px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    box-shadow: none;
  }

  button:focus {
    outline: none;
  }

  button {
    outline: none;
  }
</style>
