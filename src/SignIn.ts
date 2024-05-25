export default async function SignIn() {
    // make a GET api call to app.keploy.io and get an access token and store it in the global state
    const response = await fetch('https://app.keploy.io/signin?extension=true', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    // const data = await response.json();
    const data = {
        accessToken : "1234567890"
    };
    console.log("API CALL WAS MADE WITH DUMMY DATA");
    return data ;
}