<script>
</script>

<body class="baloo-2-custom">
    <div class="loader" id="loader"></div>
    <div id="topGrid">
        <div
            class="keploylogo"
            alt="Keploy Logo"
            style="
    height: 30px;"
        >
        </div>  
        <h2 class="info">Test Summary</h2>
    </div>
    <hr />
    <!-- 4 Column Grid -->
    <div id="completeTestSummaryGrid">
        <div id="testSuiteName" class="info">
            <p>Name</p>
        </div>
        <div id="totalTestCases" class="info">
            <p>Total</p>
        </div>
        <div id="testCasesPassed" class="success">
            <p>Passed</p>
        </div>
        <div id="testCasesFailed" class="error">
            <p>Failed</p>
        </div>
        
    </div>
    <button id="rerunTestSuiteButton">Rerun Test Cases</button>
</body>

<style>
    .loader {
        display: none;
    }
    #topGrid {
        display: grid;
        place-items: center;
        grid-template-columns: 1fr 1fr;
    }
    #topGrid img {
        width: 50%;
    }
    #completeTestSummaryGrid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        place-items: center;
    }
    #completeTestSummaryGrid div {
        display: grid;
        place-items: center;
        margin: 10px;
        grid-template-columns: 1fr;
    }
    button {
        margin: 5px auto;
        width: 90%;
        height: 30px;
        padding: 5px;
    }
</style>
