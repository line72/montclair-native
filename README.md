# Montclair

This is a simple projects to show a live view of all the buses in the
Birmigham, AL System.  While it is designed for Birmingham, AL, it
works with any realtime transit agency utilizing Availtec or TransLoc.

## Running

This has been tested on the latest LTS Node (8.9.4)

Install react-native-cli:

`npm install -g react-native-cli`

Install the dependencies:

`npm install`

Copy the Configuration.js.tmpl

`cp Configuration.js.tmpl Configuration.js`

Edit the Configuration.js to include your API keys (if necessary) and the agencies.

For running on Android:

`react-native run-android`

For running on iOS:

`react-native run-ios`

