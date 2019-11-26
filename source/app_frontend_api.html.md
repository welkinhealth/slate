# Welkin Apps Overview

Welkin Apps can be embedded into the Welkin experience to augment the features available natively in Welkin. These apps are developed separately and displayed within an iFrame inside Welkin's Care Staff interface. Welkin Apps have access to all the data stored within Welkin via the [Data API](https://developers.welkinhealth.com/#overview)

# Apps API Overview
The Welkin Apps Frontend API enables Welkin and an embedded App to communicate and call functions on each other. This tight integration allows for a seamless experience across areas of Welkin functionality. For example, an App needs to be able to tell Welkin to make visible the iFrame containing the App or to transition Welkin to a specific patient's profile. An App also needs to be informed when its parent page is updated.

Browsers do not allow content within iFrames to directly access the content of the containing page nor can the containing page access the content of the iframe. In Welkin's case this means that plugins are prevented from accessing information that they shouldn't have access to or modifying the entire user experience in ways they shouldn't be able to. It also means that without a communication conduit there is no way to make Apps and Welkin feel like a single experience.

To enable Apps to have limited control over Welkin's UI we have exposed an API via which Apps can perform actions like telling Welkin to navigate the user to a specific patient page.

**Welkin's Apps API is in active development. Expect changes and improvements.**

## Example use case
A call center management system needs to navigate the worker to a patient page when the worker answers a call from a patient.

A call center management system also needs to update the UI within the App depending on if the user is on a patient profile or the inbox. On the patient profile the action in the App might be to call one of the patient's phone numbers. On the inbox the primary action might be management of the upcoming call schedule.

A worker might minimize the call center management system to see more of the Welkin UI but when a call comes in the App needs to open the App so that the worker is aware of the inbound call.


# API Communication Model
Welkin's Frontend App API utilizes `MessageChannel` API to transmit messages between Apps in iFrames and Welkin's UI. The MessageChannel APIs are part of the HTML spec and supported by all modern browsers.

A MessageChannel is setup between Welkin and the unique instance of the App. Once each iFramed instance of the App has loaded it is sent a `PostMessage` to establish a permanent MessageChannel. All future communications between Welkin's UI and the App are sent via the MessageChanel.

Once the MessageChannel is established between Welkin and the App then the App can call methods on Welkin and Welkin can send state change updates and method responses back to the App. The available methods are documented below.

MessageChannels only support the transmission of text and thus a message format has been defined which Welkin uses to encode and decode method calls between Welkin and Apps. Due to the asynchronous nature of MessageChannel messages, the App must include a `call_id` when sending method call messages to Welkin so that response messages are tied to that same `call_id`.

