<style>
    .configInput{
        width: 90%;
        margin: 10px auto;
    }
    
    #initialiseConfig {
        display: none;
        text-align: center;
        grid-template-columns: 1fr;
        align-items: center;
        justify-content: center;
    }

</style>
<main>
<div id="initialiseConfig">
    <h3 class="info">Initialise The Keploy Config File</h3>
    <!-- //Command, path , noise , re-record , normalise -->
    <input class="configInput" type="text" id="configCommand" name="command" placeholder="Command" />
    <input class="configInput" type="text" id="configPath" name="path" placeholder="Path (Default value : ./)"  />
 </div>
</main>