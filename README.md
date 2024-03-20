# Keploy-VsCode 

Try it out: [Vscode Extension](https://marketplace.visualstudio.com/items?itemName=Akash-Singh04.heykeploy)

### NOTE : This Extension is a prototype and not ready for productions uses.

## Features

Keploy-VsCode offers the following features:

- **Keploy Record** :  Record Testcases with Keploy 
- **Keploy Test** : Replay Recorded Testcases with Keploy
- **Keploy Update** :  Update your Keploy to the latest version
- **Keploy Version Display**: Get the latest version of Keploy directly in your Visual Studio Code.



## Release Notes

### 2.6.0
-  UI Improvements

### 2.5.0
- Added Support for Flags

### 2.3.0
- Implemented New UI with Separate Pages

## 2.2.0
- Bug Fixes, UI imporvements, Script Improvements

### 2.1.0
-  Wrote Integration tests for the extension
-  Implemented Integration tests In CI pipeline


### 2.0.0
- Added support for Keploy Test Command

### 1.2.2
- Added support for installing Keploy
- Better UI Updates

### 1.1.0
- Added Support for Keploy Record

### 1.0.0
- Integrated Svelte using rollup instead of using plain HTML!

### 0.2.2
- Added better error handling.
- More UI updates


### 0.2.0

- Added support for docker and other OS

### 0.1.3

- Added check for current keploy version
- Added better error Handling 

### 0.1.2

- Added Keploy Update to update the keploy binary zzzzzzzz

### 0.1.1

- Added Css Styling and logo
- Added boilerplate for keploy update

### 0.1.0

- Added SidePanel View to extension
- Created button to fetch latest keploy version

### 0.0.3

- Added link to Keploy repository

### 0.0.2

- Added Keploy logo.
- Added Github Actions workflow to automatically publish to VScode Marketplace

### 0.0.1

- Initial release of Keploy-VsCode.
- Added functionality to display the latest Keploy version.


## Limitations

Currently there is no way for us to know if the executed command in the terminal was successful or not as the VScode Terminal API has depricated [Terminal.onDidWriteData](https://github.com/microsoft/vscode/issues/78574): 

Reference: [Issue](https://stackoverflow.com/a/62774501)

A workaround patch for this is documented here, which i have implemented partially in my code in conjuction with the VSCode Terminal API: [Solution](https://stackoverflow.com/a/67732928)

## Requirements

There are no specific requirements or dependencies for using Keploy-VsCode. Simply install the extension and start enjoying its features!

## Extension Settings

Keploy-VsCode doesn't add any custom settings to Visual Studio Code at the moment.

## Following Extension Guidelines

Keploy-VsCode follows the [Visual Studio Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) to ensure a seamless experience for users.



Enjoy using Keploy-VsCode! If you find it helpful, consider leaving a review or starring the repository on GitHub. Thank you!
