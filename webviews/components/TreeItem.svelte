<script>
  import TreeItem from './TreeItem.svelte';
  
  export let item;
  export let vscode;
  const toggleCollapse = () => {
      item.collapsed = !item.collapsed;
  };

  let hovered = false;

  function playFunction (item){
    // console.log(item);
    if (vscode) {
        vscode.postMessage({ type: 'playFunction', value: item });
    } else {
        console.warn("VSCode API is not available. Cannot send message.");
    }
    
  }

  function findTestFile (item){
    // console.log(item);
    if (vscode) {
        vscode.postMessage({ type: 'findTestFile', value: item });
    } else {
        console.warn("VSCode API is not available. Cannot send message.");
    }
  }

  function openFile (item){
    if(vscode){
      vscode.postMessage({type:"findFile", value:item});
    }else{
      console.warn("VSCode API is not available. Cannot send message.");
  
    }
  }

  function findFunction(item){
    console.log("button is being clicked")
    if(vscode){
      vscode.postMessage({type:"findFunction", value:item});
    }else{
      console.warn("VSCode API is not available. Cannot send message.");
  
    }
  }

  function playFunctionForAll(item){
    console.log("button is being clicked")
    if(vscode){
      vscode.postMessage({type:"playFunctionForAll", value:item});
    }else{
      console.warn("VSCode API is not available. Cannot send message.");
  
    }
  }

  const getIcon = (itemType) => {
    switch (itemType) {
        case 'folder':
            return '<span class="Folder_icon_light"></span>';
        case 'file':
            return '<span class="file_icon_light"></span>';
        case 'class':
            return '<span class="Class_icon_light"></span>';
        case 'function':
          return '<span class="function_icon"></span>';
        default:
            return '<span class="findDefault_icon_light"></span>';
    }
};

</script>

<li class="list-items"
on:mouseover={() => hovered = true} 
on:mouseout={() => hovered = false}
>

  <div class="parent_children">
    <div class="icon_name">
      <div class="name-icons">
        <button class="icon-button" on:click={toggleCollapse}>
          {#if (item.itemType !== "file" || (item.itemType === "file" && item.children.length > 0)) }
          {#if item.collapsed}
          <span class="right_icon_light"></span>
          {/if}
          {#if !item.collapsed}
          <span class="down_icon_light"></span>
          {/if}
          {/if}
        </button>
        <div class="icons_and_names">
            <div class="getIcon_lable">
              {@html getIcon(item.itemType)}
              {#if item.itemType == "file"}
              <div class="name_with_cursor" on:click={() => openFile(item)}>
                {item.label}
              </div>
              {:else if item.itemType == "function"}
              <div class="name_with_cursor" on:click={() => findFunction(item)}>
                {item.label} 
              </div>
              {:else}
              <div class="name">
                {item.label} 
              </div>
              {/if}
            </div>
        
          {#if item.itemType == "file" && item.children.length > 0}
          <button class="icon-button" on:click={()=>playFunctionForAll(item)} 
            style="opacity: {hovered ? 1 : 0}; pointer-events: {hovered ? 'auto' : 'none'};"
      
            >
            <span class="play-icon-light"></span>
          </button>
          {/if}
          
        </div>
      </div>
      <div class="function_icons">
        {#if item.itemType == "function" } 
        {#if item.contextValue === 'testFileAvailableBothItem'}
        <button class="icon-button" on:click={()=>findTestFile(item)}>
          <span class="findFolder_icon_light"></span>
        </button>
        {/if}
      <button class="icon-button" on:click={()=>playFunction(item)}    
        style="opacity: {hovered ? 1 : 0}; pointer-events: {hovered ? 'auto' : 'none'};"
        >
        <span class="play-icon-light"></span>
      </button>
      {/if}
      </div>
      
    </div>
    {#if  !item.collapsed && item.children.length > 0}
    <ul class="children-list">
      {#each item.children as child}
      <TreeItem item={child} vscode={vscode} />
      {/each}
    </ul>
    {/if}
  </div>
</li>

<style>
 /* Parent list items */
.list-items {
  display: flex;
  flex-direction: column; /* Ensure children stack vertically */
  padding: 2px 0;
  width: 100%;
}


.name-icons{
  display: flex;
  flex-direction: row;
  width: 100%;
}
/* Ensure icons don't disappear */
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: transparent;
  color: var(--vscode-foreground);
  font-size: 20px;
  cursor: pointer;
  box-shadow: none;
  width: 20px;
  height: 20px;
  flex-shrink: 0; /* Prevent shrinking */
  min-width: 20px; /* Ensure a minimum width */
}

.getIcon_lable{
  display: flex;
  justify-content: space-between;
  gap:4px;
}
.function_icons {
  display: flex;
  flex-shrink: 0; /* Prevent the icons from shrinking */
  justify-content:center; /* Align icons to the right */
  gap: 3px; /* Optional: Add spacing between icons */
  margin-right: 10px;
}

.name{
  margin-right: 2px;
}
.name_with_cursor {
  flex-grow: 1; /* Allow the name to grow and take up remaining space */
  overflow: hidden; /* Hide overflow text */
  text-overflow: ellipsis; /* Add ellipsis for overflowing text */
  white-space: nowrap; /* Prevent text wrapping */
  margin-right: 8px; /* Optional: Add spacing from icons */
}

.name_with_cursor:hover{
  cursor: pointer;
}

button:focus {
    outline: none; /* Remove the blue border on focus for all buttons */
  }
  button {
    
    outline: none; /* Remove the blue border on focus for all buttons */
  }
/* Parent container */
.parent_children {
  display: flex;
  flex-direction: column; /* Ensure everything stays in a column */
  align-items: start; /* Align content to the start (left and top) */
  width: 100%;
}


.icons_and_names {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-shrink: 0; /* Prevent shrinking of the icons and names */
  min-width: 0; /* Allow proper wrapping */
  justify-content: space-between; /* Keep the content properly spaced */
  width: 95%;
}

/* Icon and name alignment */ 
.icon_name {
  display: flex;
  justify-content: space-between; /* Ensures the name and icons are spaced properly */
  align-items: center;
  width: 100%; /* Make it take full width of the parent container */
  min-width: 0; /* Prevent content overflow */
  gap: 8px; /* Optional: Adjust spacing between elements */
  overflow: hidden; /* Prevent overflowing content */
}


.icon_name:hover {
  background-color: var(--vscode-list-hoverBackground); /* Use a lighter background color */
}

/* Styling for child lists */
/* Child list items */
.children-list {
  list-style: none;
  width:100%;
  overflow: visible; /* Ensure children remain visible */
}


/* Additional spacing for file and folder icons */
.icon {
  padding-right: 5px;
}

</style>
