# Beefree SDK CSAPI Simple Integration

This project demonstrates a simple integration of the [Beefree SDK Content Services API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/content-services-api-reference), demonstrating how to export email templates as **Plain Text**, **PDF**, and **HTML** using a Node.js backend (running on Glitch) and a lightweight frontend interface (viewable on Codesandbox).

The project is divided into two parts:

1\. **Backend** (Node.js, Express) - Hosted on Glitch, responsible for interacting with the [Beefree SDK Content Services API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/content-services-api-reference) to export templates in different formats.

2\. **Frontend** (HTML, JavaScript) - Hosted on Codesandbox, providing a user interface for inputting JSON/HTML templates and receiving exports from the backend.

## Features

- Export email templates as **Plain Text**, **HTML**, or **PDF** using the [Beefree SDK Content Services API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/content-services-api-reference).

- User-friendly interface with simple interactions.

- Clear separation between frontend and backend, using server-to-server communication.

## Prerequisites

Before getting started, ensure you have the following:

- A [**Beefree SDK** API key](https://docs.beefree.io/beefree-sdk/apis/content-services-api/content-services-api-reference#api-key) for authentication. You will need to replace the placeholder in `server.js` with your actual API key, which you can obtain in the [Beefree SDK Developer Console](https://developers.beefree.io/accounts/login/?from=website_menu).

- A [**Glitch** account](https://glitch.com) for running the backend.

- A [**Codesandbox** account](https://codesandbox.io) for previewing and interacting with the frontend.

## Backend (Glitch)

The backend is built using **Node.js** and **Express**, and it communicates with the Beefree SDK Content Services API to handle requests. The main operations (Plain Text, HTML, and PDF export) are performed server-to-server.

### Setting Up the Backend in Glitch

1\. **Go to Glitch**: Create a new project in Glitch and upload the `server.js` file.

2\. **Dependencies**: Make sure your `package.json` includes the necessary dependencies:

```
   {

     "name": "glitch-beefree-integration",

     "version": "1.0.0",

     "description": "Beefree SDK integration on Glitch",

     "main": "server.js",

     "scripts": {

       "start": "node server.js"

     },

     "dependencies": {

       "express": "^4.18.2",

       "axios": "^1.4.0",

       "cors": "^2.8.5",

       "body-parser": "^1.20.2"

     },

     "engines": {

       "node": "14.x"

     }

   }

```

3\. **API Token**: Update the `server.js` file to include your actual Beefree SDK API token:

```
const apiToken = 'Bearer YOUR_API_TOKEN_HERE'; // Replace with your actual API token
```

4\. **Run the Server**: Once everything is set up, click "Preview" in Glitch to obtain your backend server URL. This URL will be used to communicate with the frontend.

### Glitch Backend Behavior

- The backend exposes endpoints to handle Plain Text, PDF, and HTML export requests.

- The endpoints listen for POST requests from the frontend, process the data using the Beefree SDK Content Services API, and return the exported result.

- Glitch serves as a lightweight backend, running the Node.js server and allowing frontend (Codesandbox) communication.

## Frontend (Codesandbox)

The frontend is a simple **HTML** interface that allows users to input email templates as JSON or HTML and request exports. It connects to the backend on Glitch via HTTP requests.

### Setting Up the Frontend in Codesandbox

1\. **Go to Codesandbox**: Create a new HTML/CSS/JS sandbox.

2\. **Add Frontend Code**: Upload the `index.html` file. This file will serve as the interface where users can paste template data.

3\. **Backend URL**: In the `index.html` file, update the backend URL to point to your Glitch server:

```
   const apiUrl = "https://your-glitch-backend-url.glitch.me";  // Replace with your Glitch URL
```

4\. **Preview the Application**: Once set up, click "Preview" in Codesandbox to see the frontend in action.

### Codesandbox Frontend Behavior

- The frontend is a single-page interface with input fields and buttons to submit template data to the backend.

- It sends HTTP requests (using the fetch API) to the Glitch server for exporting templates in the desired format (Plain Text, PDF, or HTML).

- The backend processes the request and sends the export back to the frontend, where it is displayed or provided as a download link (for PDF).

## How the Application Works

- **Frontend-to-Backend Communication**: The frontend (on Codesandbox) sends a POST request to the backend (on Glitch) with either JSON (for Plain Text or HTML exports) or HTML (for PDF exports).

- **Backend Logic**: The backend processes the request using the Beefree SDK CSAPI, interacting with its services to convert the template into the requested format. The response is then sent back to the frontend.

- **Exporting Formats**:
    - JSON input can be exported as Plain Text or HTML.
    - HTML input can be exported as a PDF.

## Beefree SDK Content Services API Requirements

- **Authentication**: The [Beefree SDK Content Services API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/content-services-api-reference) requires a valid API token to authenticate requests. Ensure that the `apiToken` variable in `server.js` is set to your actual API key, which you can find in your [Beefree SDK Developer Console](https://developers.beefree.io/accounts/login/?from=website_menu).

- **API Endpoints**: The backend communicates with the Beefree SDK Content Services API to export the templates in different formats. The API handles the conversion of JSON to Plain Text/HTML and HTML to PDF.

## Summary of Files

- **Backend (server.js)**: The backend logic that handles requests and interacts with the Beefree SDK Content Services API, hosted on Glitch.

- **Frontend (index.html)**: The user interface for inputting templates and displaying the exported content, viewable on Codesandbox.

## Running the Application

1. **Backend**: Run the backend server on Glitch by uploading `server.js` and ensuring all dependencies are in `package.json`.

2. **Frontend**: Preview the frontend on Codesandbox by uploading `index.html` and linking it to the Glitch backend URL.

With this setup, you can easily input JSON or HTML templates via the frontend and export them using the [Beefree SDK Content Services API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/content-services-api-reference) through your Glitch backend.
