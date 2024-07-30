<script>
    import '../app.css';
  </script>
  
  <body class="baloo-2-custom">
    <div class="hidden" id="loader"></div>
    <div class="grid grid-cols-2 place-items-center" id="topGrid">
      <div
        class="keploylogo h-[30px]"
        alt="Keploy Logo"
      >
      </div>  
      <h2 class="info">Test Summary</h2>
    </div>
    <hr class="my-2" />
    <!-- 4 Column Grid -->
    <div class="grid grid-cols-4 place-items-center" id="completeTestSummaryGrid">
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
    <button id="rerunTestSuiteButton" class="mx-auto block w-[90%] h-[30px] py-1 px-2 mt-5">Rerun Test Cases</button>
  </body>