Reference documents for `MessageChannel` API:
* [postMessage doc by Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
* [Channel Messaging doc by Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API)

# MessageChannel setup
> Example Welkin code

```js
var iframe = document.getElementById('app_instance_1');

var channel = new MessageChannel();
var port1 = channel.port1;
// Not shown here: event listener which Welkin uses to receives messages back on port1 of the Channel

// Wait for the iframe to load
iframe.addEventListener("load", onLoad);

function onLoad() {
    // Transfer port2 to the iframe
    var window = iframe.contentWindow;
    window.postMessage('welkin_init', 'app.welkin-video-chat.com', [channel.port2]);

    // Transfer the first state message from Welkin to plugin
    port1.postMessage(state_update, 'app.welkin-video-chat.com');
}
```

> Example App code

```js
var port2; // This port will receive all future messages from Welkin

// Listen for the initial port transfer message
window.addEventListener('message', initPort);

// Setup the transferred port
function initPort(event) {
    if (event.origin !== "https://coach.welkinhealth.com") {
        return;
    }
    if (event.data !== "welkin_init") {
        return;
    }
    port2 = e.ports[0];

    // Add a Message listener to the port to accept future messages
    port2.onmessage = messageHandler;
}
```


When Welkin loads the iFrame containing the App, Welkin will send a postMessage to the iFrame with a message which contains a MessageChannel port reference. The App will then validate that the message came from Welkin (see example code below). Once the App has verified the message origin then it will store the MessageChannel port for future message passing to and from Welkin.

After the first message from Welkin, all communications between Welkin and the plugin will happen via the MessageChannel and no additional postMessages will be sent directly to the iFrame by Welkin.


The example at right sends the channel `port2` to the plugin and then sends a message over that channel.

General example of PostMessages and ChannelMessages [available on github](https://github.com/mdn/dom-examples/tree/master/channel-messaging-multimessage) not by Welkin

# Security
`targetOrigin` param of `Window.postMessage(...)` will be set to the domain of the App which ensures that the message is only sent to windows that contain content from the App's domain. This ensures that the MessageChannel is established with the correct App and is not visible to any other party.

The plugin should validate that the `MessageEvent.origin` is `https://coach.welkinhealth.com` to ensure that the PostMessage is from Welkin and that you're only accepting a MessageChannel from Welkin.

Once a MessageChannel has been sent from Welkin frontend to the App then communications will only be visible to Welkin and that instance of the plugin.

# App to Welkin messages

These messages allow the App to control functionality within Welkin.

## welkin_function

An App calls a Welkin function to make changes to Welkin and send information to Welkin.

> Example welkin_function message

```json
{
   "message_type": "welkin_function",
   "message": {
      "function": "navigate_to",
      "params": {
          "page_type": "patient",
          "page_id": "edb98143-e9d1-42c1-1197-6de2db454d27"
      },
      "call_id": "dca40142-f8e1-43d0-bd88-8da2eb656d62"
   }
}
```

`message` object fields:

* `function`
  * Name of the function that the App is calling on the Welkin UI.
* `params`
  * If the function takes parameters then a list of parameters can be specified.
* `call_id`
  * The App assigns each invocation of a method call a unique ID so that the app can match the response message to the method invocation.

#### Available Functions:

* `open_frame`
  * Opens the container of this plugin. Can be called even if the App frame is already open.
  * No return values.
* `collapse_frame`
  * Collapses the container of this plugin. Can be called even if the App frame is already collapsed.
  * No return values.
* `close_frame`
  * Removes the container for this App instance from the DOM. This will terminate this instance of the App.
  * No return values.
* `navigate_to`
  * Tells Welkin to navigate to a specific patient or page. For example, switch the current patient being displayed. This should not be called automatically by the App but rather only in response to user input by the worker so that the worker can confirm that they are ready.
  * Parameters:
     * `page_type` Specifies what page type the UI is being navigated to. (possible values: "`patient`", "`inbox`")
     * `page_id` (possible values: ID of a patient if page is a patient otherwise "`None`")
  * Return:
     * Status `200` if the page could be navigated.
     * Status `404` if that `resource_id` doesn't exist or can't be accessed by the worker.

# Welkin to App messages

These messages notify Apps of changes and events that have happened in Welkin. The App is not required to respond to any of these messages. Welkin doesn't require any response to these messages.

## current_state
Welkin notifies an App about the current state of the Welkin UI and the App's container. These messages are sent to all Apps whenever a change is made to Welkin UI state. These messages are sent to specific Apps when changes are made to their container.

> Example current_state message

```json
{
   "message_type": "current_state",
   "message": {
       "state": {
          "parent_page_type": "patient",
          "parent_page_id": "65982b40-270f-4d29-8020-11f6298dd847",
          "frame": "expanded"
       }
   }
}
```

`message.state` fields:


* `parent_page_type`
  * What type of page is the Welkin UI currently showing.
  * Values:
     * `patient`
     * `worker_profile`
     * `profile`
     * `search`
     * `inbox`
     * `admin`


* `parent_page_id`
  * What is the resource ID of the page that the Welkin UI is currently showing. For example, the patient ID if the worker is on a patient record.
  * Values:
     * guid of a patient or profile if the `parent_page_type` is `patient` or `profile`
     * Otherwise `null`


* `frame`
  * Enum representing if the frame containing this instance of the App is currently expanded or collapsed on the Welkin screen.
  * Values:
     * `collapsed`
     * `expanded`


More fields will be added to the `state` object as Welkin expands the capabilities of the Apps API.

## event_notification
Welkin tells an App about an event that took place in Welkin.
Note: There are currently no supported event notifications utilizing this API.

`message` object fields:

* `event`
  * field tells the App what type of event took place and what the parameters are for that event
* `event_notification_id`
  * field contains a guid which uniquely identifies this event and is used to identify responses from the App to event notifications.
* `params`
  * field contain the information specific to this instance of the event type

> Example event_notification message

```json
{
   "message_type": "event_notification",
   "message": {
      "event": "click_to_call",
      "params": {
          "number": "+1-555-555-1234"
      },
      "event_notification_id": "30f27b3a-5c03-48cf-9bec-90a2d68ece9d"
   }
}
```


**Example:**

A Care Staff member clicked on a phone number and the App has been configured to respond to click to call actions. Welkin notifies the app of this click to call event.

## function_response (not currently available)
Welkin responds to method call from Apps to update the app with the result of the method.

> Example function_response message

```json
{
   "message_type": "method_response",
   "message": {
      "call_id": "dca40142-f8e1-43d0-bd88-8da2eb656d62",
      "status_code": 200,
      "return": {
          "field_1": "value",
          "field_n": "value"
      }
   }
}
```

`message` object fields:

* `call_id`
  * The response references the `call_id` which initiated the method
* `status_code`
  * Indicates if the method succeeded or had an error. Uses http status codes.
* `return`
  * A method might return values to the plugin which are serialized as JSON and included here.

After the method has completed the state of the App container or Welkin might have changed. In this case Welkin will send a `current_state` message as with all changes to state.
