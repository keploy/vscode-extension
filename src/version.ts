export default async function getKeployVersion() {
    // GitHub repository details
	const repoOwner = "keploy";
	const repoName = "keploy";

	const apiURL =`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

    // Get the latest release
    const response = await fetch(apiURL);
    const data:any = await response.json();
    const latestVersion = data.tag_name;
    return latestVersion;
}