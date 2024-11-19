  <!-- Your main component -->
  <script>
      import { onMount } from "svelte";
      import TreeItem from './TreeItem.svelte'; // Import the `recursive component
    
      const vscode = acquireVsCodeApi();
      let folderStructure = [];
    
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

    
    </script>
    
    <body>
      <h1>This is the Treeview Page</h1>
    
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
      }
    
      h1 {
        font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
        font-size: calc(var(--vscode-font-size, 13px) + 2px); /* Slightly larger than body font */
        font-weight: 300; /* Light font-weight for the title */
        color: var(--vscode-foreground); /* Foreground color for titles */
        margin-bottom: 10px;
      }
    
      p {
        font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
        font-size: var(--vscode-font-size, 13px);
        font-weight: 300; /* Light font-weight */
        color: var(--vscode-descriptionForeground, var(--vscode-foreground));
      }
    </style>
    
    
    