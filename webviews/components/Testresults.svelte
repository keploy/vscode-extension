<script>
    import '../app.css';
  </script>
  
  <body class="baloo-2-custom">
    <div class="hidden" id="loader"></div>
    <div class="grid grid-cols-2 place-items-center" id="topGrid">
      <div
        class="flex justify-center mt-5 mb-5 w-full h-[10%] keploylogo h-[30px]"
        alt="Keploy Logo"
      >
      </div>  
      <h2 class="text-primary-300 text-center mt-1">Test Summary</h2>
    </div>
    <hr class="my-2" />
    <!-- 4 Column Grid -->
    <div class="grid grid-cols-4 place-items-center" id="completeTestSummaryGrid">
      <div id="testSuiteName" class="text-primary-300 text-center mt-1">
        <p>Name</p>
      </div>
      <div id="totalTestCases" class="text-primary-300 text-center mt-1">
        <p>Total</p>
      </div>
      <div id="testCasesPassed" class="text-accent-100 text-center mt-1">
        <p>Passed</p>
      </div>
      <div id="testCasesFailed" class="text-[#9c1a0c] text-center mt-1.25">
        <p>Failed</p>
      </div>
    </div>
    <button id="rerunTestSuiteButton" class="mx-auto block w-[90%] h-[30px] py-1 px-2 mt-5">Rerun Test Cases</button>
  </body>