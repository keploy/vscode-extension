<script>
  import TreeItem from './TreeItem.svelte';
  
  export let item;
  export let vscode;
  const toggleCollapse = () => {
      item.collapsed = !item.collapsed;
  };

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

  const getIcon = (itemType) => {
    switch (itemType) {
        case 'folder':
            return '<span class="Folder_icon_light"></span>';
        case 'file':
            return '<span class="file_icon_light"></span>';
        case 'class':
            return '<span class="Class_icon_light"></span>';
        case 'function':
            return '<span class="Function_icon_light"></span>';
        default:
            return '<span class="findDefault_icon_light"></span>';
    }
};

</script>

<li class="list-items">
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
          {@html getIcon(item.itemType)}
          <div class="name">
            {item.label}
          </div>
        </div>
      </div>
      <div class="function_icons">
        {#if item.itemType == "function"}
        {#if item.contextValue === 'testFileAvailableBothItem'}
        <button class="icon-button" on:click={()=>findTestFile(item)}>
          <span class="findFolder_icon_light"></span>
        </button>
        {/if}
        
      <button class="icon-button" on:click={()=>playFunction(item)}>
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
  margin: 2px 0;
  width: "full";
}

.name-icons{
  display: flex;
  flex-direction: row;
  width: 100%;
}
/* Icon button for collapse/expand */
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


.function_icons{
  display: flex;

}
.name{
  margin-right: 2px;
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


.icons_and_names{
  display: flex;
  gap: 5px;
  width: 100%;
}
/* Icon and name alignment */
.icon_name {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Keep the icon and name vertically aligned */
  border-radius: 5px; /* Optional: Add rounded corners for better aesthetics */
  transition: background-color 0.3s ease, color 0.3s ease; /* Smooth transition for hover effect */
  width: 90%;
}

.icon_name:hover {
  background-color: var(--vscode-list-hoverBackground); /* Use a lighter background color */
  color: var(--vscode-hoverForeground); /* Optional: Change text color on hover */
  opacity: 0.9; /* Slightly reduce opacity for a "light" effect */
}

/* Styling for child lists */
.children-list {
  margin-left: 20px; /* Indent children to the right */
  padding: 0;
  list-style: none;
  width: 100%;
}

/* Styling for individual child items */
.children-list > li {
  padding: 5px 0;
}

/* Additional spacing for file and folder icons */
.icon {
  padding-right: 5px;
}

</style>
