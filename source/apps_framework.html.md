# Welkin Apps Overview

# What are Welkin Apps?

Apps allow Welkin's customers to integrate tools that they already use to create a single workflow within Welkin. Welkin supports showing UI built by 3rd parties within the Welkin experience. This UI extensibility is called an App in the Welkin ecosystem. Welkin loads these external tools, once configured, into secure containers within the Welkin Care Staff interface.

Welkin Apps have access to all the data stored within Welkin via the [Data API](https://developers.welkinhealth.com/#overview).

# Getting Started

Welkin Apps are currently in limited release and you must contact your Welkin Account Manager to get started. They will help guide you through starting the development process.

# Example use case

A call center management system needs to navigate the worker to a patient page when the worker answers a call from a patient.

A call center management system also needs to update the UI within the App depending on if the user is on a patient profile or the inbox. On the patient profile the action in the App might be to call one of the patient's phone numbers. On the inbox the primary action might be management of the upcoming call schedule.

A worker might minimize the call center management system to see more of the Welkin UI but when a call comes in the App needs to open the App so that the worker is aware of the inbound call.

# Functional overview of Apps

When launched, the App will be loaded into an iFrame within Welkin's UI. The iframe container will show above the timeline and other Welkin UI similar to the appointment scheduler and assessments view.

To load the iframe Welkin will send parameters via a POST request, which indicate the coach who is logged in and if applicable which patient’s profile they are looking at. These parameters are encoded in a JWT and signed with App specific credentials. The App will then redirect to the appropriate URL after the JWT is verified, which is the URL that will be displayed in the iFrame.

The App will have full control over the content (subject to iFrame sandbox restrictions) shown within the iFrame but will have no direct access to the rest of the Welkin page. If the App needs to control functionality within Welkin it must communicate via the [Apps API](https://developers.welkinhealth.com/apps_frontend_api.html). If the App needs data from Welkin it must access it via the [Data API](https://developers.welkinhealth.com). If the App needs to post data back to Welkin that too must happen via the [Data API](https://developers.welkinhealth.com).

# Frontend API

Welkin Apps can interact with the Welkin UI via the [Apps API](https://developers.welkinhealth.com/apps_frontend_api.html). This frontend javascript API allows apps to control the Welkin UI and receive updates on changes to the UI.

**[Apps API Documentation](https://developers.welkinhealth.com/apps_frontend_api.html)**

# How are Apps invoked?

Apps can be invoked from the Action Bar as patient specific actions which will be performed by the App. This invocation method is often used when the trigger for interacting with the app is a Care Staff member's desire to perform a specific action.

Apps can also be invoked as persistent components of the Welkin UI which are visible across all pages in the Welkin UI. These persistent experiences are often used when the trigger for interacting with the App's functionality comes from an outside source like an inbound phone call.

As an App developer it is up to you to decide how users will access your UI within Welkin.

# UI configuration

As an App developer you must supply Welkin with an icon representing your App, the action bar button text (if applicable), and provide the Authentication url for the App. Welkin will then use this information to configure your App.

Once Welkin adds the app to the Welkin environment configuration, the App's location in the action bar can be configured via Workshop.

# Welkin's responsibilities
* Issue and share security credentials for authenticating the App
* Configure the name and icon of the App
* Configure the App for Welkin environment configurations

# Developer responsibilities
* Develop the App web frontend code, to be displayed within the iframe
* Develop the server to receive App requests from Welkin and serve the aforementioned frontend code
  * The app should be fully loaded and displayed within 1 second of receiving the authentication request. If full loading takes longer than this a loading spinner should be displayed.
  * Clicks within the app should react immediately giving the user feedback on the actions they've taken.
* Develop the POST endpoint for receiving authentication information and redirect requests to the App ui
* Make any updates to Welkin data via Welkin's Data APIs developers.welkinhealth.com as a result of actions taken within the App
* Push notifications or other communications to patient if the App has a patient facing component

# Technical details

## JWT auth claim

> Example request from Welkin (javascript)

```js
// this is a simplified example because the client_id and client_secret would not be transmitted to the browser
function send_app_request(client_id, client_secret, patient_id, worker_id, provider_id):
  let claim = {
    'iss': client_id,
    'aud': audience,
    'exp': Math.floor(Date.now() / 1000),
    'welkin_patient_id': patient_id,
    'welkin_worker_id': worker_id,
    'welkin_provider_id': provider_id,
  };
  let token = jwt.encode(claim, client_secret, algorithm='HS256');
  let body = {
    'token': token
  };

  // resp should include the content based on the redirect to be shown in the iFrame
  resp = requests.post('https://www.example.com/test/app', data=body);
```

Welkin will send a POST request to the App, which will include the patient_id (if the app is configured as a patient action), worker_id, and provider_id in the JWT payload. The JWT will be included in the request body. When the request is received by the App, it will need to decode the JWT with it's credentials, and then will redirect (HTTP response 302) to the url that serves the content which will be displayed in the iFrame.

## Default iFrame dimensions
Width: `750px`

Height: `Dynamic` (dependent on browser height)

Width can be configured by Welkin engineering if required.

## iFrame sandboxing
The content within the iframe will be able to use javascript but will only have access to the DOM of the content within the iframe. As the App developer you will need to ensure that the App can function within the following set of security restrictions.

iframe Sandbox settings:

* `allow-scripts`
* `allow-same-origin`
* `allow-forms`
* `allow-popups`
* `allow="camera; microphone"`

## Tear down
The 3rd party app should respond gracefully to being closed either because the Welkin iframe was closed or Welkin's window was closed. There will not be any notification sent to the App that the app is being closed.
