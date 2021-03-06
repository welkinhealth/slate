---
title: Welkin Data API Reference

language_tabs:
  - python
  - javascript
  - shell

search: true

rhs: true
---

# Data API Overview

Welkin’s goal is to empower you, our customers, to deliver patient-centered care. Our API exists in support of this goal. Whether it’s data kept within our platform, or your pre-existing systems, we think you should have complete, real-time access and agency over your own data.

Using Welkin's APIs will allow you to keep your systems in sync with Welkin.

By design, our API notifies your subscribed systems of any updates to your resources within Welkin. For example, when a patient's phone number is changed in Welkin, that information is immediately sent to your systems, keeping them up to date with the latest values stored in our platform.

Welkin's API also transfer the data created and updated in your 3rd party systems into our platform, keeping your information across systems aligned.

This documentation outlines the data types available via Welkin’s APIs and the usage of these APIs. APIs exist for all of the core data types managed within Welkin.

**Base URL:** https://api.welkinhealth.com

## API updates
**Welkin's API is in active development.** We will be making backwards compatible changes over the coming months with little or no advanced notice. You should expect Welkin to add additional optional fields to resource schemas and new resource types to the API. Your integration should be built with this understanding and should not break with the addition of new fields or resource types. Use of strict schema validation is not recommended. Breaking changes will be communicated in advance of rollout and we will work with you to make the transition.

## Authentication

> Example token fetch

```python
import arrow
import jwt
import requests

JWT_BEARER_URI = 'urn:ietf:params:oauth:grant-type:jwt-bearer'

def get_welkin_api_token(client_id, client_secret, scope, endpoint):
  claim = {
    'iss': client_id,
    'aud': endpoint,
    'exp': arrow.utcnow().shift(seconds=3600).timestamp,
    'scope': scope,
  }
  assertion = jwt.encode(claim, client_secret, algorithm='HS256')
  params = {
    'assertion': assertion,
    'grant_type': JWT_BEARER_URI
  }
  resp = requests.post(endpoint, data=params)
  token = resp.json()['access_token']
  return token

token = get_welkin_api_token('<client_id>',
                             '<client_secret>',
                             '<list of space separated scopes>',
                             # example scope string: 'calls.read patients.write'
                             'https://api.welkinhealth.com/v1/token')
```

```javascript
const axios = require('axios');
const jwt_simple = require('jwt-simple');
const querystring = require('querystring');

const JWT_BEARER_URI = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const WELKIN_TOKEN_URL = 'https://api.welkinhealth.com/v1/token';
const WELKIN_ACCESS_TOKEN = '';

function get_welkin_api_token(client_id, client_secret, scope, endpoint) {
  const token_data = {
    'iss': client_id,
    'aud': endpoint,
    'exp': Math.round(new Date() / 1000) + 3600, // one hour token request
    'scope': scope,
  }
  const token = jwt_simple.encode(token_data, , 'HS256');
  try {
    const res = await axios({
      method: 'post',
      url: endpoint,
      data: querystring.stringify(
        {'assertion': token.toString(),
        'grant_type': JWT_BEARER_URI
        }
      )
    });
    return res.data.access_token;
  } catch (e) {
    console.log('error could not get access token');
    return '';
  }
}

WELKIN_ACCESS_TOKEN = get_welkin_api_token(process.env.WELKIN_CLIENT_ID,
                                           process.env.WELKIN_SECRET,
                                           '<list of space separated scopes',
                                           // example scope string: 'calls.read patients.write'
                                           WELKIN_TOKEN_URL);
```

```shell
CURL example not available
```

> Example token usage

```python
import requests

headers = {"Authorization": "Bearer <token>"}

resp = requests.get("https://api.welkinhealth.com/v1/patients", headers=headers).json()
```

```javascript
const axios = require('axios');

const headers = {'Authorization': 'Bearer <token>'}
const url = 'https://api.welkinhealth.com/v1/patients';

try {
  const res = await axios.get(url, {headers: headers});
  const data = res.data.data;
} catch (e) {
  console.log("couldn't get data from Welkin");
}
```

```shell
# no shell example for JWT construction

# POST with form-urlencoded body
curl https://api.welkinhealth.com/v1/token -X POST -d 'assertion=eyJ.........OmU&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer'

# POST with json body
curl https://api.welkinhealth.com/v1/token -X POST -d ''
```

Welkin's APIs are secured using a 2-legged OAuth JWT-Bearer authorization flow. This ensures that data stored within Welkin remains secure and is not accessible by unauthorized parties.

#### Authentication Steps:

1. Get access to [Integration Tools](https://workshop.welkinhealth.com/integration-tools) (requires a Welkin Workshop login).
2. Create a Client and an associated Credential.
3. Select the scopes that the Client can request.
4. Exchange Client Credential for an Access Token as shown in the example code.
5. Make API requests with the Access Token.

Once you obtain an Access Token, the token can be passed as an Authorization header along with the keyword `Bearer`.

The Access Tokens expire after 1 hour and a new Access Token must be requested.

More information on the JWT protocol can be found at [jwt.io](https://jwt.io/).

**Token endpoint**: `https://api.welkinhealth.com/v1/token`

**Expected JWT fields**

* `iss` = Your client_id as issued by Welkin in Integration Tools
* `aud` = `https://api.welkinhealth.com/v1/token`
* `exp` = ISO timestamp when the token should expire (recommended 1 hours from current time)
* `scope` = A space separated string of scopes

**Expected body fields**

* `assertion` = JWT token
* `grant_type` = `urn:ietf:params:oauth:grant-type:jwt-bearer`

The body may be form-encoded or JSON.

#### Scopes

Scopes limit the types of data and actions that Client can take via the API. Scopes are passed as a space separated list when requesting an Access Token. For example: `calls.read patients.write assessments.read`

Each resources has a `read` and a `write` scope.

If you make a `POST` or `PUT` request with an access token which has only `write` scopes, you will receive a response with only the ID of the created or modified record. The rest of the fields will be redacted since you don't have `read` scope.

<aside>'all' is a valid scope for use in the Welkin Data API. When selected in Integration Tools the Client ID will have the ability to request an Access Token which has access to all the endpoints within Welkin's Data API.</aside>

# Realtime Notifications

Welkin's APIs use a “ping and pull” model. We notify subscribers via Webhook any time there’s an update to your data within our platform. You can pull the updated resources into your system using a GET request following the receipt of a notification.

To enable Notifications, configure the URL to receive notifications in Workshop Integration Tools. The first request that we send to your subscribed URL contains a confirmation URL. You will need to open this URL in your browser or send a GET request to this URL to confirm your webhook subscription. After this step is complete, we will send notifications to your subscribed URL.


## Webhook Contents
> Example:

```json
{
 "notification": {
   "provider_id": "9c64b12d-a70a-4c02-a58c-526e03a8e73b",
   "resource": "patients",
   "resource_id": "9d5b23a4-249f-48d6-87dd-48f8f8c2b6a4",
   "updated_at": "2020-04-27 00:00:00.006785",
   "href": "https://api.welkinhealth.com/v1/patients/9d5b23a4-249f-48d6-87dd-48f8f8c2b6a4",
   "action": "update"
 },
 "send_to": "https://example.com/my-notifications-go-here",
 "jwt": "XXXXXXXXXXXXX"
}
```


field | type | description
- | - | -
send_to | `string` | URL that is subscribed to the notifications
jwt | `string` | JWT token to verify the notification came from Welkin
notification | `json` | Contains the following JSON schema:

field | type | description
- | - | -
provider_id | `string` | Welkin ID specifying the environment (for example, Sandbox or Live)
resource | `string` | The type of resource in Welkin that was modified, e.g. `patients`
resource_id | `string` | The Welkin ID of the resource that was modified
updated_at | `datetime` | Datetime when notification was triggered
href | `string` or `null` | Link to GET the resource, or null if resource was deleted
action | `string` | The action that modified the resource: `create`, `update`, `delete`



## Subscription Confirmation

> Example:

```json
{
  "Type": "SubscriptionConfirmation",
  "Message": "You have chosen to subscribe to the topic arn:aws:sns:us-east-1:XXXXXXXXXXXX:example. To confirm the subscription, visit the SubscribeURL included in this message.",
  "SubscribeURL": "https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-east-1:XXXXXXXXXXXX:example&Token=XXXXXXXXXXXX",
  ...
}
```

Welkin's Realtime Notifications are powered by AWS Simple Notification Service (SNS). The URL that you have subscribed will receive a request containing `"Type"` of `"SubscriptionConfirmation"`, and `"SubscribeURL"` containing a URL that you need to visit or GET to confirm your subscription.


## Legacy Notifications (v1)

Welkin's v1 webhoook notifications are sent every `60` seconds, and include which resources have changed, the time range of the changes, and a url to use in a `GET` request to fetch the changes (see *Find* endpoints for each resource).

Welkin will only send notifications for updates which have happened in the last `24` hours. If you pause webhook delivery for more than 24 hours, or webhook delivery fails for more than 24 hours, you should use *Find* endpoints to query for any resources which may have changed since the last webhook you received.

<aside>The notified services should respond with a 200 response if the content of the notification was successfully <strong>received</strong>. The webhook's HTTP request from Welkin will timeout after <code>30</code> seconds if the notified service does not respond. You should not block responding to the notification on processing the full content of the notification. If Welkin doesn't receive a 200 success response to the webhook before the request times out, Welkin will re-issue that notification at the next notification interval.</aside>

<strong>Webhook body</strong>

Each notification contains all the updates for all the resource types since the last successful notification.

> Example notification request body (JSON)

```json
[ { "resource": "patients",
    "from": "2018-05-14T23:34:05.647496",
    "to": "2018-05-15T23:34:05.647496",
    "href": "https://api.welkinhealth.com/v1/patients?page[to]=2018-05-15T23:34:05.647496&page[from]=2018-05-14T23:34:05.647496"}]
```

<strong>Model notification webhook request body</strong>
field | type | description
- | - | -
_ | `list` | List of data_update_notification objects

<strong>Model data_update_notification</strong>
field | type | description
- | - | -
resource | `string` | Resource endpoint path name
from | `isodatetime` | Datetime of first update
to | `isodatetime` | Datetime of latest update
href | `string` | Link to GET all updates for this notification

<strong>Webhook security</strong>
Welkin supports two authentication flows for the notifications. Both have the same level of security.

<strong>JWT as Bearer Token (Recommended)</strong>

A JWT is included as the Bearer Token on each notification request.

In this model the JWT is not exchanged for an access token but is used directly as the access token for the notification endpoint.

Expected scope for the notify endpoint: `welkin`

The JWT `audience` field will be the same as the `notify_url` where notifications are being sent.

Hash algorithm used by Welkin in creating the JWT: `HS256`

**To be provided to Welkin:**

* `client_id` - identifies Welkin in the customer's system
* `client_secret` - must be transmitted securely to Welkin
* `notify_url` - url at which the customer will receive the webhooks
* list of api resources for which notifications should be sent

<strong>Token exchange</strong>

> Example Welkin side code (for illustration only)

A JWT sent as a Bearer Token to your Token endpoint is exchanged for an access token which is then used when sending the notifications.

In this model we send two requests, first to get an access token and then to send the notification. Having two round trip requests is not needed to secure the notifications endpoint.

Expected scope for the notify endpoint: `welkin`

The JWT `audience` field will be the same as the `token_endpoint_url` where the JWT is exchanged for an access token.

Hash algorithm used by Welkin in creating the JWT: `HS256`

**To be provided to Welkin:**

* `client_id` - identifies Welkin in the customer's system
* `client_secret` - must be transmitted securely to Welkin
* `notify_url` - url at which the customer will receive the webhooks
* `token_endpoint_url` - url from which Welkin will request access tokens
* list of api resources for which notifications should be sent

<strong>Find endpoints</strong>
> Example Request

```shell
curl -XGET /v1/patients?page[from]=2018-06-15T10:30:01&page[to]=2018-09-30T10:29:59&page[size]=10
```

```javascript
const axios = require('axios');

const url = 'https://api.welkinhealth.com/v1/patients?page[from]=2018-06-15T10:30:01&page[to]=2018-09-30T10:29:59&page[size]=10';

function get_by_post() {
  try {
    const res = await axios({
      method: 'get',
      url: url
    });
    return res.data;
  } catch (e) {
    console.log('error could not get data from Welkin');
    return '';
  }
}
```

```python
import requests

url = 'https://api.welkinhealth.com/v1/patients?page[from]=2018-06-15T10:30:01&page[to]=2018-09-30T10:29:59&page[size]=10'

headers = {"Authorization": "Bearer { }".format(<access_token>)}

response = requests.get(url, headers=headers)
```

> Example Response

```json
  {
    "data": [
      {
        "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
        "first_name": "Grace",
        "last_name": "Hopper",
        "updated_at": "2018-09-12T01:27:32.108773+00:00",
        "created_at": "2018-09-12T01:27:32.109872+00:00"
      }
    ],
    "links": {
      "href": {
          "current": "https://api.welkinhealth.com/v1/patients?resource_name=patients&page[size]=50&page[%5B]from]=2018-06-15T10:30:01",
          "next": "https://api.welkinhealth.com/v1/patients?resource_name=patients&page[size]=50&page[%5B]from]=2018-07-13T21:56:43"
      },
      "current": {
          "href": "https://api.welkinhealth.com/v1/patients?resource_name=patients&page[size]=50&page[%5B]from]=2018-06-15T10:30:01",
          "meta": {
              "page[to]": "2018-09-30T10:29:59+00:00",
              "page[size]": 50,
              "page[from]": "2018-06-15T10:30:01"
          }
      },
      "meta": {
        "current": {
          "page[to]": "2018-09-30T10:29:59+00:00",
          "page[size]": 50,
          "page[from]": "2018-06-15T10:30:01"
        },
        "next": {
          "page[to]": "2018-09-30T10:29:59+00:00",
          "page[size]": 50,
          "page[from]": "2018-07-13T21:56:43"
        }
      },
      "next": {
        "href": "https://api.welkinhealth.com/v1/patients?resource_name=patients&page[size]=50&page[%5B]from]=2018-07-13T21:56:43",
        "meta": {
          "page[to]": "2018-09-30T10:29:59+00:00",
          "page[size]": 50,
          "page[from]": "2018-07-13T21:56:43"
        }
      }
    }
  }
```

You can pull large batches of data from Welkin at anytime using the *Find* endpoint for any API resource. These endpoints support filtering by time ranges. If you need data from a specific time range you should use the *Find* endpoints to pull data for the specific time range.

*Find* URLs are sent as part of [Update Notifications](#update-notifications)
<br/><br/><br/>
If a record has been modified multiple times it will only be returned by the *Find* endpoint once. It will be included in the page of results that encompass the records current updated_at time.

For example:

* 10/1/19 10:00 AM, New patient created.
* 10/1/19 11:00 AM, Patient address updated in UI.
* 10/1/19 11:05 AM, Patient address updated again in UI.

*Find* will only return one record for the above patient in the page encompassing 10/1/19 11:05 AM.
<br/><br/><br/>
Data is paginated and the `links` section of the response indicates how to navigate the pagination. Making a GET request on the `next` url will give you next batch of results. There will be a next URL until you reach the end of the results for your Find query.

Make sure to fully follow the pagination links when receiving [Update Notifications](#update-notifications) to ensure you load all the data.

Full `links` fields are elided in each `FIND` example response below for each method.

<strong>Find by POST</strong>
> Example Request

```shell
curl -XPOST /v1/phone_numbers/find -d '{
  "phone_number"="+15555555555",
  "page[from]"=2018-06-15T10:30:01,
  "page[to]"=2018-09-30T10:29:59,
  "page[size]"=10
}'
```

```javascript
const axios = require('axios');

const data = {"phone_number": "+15555555555",
              "page[from]": "2018-06-15T10:30:01",
              "page[to]": "2018-09-30T10:29:59",
              "page[size]": "10"
             };

const url = 'https://api.welkinhealth.com/v1/phone_numbers/find';

function get_by_post() {
  try {
    const res = await axios({
      method: 'post',
      url: url,
      data: data
    });
    return res.data;
  } catch (e) {
    console.log('error could not get data from Welkin');
    return '';
  }
}
```

```python
import requests

url = 'https://api.welkinhealth.com/v1/phone_numbers/find'

headers = {"Authorization": "Bearer { }".format(<access_token>)}

data = {"phone_number": "+15555555555",
        "page[from]": "2018-06-15T10:30:01",
        "page[to]": "2018-09-30T10:29:59",
        "page[size]": "10"
       }

response = requests.post(url,
                         headers=headers,
                         data=data)
```

Security best practices dictate keeping PII and PHI out of URLs (in the path or in query parameters) because information in URLs can be inadvertently exposed via client, network, proxy and server logs and other mechanisms.

Accordingly, Welkin supports sending sensitive API parameters as a part of a POST body for performing *find* actions. This is accomplished via the *Find By Post* methods of this API.

The *Find By Post* request URL is `/v1/<resource_type>/find`

Parameters for *Find By Post* requests are sent in the request body.

# API Reference


## Alerts


The Alerts API will allow you to create a new alert in the Inbox that are tied to events that occur in your
applications outside of Welkin. For example, if you use a messaging application outside of Welkin that you use to
communicate with your patients, you can configure an Alert notification that will display in your Welkin Inbox to
let you know that you have messages from a patient in your messaging application.













### Model

> Example Response

```json
{
  "active_time": "2020-10-15T13:29:31.536121+00:00",
  "alert_type": "app_message",
  "completed": false,
  "dismissed": false,
  "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
  "finished_time": null,
  "worker_id": null,
  "dismissed_by_worker_id": null,
  "config": {
    "count": 2
  },
  "id": "96d4fad8-cbd3-4710-a429-c09526c8f114"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __alerts__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) for whom alert needs to be created
worker_id <br /><code><a href='#types'>optional</a> <a href='#types'>guid</a></code> | ID of the [worker](#workers) creating the alert
alert_type <br /><code><a href='#types'>string</a></code> | The type of the alert that needs to be created. supported types ['app_message']
config <br /><code><a href='#types'>optional</a> <a href='#types'>json</a></code> | A json object containing 'count' field with value, this is a optional field, default count will be 1
active_time <br /><code><a href='#types'>optional</a> <a href='#types'>isodatetime</a></code> | Date and time when the alert was active
finished_time <br /><code><a href='#types'>optional</a> <a href='#types'>isodatetime</a></code> | Date and time when the alert was finished
completed <br /><code><a href='#types'>boolean</a></code> | Denotes whether the alert was completed
dismissed <br /><code><a href='#types'>boolean</a></code> | Denotes whether the alert was dismissed
dismissed_by_worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who dismissed the alert.




### Get
Retrieves a single __alert__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/alerts/96d4fad8-cbd3-4710-a429-c09526c8f114 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/alerts/96d4fad8-cbd3-4710-a429-c09526c8f114'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/alerts/96d4fad8-cbd3-4710-a429-c09526c8f114';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/alerts/:id`

#### Required Scope
`alerts.read` or `all`

> Example Response

```json
{
  "data": {
    "active_time": "2020-10-15T13:29:31.536121+00:00",
    "alert_type": "app_message",
    "completed": false,
    "dismissed": false,
    "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
    "finished_time": null,
    "worker_id": null,
    "dismissed_by_worker_id": null,
    "config": {
      "count": 2
    },
    "id": "96d4fad8-cbd3-4710-a429-c09526c8f114"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __alerts__ record.





### Create
Creates a new __alert__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/alerts -d '{
  "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
  "alert_type": "app_message",
  "config": {
    "count": 2
  },
  "active_time": "2020-10-15T13:29:31.536121+00:00"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
  "alert_type": "app_message",
  "config": {
    "count": 2
  },
  "active_time": "2020-10-15T13:29:31.536121+00:00"
}
url = 'https://api.welkinhealth.com/v1/alerts'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/alerts';
const data = {
  "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
  "alert_type": "app_message",
  "config": {
    "count": 2
  },
  "active_time": "2020-10-15T13:29:31.536121+00:00"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/alerts -d { }`

#### Required Scope
`alerts.write` or `all`

> Example Response

```json
{
  "data": {
    "active_time": "2020-10-15T13:29:31.536121+00:00",
    "alert_type": "app_message",
    "completed": false,
    "dismissed": false,
    "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
    "finished_time": null,
    "worker_id": null,
    "dismissed_by_worker_id": null,
    "config": {
      "count": 2
    },
    "id": "96d4fad8-cbd3-4710-a429-c09526c8f114"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) for whom alert needs to be created
worker_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [worker](#workers) creating the alert
alert_type <br /><code><a href='#types' class='required'>string</a></code> | The type of the alert that needs to be created. supported types ['app_message']
config <br /><code><a href='#types' class='optional'>json</a></code> | A json object containing 'count' field with value, this is a optional field, default count will be 1
active_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Date and time when the alert was active





### Update
Updates an existing __alert__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/alerts/96d4fad8-cbd3-4710-a429-c09526c8f114 -d '{
  "config": {
    "count": 2
  },
  "active_time": "2020-10-15T13:29:31.536121+00:00",
  "completed": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "config": {
    "count": 2
  },
  "active_time": "2020-10-15T13:29:31.536121+00:00",
  "completed": false
}
url = 'https://api.welkinhealth.com/v1/alerts/96d4fad8-cbd3-4710-a429-c09526c8f114'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/alerts/96d4fad8-cbd3-4710-a429-c09526c8f114';
const data = {
  "config": {
    "count": 2
  },
  "active_time": "2020-10-15T13:29:31.536121+00:00",
  "completed": false
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/alerts/:id -d { }`

#### Required Scope
`alerts.write` or `all`

> Example Response

```json
{
  "data": {
    "active_time": "2020-10-15T13:29:31.536121+00:00",
    "alert_type": "app_message",
    "completed": false,
    "dismissed": false,
    "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
    "finished_time": null,
    "worker_id": null,
    "dismissed_by_worker_id": null,
    "config": {
      "count": 2
    },
    "id": "96d4fad8-cbd3-4710-a429-c09526c8f114"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __alerts__ record.
config <br /><code><a href='#types' class='optional'>json</a></code> | A json object containing 'count' field with value, this is a optional field, default count will be 1
active_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Date and time when the alert was active
finished_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Date and time when the alert was finished
completed <br /><code><a href='#types' class='required'>boolean</a></code> | Denotes whether the alert was completed






### Find
Retrieves __alerts__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __alerts__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/alerts -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/alerts'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/alerts';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/alerts`

#### Required Scope
`alerts.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "active_time": "2020-10-15T13:29:31.536121+00:00",
      "alert_type": "app_message",
      "completed": false,
      "dismissed": false,
      "patient_id": "3c2f6fc5-a666-46e2-aefd-880dedf04de1",
      "finished_time": null,
      "worker_id": null,
      "dismissed_by_worker_id": null,
      "config": {
        "count": 2
      },
      "id": "96d4fad8-cbd3-4710-a429-c09526c8f114"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
alert_type <br /><code><a href='#types' class='required'>string</a></code> | The type of the alert that needs to be created. supported types ['app_message']
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## App Messages


App Messages can be viewed or created from the [conversation](#conversations) view of the [Patient](#patients)
Profile. App Messages are text based communications that are sent to patients via a web or mobile app and do not
include emails or sms messages.

<aside>Creating an App Message does NOT send that message to the <a href="#patients">patient</a>. Creating the message resource
via this api only records that the message was sent to the <a href="#patients">patient</a>. Messages are sent via
3rd party systems, not Welkin.</aside>











### Model

> Example Response

```json
{
  "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "automatically_sent": false,
  "sent_at": "2018-09-12T01:27:32.045046+00:00",
  "updated_at": "2018-09-12T01:27:32.045196+00:00",
  "created_at": "2018-09-12T01:27:32.045336+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __app messages__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#types'>guid</a></code> | ID of the [conversation](#conversations) that this messages is contained in
direction <br /><code><a href='#types'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#types'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#types'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
sent_at <br /><code><a href='#types'>isodatetime</a></code> | Date and time when the message was sent
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __app message__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/app_messages/:id`

#### Required Scope
`app_messages.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
    "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
    "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
    "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
    "direction": "inbound",
    "contents": "Hi Developer, Welcome to Welkin Health.",
    "automatically_sent": false,
    "sent_at": "2018-09-12T01:27:32.045046+00:00",
    "updated_at": "2018-09-12T01:27:32.045196+00:00",
    "created_at": "2018-09-12T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __app messages__ record.





### Create


Creates a new __app message__.

New messages can be created in a [Patient](#patients) Profile. Messages created in Welkin are recorded in the
[conversation](#conversations) view.

<aside>Creating a app message record does NOT cause that message to be sent to the <a href="#patients">patient</a>.</aside>




#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/app_messages -d '{
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}
url = 'https://api.welkinhealth.com/v1/app_messages'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/app_messages';
const data = {
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/app_messages -d { }`

#### Required Scope
`app_messages.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
    "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
    "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
    "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
    "direction": "inbound",
    "contents": "Hi Developer, Welcome to Welkin Health.",
    "automatically_sent": false,
    "sent_at": "2018-09-12T01:27:32.045046+00:00",
    "updated_at": "2018-09-12T01:27:32.045196+00:00",
    "created_at": "2018-09-12T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
worker_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [conversation](#conversations) that this messages is contained in
direction <br /><code><a href='#types' class='required'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#types' class='required'>string</a></code> | Text of the message
sent_at <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Date and time when the message was sent





### Update


Update the time at which the message was sent. This is to be used when an outside system sends the app messages on
behalf of Welkin to the patient.




#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26 -d '{
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}
url = 'https://api.welkinhealth.com/v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26';
const data = {
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/app_messages/:id -d { }`

#### Required Scope
`app_messages.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
    "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
    "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
    "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
    "direction": "inbound",
    "contents": "Hi Developer, Welcome to Welkin Health.",
    "automatically_sent": false,
    "sent_at": "2018-09-12T01:27:32.045046+00:00",
    "updated_at": "2018-09-12T01:27:32.045196+00:00",
    "created_at": "2018-09-12T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __app messages__ record.
sent_at <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Date and time when the message was sent






### Find
Retrieves __app messages__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __app messages__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/app_messages -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/app_messages'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/app_messages';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/app_messages`

#### Required Scope
`app_messages.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
      "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
      "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
      "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
      "direction": "inbound",
      "contents": "Hi Developer, Welcome to Welkin Health.",
      "automatically_sent": false,
      "sent_at": "2018-09-12T01:27:32.045046+00:00",
      "updated_at": "2018-09-12T01:27:32.045196+00:00",
      "created_at": "2018-09-12T01:27:32.045336+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Assessment Responses


Assessments can be completed in external systems, and loaded into Welkin for display in the Welkin Portal.

The data format of assessment responses created via this API must match existing assessment templates which have been
created in [Workshop](https://workshop.welkinhealth.com).

Similarly, Assessments completed in Welkin can be retrieved via this API.












### Model

> Example Response

```json
{
  "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "spec": {
    "title": "Survey",
    "baseField": {
      "fields": [
        {
          "fields": [
            {
              "options": [
                "SILVER",
                "GOLD",
                "BRONZE"
              ],
              "fieldId": "plan_type",
              "fieldType": "select",
              "label": "What is your plan type?"
            },
            {
              "fieldId": "years_active",
              "fieldType": "number",
              "label": "How long have you had this disease?"
            },
            {
              "allowDecimal": true,
              "fieldId": "pain_scale",
              "fieldType": "number",
              "label": "How much pain on a scale of 1 to 10 do you experience?"
            },
            {
              "fieldId": "last_hcp_visit",
              "fieldType": "datepicker",
              "label": "When was the last time you visited the hospital?"
            },
            {
              "fieldId": "active",
              "fieldType": "boolean",
              "label": "Do you have this disease?"
            },
            {
              "fieldId": "insurance_provider",
              "fieldType": "textarea",
              "label": "What is your insurance provider?"
            }
          ],
          "title": "Intake",
          "fieldType": "section",
          "fieldId": "mySection72"
        }
      ],
      "fieldId": "_meta.base_fields",
      "fieldType": "base"
    },
    "id": "789a1bb3-2434-4a8f-8507-38b25438d9f2",
    "defaults": {
      "wrapper": "assessmentQuestion"
    },
    "apiResource": "formation_responses"
  },
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4
  },
  "updated_at": "2018-09-12T01:27:32.024836+00:00",
  "created_at": "2018-09-12T01:27:32.025031+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __assessment responses__ record.
spec_id <br /><code><a href='#types'>string</a></code> | (Deprecated) ID of the assessment which this response corresponds to. This is only used for assessments created in code by Welkin engineers.
spec_name <br /><code><a href='#types'>string</a></code> | The ref_name for the assessment as it appears in [Workshop](https://workshop.welkinhealth.com).
spec_version <br /><code><a href='#types'>guid</a></code> | Optionally, the version string of assessment spec. If not specified, the most recent spec version authored in [Workshop](https://workshop.welkinhealth.com) will be used.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) for whom this assessment was filled out.
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who created or most recently edited this assessment response. This is only set if the assessment was completed by a [worker](#workers) and not by the [patient](#patients).
model <br /><code><a href='#types'>json</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
spec <br /><code><a href='#types'>json</a></code> | Schema of assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __assessment response__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/assessment_responses/20c04e56-69f0-4d13-b5c1-a1763abd1218 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/assessment_responses/20c04e56-69f0-4d13-b5c1-a1763abd1218'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/assessment_responses/20c04e56-69f0-4d13-b5c1-a1763abd1218';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/assessment_responses/:id`

#### Required Scope
`assessment_responses.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
    "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
    "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
    "spec": {
      "title": "Survey",
      "baseField": {
        "fields": [
          {
            "fields": [
              {
                "options": [
                  "SILVER",
                  "GOLD",
                  "BRONZE"
                ],
                "fieldId": "plan_type",
                "fieldType": "select",
                "label": "What is your plan type?"
              },
              {
                "fieldId": "years_active",
                "fieldType": "number",
                "label": "How long have you had this disease?"
              },
              {
                "allowDecimal": true,
                "fieldId": "pain_scale",
                "fieldType": "number",
                "label": "How much pain on a scale of 1 to 10 do you experience?"
              },
              {
                "fieldId": "last_hcp_visit",
                "fieldType": "datepicker",
                "label": "When was the last time you visited the hospital?"
              },
              {
                "fieldId": "active",
                "fieldType": "boolean",
                "label": "Do you have this disease?"
              },
              {
                "fieldId": "insurance_provider",
                "fieldType": "textarea",
                "label": "What is your insurance provider?"
              }
            ],
            "title": "Intake",
            "fieldType": "section",
            "fieldId": "mySection72"
          }
        ],
        "fieldId": "_meta.base_fields",
        "fieldType": "base"
      },
      "id": "789a1bb3-2434-4a8f-8507-38b25438d9f2",
      "defaults": {
        "wrapper": "assessmentQuestion"
      },
      "apiResource": "formation_responses"
    },
    "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
    "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
    "model": {
      "insurance_provider": "Acme Insurance",
      "plan_type": "SILVER",
      "active": true,
      "years_active": 2,
      "last_hcp_visit": "2018-07-14",
      "pain_scale": 0.4
    },
    "updated_at": "2018-09-12T01:27:32.024836+00:00",
    "created_at": "2018-09-12T01:27:32.025031+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __assessment responses__ record.
include_schema <br /><code><a href='#types' class='optional'>boolean</a></code> | Set 'true', to include assessment schema in the response





### Create
Creates a new __assessment response__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/assessment_responses -d '{
  "spec_id": "some_string",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4
  },
  "title": "some_string"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "spec_id": "some_string",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4
  },
  "title": "some_string"
}
url = 'https://api.welkinhealth.com/v1/assessment_responses'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/assessment_responses';
const data = {
  "spec_id": "some_string",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4
  },
  "title": "some_string"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/assessment_responses -d { }`

#### Required Scope
`assessment_responses.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
    "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
    "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
    "spec": {
      "title": "Survey",
      "baseField": {
        "fields": [
          {
            "fields": [
              {
                "options": [
                  "SILVER",
                  "GOLD",
                  "BRONZE"
                ],
                "fieldId": "plan_type",
                "fieldType": "select",
                "label": "What is your plan type?"
              },
              {
                "fieldId": "years_active",
                "fieldType": "number",
                "label": "How long have you had this disease?"
              },
              {
                "allowDecimal": true,
                "fieldId": "pain_scale",
                "fieldType": "number",
                "label": "How much pain on a scale of 1 to 10 do you experience?"
              },
              {
                "fieldId": "last_hcp_visit",
                "fieldType": "datepicker",
                "label": "When was the last time you visited the hospital?"
              },
              {
                "fieldId": "active",
                "fieldType": "boolean",
                "label": "Do you have this disease?"
              },
              {
                "fieldId": "insurance_provider",
                "fieldType": "textarea",
                "label": "What is your insurance provider?"
              }
            ],
            "title": "Intake",
            "fieldType": "section",
            "fieldId": "mySection72"
          }
        ],
        "fieldId": "_meta.base_fields",
        "fieldType": "base"
      },
      "id": "789a1bb3-2434-4a8f-8507-38b25438d9f2",
      "defaults": {
        "wrapper": "assessmentQuestion"
      },
      "apiResource": "formation_responses"
    },
    "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
    "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
    "model": {
      "insurance_provider": "Acme Insurance",
      "plan_type": "SILVER",
      "active": true,
      "years_active": 2,
      "last_hcp_visit": "2018-07-14",
      "pain_scale": 0.4
    },
    "updated_at": "2018-09-12T01:27:32.024836+00:00",
    "created_at": "2018-09-12T01:27:32.025031+00:00"
  }
}
```

#### Params


param | description
- | -
spec_id <br /><code><a href='#types' class='required'>string</a></code> | (Deprecated) ID of the assessment which this response corresponds to. This is only used for assessments created in code by Welkin engineers.
spec_name <br /><code><a href='#types' class='required'>string</a></code> | Name of the assessment as listed in [Workshop](https://workshop.welkinhealth.com)
spec_version <br /><code><a href='#types' class='optional'>guid</a></code> | Version ID of the assessment as listed in [Workshop](https://workshop.welkinhealth.com)
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) for whom this assessment was filled out.
worker_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [worker](#workers) who created or most recently edited this assessment response. This is only set if the assessment was completed by a [worker](#workers) and not by the [patient](#patients).
model <br /><code><a href='#types' class='required'>json</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
title <br /><code><a href='#types' class='optional'>string</a></code> | The title of the assessment to be shown on the [patient's](#patients) timeline.







### Find
Retrieves __assessment responses__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __assessment responses__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/assessment_responses -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/assessment_responses'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/assessment_responses';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/assessment_responses`

#### Required Scope
`assessment_responses.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
      "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
      "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
      "spec": {
        "title": "Survey",
        "baseField": {
          "fields": [
            {
              "fields": [
                {
                  "options": [
                    "SILVER",
                    "GOLD",
                    "BRONZE"
                  ],
                  "fieldId": "plan_type",
                  "fieldType": "select",
                  "label": "What is your plan type?"
                },
                {
                  "fieldId": "years_active",
                  "fieldType": "number",
                  "label": "How long have you had this disease?"
                },
                {
                  "allowDecimal": true,
                  "fieldId": "pain_scale",
                  "fieldType": "number",
                  "label": "How much pain on a scale of 1 to 10 do you experience?"
                },
                {
                  "fieldId": "last_hcp_visit",
                  "fieldType": "datepicker",
                  "label": "When was the last time you visited the hospital?"
                },
                {
                  "fieldId": "active",
                  "fieldType": "boolean",
                  "label": "Do you have this disease?"
                },
                {
                  "fieldId": "insurance_provider",
                  "fieldType": "textarea",
                  "label": "What is your insurance provider?"
                }
              ],
              "title": "Intake",
              "fieldType": "section",
              "fieldId": "mySection72"
            }
          ],
          "fieldId": "_meta.base_fields",
          "fieldType": "base"
        },
        "id": "789a1bb3-2434-4a8f-8507-38b25438d9f2",
        "defaults": {
          "wrapper": "assessmentQuestion"
        },
        "apiResource": "formation_responses"
      },
      "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
      "worker_id": "22dff7c2-eacb-44c0-b562-be6163c31b0f",
      "model": {
        "insurance_provider": "Acme Insurance",
        "plan_type": "SILVER",
        "active": true,
        "years_active": 2,
        "last_hcp_visit": "2018-07-14",
        "pain_scale": 0.4
      },
      "updated_at": "2018-09-12T01:27:32.024836+00:00",
      "created_at": "2018-09-12T01:27:32.025031+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
include_schema <br /><code><a href='#types' class='optional'>boolean</a></code> | Set 'true', to include assessment schema in the response
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Audit Logs


:param event_type
:param actor_type
:param start_time
:param end_time



### Model

> Example Response

```json

```


param | description
- | -
id <br /><code><a href='#types'>json</a></code> | The primary identifier of the __audit logs__ record.
env_id <br /><code></code> | 
actor_id <br /><code></code> | 
actor_type <br /><code><a href='#types'>enum</a></code> | 
event_time <br /><code></code> | 
event_type <br /><code><a href='#types'>enum</a></code> | 
event <br /><code></code> | 




### Get
Retrieves a single __audit log__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/audit_logs/ -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/audit_logs/'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/audit_logs/';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/audit_logs/:id`

#### Required Scope
`audit_logs.read` or `all`

> Example Response

```json
{
  "data": 
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __audit logs__ record.








### Find
Retrieves __audit logs__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __audit logs__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/audit_logs -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/audit_logs'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/audit_logs';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/audit_logs`

#### Required Scope
`audit_logs.read` or `all`

> Example Response

```json
{
  "data": [
    
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='optional'>json</a></code> | The primary identifier of the __audit logs__ record.
actor_type <br /><code><a href='#types' class='optional'>enum</a></code> | 
event_type <br /><code><a href='#types' class='required'>enum</a></code> | 
email <br /><code><a href='#types' class='optional'>json</a></code> | 
end_time <br /><code><a href='#types' class='optional'>date</a></code> | 
operation <br /><code><a href='#types' class='optional'>json</a></code> | 
patient_id <br /><code><a href='#types' class='optional'>json</a></code> | 
start_time <br /><code><a href='#types' class='optional'>date</a></code> | 
type_name <br /><code><a href='#types' class='optional'>json</a></code> | 
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Availability


Availability combines a worker's working hours, [unavailable times](#unavailable-times), and [calendar
events](#calendar-events) to determine the periods when a worker is available.










### Model

> Example Response

```json
{
  "data": {
    "calendar_id": "e9419c29-2980-4488-8559-2e95f7bd78b7",
    "worker_id": "c6fb1c46-e6a0-4349-a91d-64a7c2e2d2c9",
    "available_times": [
      {
        "start": "2020-05-27T17:00:00+00:00",
        "end": "2020-05-27T19:00:00+00:00"
      },
      {
        "start": "2020-05-27T20:25:00+00:00",
        "end": "2020-05-28T00:00:00+00:00"
      },
      {
        "start": "2020-05-28T00:10:00+00:00",
        "end": "2020-05-28T01:00:00+00:00"
      }
    ]
  }
}
```


param | description
- | -
calendar_id <br /><code><a href='#types'>guid</a></code> | The ID of the [calendar](#calendars).
worker_id <br /><code><a href='#types'>guid</a></code> | The ID of the [worker](#workers).
available_times <br /><code><a href='#types'>list</a></code> | A list of intervals where the worker is available. Each interval is an object containing `start` and `end` keys.








### Find
Retrieves __availability__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __availability__ resource.
#### Invocation

> Example Request

```shell
curl -XGET 'https://api.welkinhealth.com/v1/availability?worker_id=c6fb1c46-e6a0-4349-a91d-64a7c2e2d2c9&start=2020-05-27T07:00:00+00:00&end=2020-05-28T07:00:00+00' -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/availability?worker_id=c6fb1c46-e6a0-4349-a91d-64a7c2e2d2c9&start=2020-05-27T07:00:00+00:00&end=2020-05-28T07:00:00+00'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/availability?worker_id=c6fb1c46-e6a0-4349-a91d-64a7c2e2d2c9&start=2020-05-27T07:00:00+00:00&end=2020-05-28T07:00:00+00';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/availability`

#### Required Scope
`availability.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "data": {
        "calendar_id": "e9419c29-2980-4488-8559-2e95f7bd78b7",
        "worker_id": "c6fb1c46-e6a0-4349-a91d-64a7c2e2d2c9",
        "available_times": [
          {
            "start": "2020-05-27T17:00:00+00:00",
            "end": "2020-05-27T19:00:00+00:00"
          },
          {
            "start": "2020-05-27T20:25:00+00:00",
            "end": "2020-05-28T00:00:00+00:00"
          },
          {
            "start": "2020-05-28T00:10:00+00:00",
            "end": "2020-05-28T01:00:00+00:00"
          }
        ]
      }
    }
  ]
}
```

#### Params


param | description
- | -
calendar_id <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of the [calendar](#calendars) for which to find availability. Either this or `worker_id` must be provided.
worker_id <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of the [worker](#workers) for which to find availability. Either this or `calendar_id` must be provided.
end <br /><code><a href='#types' class='required'>isodatetime</a></code> | Beginning of the time range to examine for worker availability.
start <br /><code><a href='#types' class='required'>isodatetime</a></code> | Beginning of the time range to examine for worker availability.







## Calendar Events


Calendar events are appointments on worker [calendars](#calendars). They're in reference to a [patient](#patients). A
calendar event can be scheduled for a date and time or simply for a date.

<aside>All calendar events have an associated appointment prompt which will trigger at the time of the event. Valid
appointment prompts are specific to your implementation of Welkin. The range of appointment prompts can be found in
<a href="https://workshop.welkinhealth.com">Workshop</a>.</aside>

<aside>If <code>is_all_day</code> is set to <code>true</code> then you must set <code>day</code>. If <code>is_all_day</code> is set to <code>false</code> then you must use
<code>start_time</code> and <code>end_time</code>.</aside>
















### Model

> Example Response

```json
{
  "id": "f2baaf15-94d2-415d-b3e6-7409b643d297",
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
  "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
  "is_all_day": false,
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "outcome": "completed",
  "modality": "call",
  "appointment_type": "intake_call",
  "updated_at": "2018-09-10T18:56:19.359240+00:00",
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __calendar events__ record.
calendar_id <br /><code><a href='#types'>guid</a></code> | ID of the [calendar](#calendars) on which this event resides
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) :type user_id: guid
user_id <br /><code><a href='#types'>guid</a></code> | (Deprecated) ID of the [patient](#patients)
is_all_day <br /><code></code> | `true` if not scheduled for a specific time of day. `false` otherwise :type is_all_day: boolean
start_time <br /><code><a href='#types'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day :type start_time: optional isodatetime
end_time <br /><code><a href='#types'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day :type end_time: optional isodatetime
day <br /><code><a href='#types'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
outcome <br /><code><a href='#types'>enum</a></code> | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no_show`)
modality <br /><code><a href='#types'>enum</a></code> | Mode via which the event will take place (`call` or `visit`)
appointment_type <br /><code><a href='#types'>string</a></code> | Appointment prompt to be used for this event (see note for details)
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __calendar event__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/calendar_events/:id`

#### Required Scope
`calendar_events.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "f2baaf15-94d2-415d-b3e6-7409b643d297",
    "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
    "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
    "is_all_day": false,
    "start_time": "2018-09-10T18:56:19.357228+00:00",
    "end_time": "2018-09-10T18:56:19.357540+00:00",
    "outcome": "completed",
    "modality": "call",
    "appointment_type": "intake_call",
    "updated_at": "2018-09-10T18:56:19.359240+00:00",
    "created_at": "2018-09-10T18:56:19.359873+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __calendar events__ record.





### Create
Creates a new __calendar event__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/calendar_events -d '{
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
  "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "modality": "call",
  "appointment_type": "intake_call"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
  "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "modality": "call",
  "appointment_type": "intake_call"
}
url = 'https://api.welkinhealth.com/v1/calendar_events'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/calendar_events';
const data = {
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
  "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "modality": "call",
  "appointment_type": "intake_call"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/calendar_events -d { }`

#### Required Scope
`calendar_events.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "f2baaf15-94d2-415d-b3e6-7409b643d297",
    "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
    "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
    "is_all_day": false,
    "start_time": "2018-09-10T18:56:19.357228+00:00",
    "end_time": "2018-09-10T18:56:19.357540+00:00",
    "outcome": "completed",
    "modality": "call",
    "appointment_type": "intake_call",
    "updated_at": "2018-09-10T18:56:19.359240+00:00",
    "created_at": "2018-09-10T18:56:19.359873+00:00"
  }
}
```

#### Params


param | description
- | -
calendar_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [calendar](#calendars) on which this event resides
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) :type user_id: guid
user_id <br /><code><a href='#types' class='required'>guid</a></code> | (Deprecated) ID of the [patient](#patients)
start_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day :type start_time: optional isodatetime
end_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day :type end_time: optional isodatetime
day <br /><code><a href='#types' class='optional'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
modality <br /><code><a href='#types' class='required'>enum</a></code> | Mode via which the event will take place (`call` or `visit`)
appointment_type <br /><code><a href='#types' class='required'>string</a></code> | Appointment prompt to be used for this event (see note for details)
ignore_unavailable_times <br /><code><a href='#types' class='optional'>boolean</a></code> | If this is set, Welkin will not check whether the calendar event is during an [unavailable time](#unavailable-times) for the worker.
ignore_working_hours <br /><code><a href='#types' class='optional'>boolean</a></code> | If this is set, Welkin will not check whether the calendar event is within the worker's weekly available days and hours.





### Update
Updates an existing __calendar event__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297 -d '{
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "outcome": "completed",
  "appointment_type": "intake_call"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "outcome": "completed",
  "appointment_type": "intake_call"
}
url = 'https://api.welkinhealth.com/v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297';
const data = {
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "outcome": "completed",
  "appointment_type": "intake_call"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/calendar_events/:id -d { }`

#### Required Scope
`calendar_events.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "f2baaf15-94d2-415d-b3e6-7409b643d297",
    "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
    "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
    "is_all_day": false,
    "start_time": "2018-09-10T18:56:19.357228+00:00",
    "end_time": "2018-09-10T18:56:19.357540+00:00",
    "outcome": "completed",
    "modality": "call",
    "appointment_type": "intake_call",
    "updated_at": "2018-09-10T18:56:19.359240+00:00",
    "created_at": "2018-09-10T18:56:19.359873+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __calendar events__ record.
start_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day :type start_time: optional isodatetime
end_time <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day :type end_time: optional isodatetime
day <br /><code><a href='#types' class='optional'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
outcome <br /><code><a href='#types' class='optional'>enum</a></code> | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no_show`)
appointment_type <br /><code><a href='#types' class='optional'>string</a></code> | Appointment prompt to be used for this event (see note for details)
ignore_unavailable_times <br /><code><a href='#types' class='optional'>boolean</a></code> | If this is set, Welkin will not check whether the calendar event is during an [unavailable time](#unavailable-times) for the worker.
ignore_working_hours <br /><code><a href='#types' class='optional'>boolean</a></code> | If this is set, Welkin will not check whether the calendar event is within the worker's weekly available days and hours.






### Find
Retrieves __calendar events__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __calendar events__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/calendar_events -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/calendar_events'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/calendar_events';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/calendar_events`

#### Required Scope
`calendar_events.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "f2baaf15-94d2-415d-b3e6-7409b643d297",
      "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
      "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
      "is_all_day": false,
      "start_time": "2018-09-10T18:56:19.357228+00:00",
      "end_time": "2018-09-10T18:56:19.357540+00:00",
      "outcome": "completed",
      "modality": "call",
      "appointment_type": "intake_call",
      "updated_at": "2018-09-10T18:56:19.359240+00:00",
      "created_at": "2018-09-10T18:56:19.359873+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
calendar_id <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of the calendar whose events do you want to find. If the param is not set, then will get all calendar events
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Calendars


Calendars link [Calendar Events](#calendar-events), coach [Unavailable Times](#unavailable-times), and
coach [Working Hours](#working-hours) to [Workers](#workers).

<aside>Each worker has one, and only one, calendar.</aside>






### Model

> Example Response

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5",
  "updated_at": "2018-09-12T01:27:32.028059+00:00",
  "created_at": "2018-09-12T01:27:32.028187+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __calendars__ record.
worker_id <br /><code><a href='#types'>guid</a></code> | The ID of the worker who's calendar this is
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on the associated calendar)
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __calendar__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/calendars/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/calendars/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/calendars/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/calendars/:id`

#### Required Scope
`calendars.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
    "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5",
    "updated_at": "2018-09-12T01:27:32.028059+00:00",
    "created_at": "2018-09-12T01:27:32.028187+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __calendars__ record.








### Find
Retrieves __calendars__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __calendars__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/calendars -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/calendars'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/calendars';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/calendars`

#### Required Scope
`calendars.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
      "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5",
      "updated_at": "2018-09-12T01:27:32.028059+00:00",
      "created_at": "2018-09-12T01:27:32.028187+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
email <br /><code><a href='#types' class='optional'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
worker <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of the worker whose calendar do you want to find
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Calls


Calls record that a call was completed between a [worker](#workers) and a [patient](#patients).
These calls are attached to a [calendar event](#calendar_events) if a call was initiated from a calendar event.

<aside>If you want to access call audio you must use an Access Token with the Scope <code>all</code>.</aside>





### Model

> Example Response

```json
{
  "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
  "call_type": "outbound",
  "from_number": "+14155555555",
  "to_number": "+15085555555",
  "start_time": "2019-03-05T21:03:23.102699+00:00",
  "duration": 200,
  "calendar_event_id": "cd1483be-e029-4e23-ac8a-b4ebcededb04",
  "worker_id": "32f0e2b4-7643-4926-a128-9666c81446cb",
  "patient_id": "ee2a33d3-1793-4967-9836-85f68afea893",
  "audio_url": "",
  "updated_at": "2018-09-12T01:27:32.035940+00:00",
  "created_at": "2018-09-12T01:27:32.036062+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __calls__ record.
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
call_type <br /><code><a href='#types'>enum</a></code> | The direction of the call. `inbound` or `outbound`
from_number <br /><code><a href='#types'>e164_phone</a></code> | The phone number in E.164 format from which the call orginated.
to_number <br /><code><a href='#types'>e164_phone</a></code> | The phone number in E.164 format to which the call was placed.
start_time <br /><code><a href='#types'>isodatetime</a></code> | The datetime when the call was initiated.
duration <br /><code><a href='#types'>integer</a></code> | The amount of time that the call lasted.
calendar_event_id <br /><code><a href='#types'>guid</a></code> | The ID of the [calendar event](#calendar_events) from which this call was initiated if the call was started as part of a scheduled calendar event.
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who participated in the call.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) who participated in the call.
audio_url <br /><code><a href='#types'>string</a></code> | URL at which you can listen to the recorded audio of the call if a recording exists.




### Get
Retrieves a single __call__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/calls/0546cc93-7695-49c1-ab5e-3daf3fde12bd -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/calls/0546cc93-7695-49c1-ab5e-3daf3fde12bd'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/calls/0546cc93-7695-49c1-ab5e-3daf3fde12bd';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/calls/:id`

#### Required Scope
`calls.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
    "call_type": "outbound",
    "from_number": "+14155555555",
    "to_number": "+15085555555",
    "start_time": "2019-03-05T21:03:23.102699+00:00",
    "duration": 200,
    "calendar_event_id": "cd1483be-e029-4e23-ac8a-b4ebcededb04",
    "worker_id": "32f0e2b4-7643-4926-a128-9666c81446cb",
    "patient_id": "ee2a33d3-1793-4967-9836-85f68afea893",
    "audio_url": "",
    "updated_at": "2018-09-12T01:27:32.035940+00:00",
    "created_at": "2018-09-12T01:27:32.036062+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __calls__ record.








### Find
Retrieves __calls__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __calls__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/calls -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/calls'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/calls';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/calls`

#### Required Scope
`calls.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
      "call_type": "outbound",
      "from_number": "+14155555555",
      "to_number": "+15085555555",
      "start_time": "2019-03-05T21:03:23.102699+00:00",
      "duration": 200,
      "calendar_event_id": "cd1483be-e029-4e23-ac8a-b4ebcededb04",
      "worker_id": "32f0e2b4-7643-4926-a128-9666c81446cb",
      "patient_id": "ee2a33d3-1793-4967-9836-85f68afea893",
      "audio_url": "",
      "updated_at": "2018-09-12T01:27:32.035940+00:00",
      "created_at": "2018-09-12T01:27:32.036062+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
calendar_event_id <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of the [calendar event](#calendar_events) from which this call was initiated if the call was started as part of a scheduled calendar event.
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) who participated in the call.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Care Flows


Care Flows lay out a set of tasks, or multiple sets of tasks, to help the patient achieve 1 or more Goals.

<aside>Care Flows can be created in the Coach Portal using a Care Flow template (designed in
<a href="https://workshop.welkinhealth.com">Workshop</a>), or they may be automatically created as the end result of a Process
(also designed in <a href="https://workshop.welkinhealth.com">Workshop</a>). When using a template to make a new Care Flow,
changes made to the Care Flow will not be reflected in the template it originated from.</aside>







### Model
field | description
- | -
patient_id <br /><code><a href='#types'>guid</a></code> | The ID of the [patient](#patients)
id <br /><code><a href='#types'>guid</a></code> | Description of the overall Care Flow
care_flow <br /><code><a href='#types'>json</a></code> | A [care_flow object](#care-flow-model-care_flow)
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created

### Model care_flow
field | description
- | -
title <br /><code><a href='#types'>string</a></code> | Title of the overall Care Flow
description <br /><code><a href='#types'>string</a></code> | Description of the overall Care Flow
goals <br /><code><a href='#types'>string</a></code> | List of [goal objects](#care-flow-model-goal)

### Model goal
field | description
- | -
title <br /><code><a href='#types'>string</a></code> | Title of the Care Flow goal
tasks <br /><code><a href='#types'>list</a></code> | List of [goal intervention objects](#care-flow-model-intervention)

### Model intervention
field | description
- | -
description <br /><code><a href='#types'>string</a></code> | Title of the Care Flow intervention
reminder_date <br /><code><a href='#types'>isodatetime</a></code> | Due date for the intervention
completed_at <br /><code><a href='#types'>isodatetime</a></code> | Date the intervention was marked completed
completed_by_worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who completed this intervention
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who this intervention is assigned to


### Get
Retrieves a single __care flow__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/care_flows/c68a80d4-95ea-4f61-bf90-615d70bea591 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/care_flows/c68a80d4-95ea-4f61-bf90-615d70bea591'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/care_flows/c68a80d4-95ea-4f61-bf90-615d70bea591';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/care_flows/:id`

#### Required Scope
`care_flows.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "c68a80d4-95ea-4f61-bf90-615d70bea591",
    "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
    "care_flow": {
      "title": "patient needs at least 30min exercise per day",
      "description": "increase daily exercise",
      "goals": [
        {
          "title": "Make a plan",
          "tasks": [
            {
              "description": "Help the patient decide what type of exercise they can commit to doing.",
              "due_date": "2018-08-07T00:00:00+00:00",
              "worker_id": null,
              "completed_by_worker_id": null,
              "completed_at": null
            },
            {
              "description": "Make sure there is a written record of the patient's new exercise plan",
              "due_date": "2018-08-10T00:00:00+00:00",
              "worker_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
              "completed_by_worker_id": null,
              "completed_at": null
            }
          ]
        }
      ]
    },
    "updated_at": "2018-09-12T01:27:32.029691+00:00",
    "created_at": "2018-09-12T01:27:32.029817+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __care flows__ record.








### Find
Retrieves __care flows__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __care flows__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/care_flows -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/care_flows'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/care_flows';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/care_flows`

#### Required Scope
`care_flows.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "c68a80d4-95ea-4f61-bf90-615d70bea591",
      "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
      "care_flow": {
        "title": "patient needs at least 30min exercise per day",
        "description": "increase daily exercise",
        "goals": [
          {
            "title": "Make a plan",
            "tasks": [
              {
                "description": "Help the patient decide what type of exercise they can commit to doing.",
                "due_date": "2018-08-07T00:00:00+00:00",
                "worker_id": null,
                "completed_by_worker_id": null,
                "completed_at": null
              },
              {
                "description": "Make sure there is a written record of the patient's new exercise plan",
                "due_date": "2018-08-10T00:00:00+00:00",
                "worker_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
                "completed_by_worker_id": null,
                "completed_at": null
              }
            ]
          }
        ]
      },
      "updated_at": "2018-09-12T01:27:32.029691+00:00",
      "created_at": "2018-09-12T01:27:32.029817+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response






## Conversations


Conversations track the text-based conversations between [workers](#workers) and [patients](#patients).

Text-based communication methods supported by Welkin are: SMS, email, and in-app messaging.

<aside>Only in-app and email conversations can be created via this API. There is only one SMS conversation per
<a href="#patients">patient</a> <a href="#phone-numbers">phone number</a> and that conversation is automatically created when the
phone number is added to the patient.</aside>









### Model

> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App",
  "phone_number_id": null,
  "email_address_ids": null,
  "updated_at": "2018-09-12T01:27:32.031245+00:00",
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __conversations__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) participant in this conversation. Only one patient can participate in any single conversation.
conversation_type <br /><code><a href='#types'>enum</a></code> | `sms`, `email`, `app` (In app messages to non-Welkin apps), `welkin_app` (Welkin's 1st party in app messages)
title <br /><code><a href='#types'>string</a></code> | The title string to be displayed in the conversation view for 3rd party app conversations
email_address_ids <br /><code><a href='#types'>guid</a></code> | The [patient email addresses](#email-addresses) included in this conversation.
phone_number_id <br /><code><a href='#types'>guid</a></code> | The ID of the [patient's](#patients) phone number which will be included in this conversation. This ID will be `null` for email and in-app message conversations.
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __conversation__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/conversations/bfa29e70-e328-4c3b-a3d1-7c2d959735ca -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/conversations/bfa29e70-e328-4c3b-a3d1-7c2d959735ca'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/conversations/bfa29e70-e328-4c3b-a3d1-7c2d959735ca';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/conversations/:id`

#### Required Scope
`conversations.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
    "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
    "conversation_type": "app",
    "title": "App",
    "phone_number_id": null,
    "email_address_ids": null,
    "updated_at": "2018-09-12T01:27:32.031245+00:00",
    "created_at": "2018-09-12T01:27:32.031362+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __conversations__ record.





### Create


Create a 3rd party app conversation for a [patient](#patients)





#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/conversations -d '{
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App"
}
url = 'https://api.welkinhealth.com/v1/conversations'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/conversations';
const data = {
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/conversations -d { }`

#### Required Scope
`conversations.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
    "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
    "conversation_type": "app",
    "title": "App",
    "phone_number_id": null,
    "email_address_ids": null,
    "updated_at": "2018-09-12T01:27:32.031245+00:00",
    "created_at": "2018-09-12T01:27:32.031362+00:00"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) participant in this conversation. Only one patient can participate in any single conversation.
conversation_type <br /><code><a href='#types' class='required'>enum</a></code> | Only `app` is supported for creating conversations. SMS conversations are created automatically when a [phone number](#phone-numbers) is created.
title <br /><code><a href='#types' class='optional'>string</a></code> | The title string to be displayed in the conversation view for 3rd party app conversations
email_address_ids <br /><code><a href='#types' class='optional'>list(guid)</a></code> | The [patient email addresses](#email-addresses) included in this conversation.







### Find
Retrieves __conversations__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __conversations__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/conversations -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/conversations'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/conversations';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/conversations`

#### Required Scope
`conversations.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
      "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
      "conversation_type": "app",
      "title": "App",
      "phone_number_id": null,
      "email_address_ids": null,
      "updated_at": "2018-09-12T01:27:32.031245+00:00",
      "created_at": "2018-09-12T01:27:32.031362+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) participant in this conversation. Only one patient can participate in any single conversation.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Custom Data Type Records


Welkin stores the custom data associated with [patients](#patients) in custom data type records. The custom data
types must first be defined in [Workshop](https://workshop.welkinhealth.com) before they can be addressed in the API.
<aside>Multiple records of the same data type can be created for each <a href="#patients">patient</a>. Depending on the display
conditions and data uses defined in <a href="https://workshop.welkinhealth.com">Workshop</a>, creating multiple records of the
same type will have different effects within the Welkin Portal.</aside>



### Model

> Example Response

```json
{
  "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  },
  "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
  "type_name": "hcp",
  "updated_at": "2018-09-12T01:27:32.033666+00:00",
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __custom data type records__ record.
body <br /><code><a href='#types'>json</a></code> | The content of the custom data type record
patient_id <br /><code><a href='#types'>guid</a></code> | The ID of the [patient](#patients)
type_name <br /><code><a href='#types'>string</a></code> | ID of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
updated_by <br /><code></code> | 
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __custom data type record__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/custom_data_type_records/:id`

#### Required Scope
`custom_data_type_records.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
    "body": {
      "name": "Frank Smith",
      "suffix": "MD",
      "practice_name": "Boston Medical Group",
      "office_id": "e32ac52",
      "specialty": "internal medicine"
    },
    "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
    "type_name": "hcp",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __custom data type records__ record.





### Create


Creates a new __custom data type record__.
<aside>This method will always create a new record even if the CDT is displayed as a single value sidebar section
in Welkin. In Welkin we will show the values from the latest created record. In Welkin edits to a
single value sidebar will not create a new record but rather update the latest record.</aside>




#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/custom_data_type_records -d '{
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  },
  "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
  "type_name": "hcp"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  },
  "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
  "type_name": "hcp"
}
url = 'https://api.welkinhealth.com/v1/custom_data_type_records'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/custom_data_type_records';
const data = {
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  },
  "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
  "type_name": "hcp"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/custom_data_type_records -d { }`

#### Required Scope
`custom_data_type_records.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
    "body": {
      "name": "Frank Smith",
      "suffix": "MD",
      "practice_name": "Boston Medical Group",
      "office_id": "e32ac52",
      "specialty": "internal medicine"
    },
    "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
    "type_name": "hcp",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
body <br /><code><a href='#types' class='required'>json</a></code> | The content of the custom data type record
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | The ID of the [patient](#patients)
type_name <br /><code><a href='#types' class='required'>string</a></code> | ID of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)





### Update
Updates an existing __custom data type record__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7 -d '{
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  }
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  }
}
url = 'https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7';
const data = {
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  }
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/custom_data_type_records/:id -d { }`

#### Required Scope
`custom_data_type_records.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
    "body": {
      "name": "Frank Smith",
      "suffix": "MD",
      "practice_name": "Boston Medical Group",
      "office_id": "e32ac52",
      "specialty": "internal medicine"
    },
    "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
    "type_name": "hcp",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __custom data type records__ record.
body <br /><code><a href='#types' class='required'>json</a></code> | The content of the custom data type record





### Delete
Deletes a single __custom data type record__.


#### Invocation

> Example Request

```shell
curl -XDELETE https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7'

resp = requests.delete(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7';

const response = await axios({method: 'delete', url: url, headers: headers});

```

`DELETE /v1/custom_data_type_records/:id`

#### Required Scope
`custom_data_type_records.write` or `all`

> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __custom data type records__ record.





### Find
Retrieves __custom data type records__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __custom data type records__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/custom_data_type_records -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/custom_data_type_records'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/custom_data_type_records';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/custom_data_type_records`

#### Required Scope
`custom_data_type_records.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
      "body": {
        "name": "Frank Smith",
        "suffix": "MD",
        "practice_name": "Boston Medical Group",
        "office_id": "e32ac52",
        "specialty": "internal medicine"
      },
      "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
      "type_name": "hcp",
      "updated_at": "2018-09-12T01:27:32.033666+00:00",
      "created_at": "2018-09-12T01:27:32.033816+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of the [patient](#patients)
type_name <br /><code><a href='#types' class='optional'>string</a></code> | ID of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Email Addresses


Manage [patient](#patients) email addresses based on [patient](#patients) consent.

Each [patient](#patients) email address has its own consents and opt-in status. When setting the consent flags on
a email address, make sure that you have a record of how and when consent was received from the [patient](#patients).

<aside>There are no uniqueness constraints for email addresses. Unlike <a href="#phone-numbers">phone numbers</a>, emails between
<a href="#patients">patients</a> and <a href="#workers">workers</a> will be routed to the correct <a href="#patients">patient</a>, even if one or
more <a href="#patients">patients</a> share the same email address.</aside>











### Model

> Example Response

```json
{
  "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false,
  "updated_at": "2018-09-12T01:27:32.035940+00:00",
  "created_at": "2018-09-12T01:27:32.036062+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __email addresses__ record.
email <br /><code><a href='#types'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#types'>string</a></code> | The display name for a [patient](#patients) email address, visible to [workers](#workers)
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) which this email address is associated with.
user_id <br /><code><a href='#types'>guid</a></code> | (Deprecated) ID of the [patient](#patients) which this email address is associated with.
verified <br /><code><a href='#types'>boolean</a></code> | `true` only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verification email. This does not guarantee that the email address is owned by the [patient](#patients). Default `false`
opted_in_to_email <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address. Default `false`
automatic_recipient <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive automated emails at this email address. Default `false`
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __email address__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/email_addresses/:id`

#### Required Scope
`email_addresses.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
    "email": "developer@welkinhealth.com",
    "friendly_name": "developer contact",
    "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
    "verified": false,
    "opted_in_to_email": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.035940+00:00",
    "created_at": "2018-09-12T01:27:32.036062+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __email addresses__ record.





### Create
Creates a new __email address__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/email_addresses -d '{
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
}
url = 'https://api.welkinhealth.com/v1/email_addresses'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/email_addresses';
const data = {
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/email_addresses -d { }`

#### Required Scope
`email_addresses.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
    "email": "developer@welkinhealth.com",
    "friendly_name": "developer contact",
    "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
    "verified": false,
    "opted_in_to_email": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.035940+00:00",
    "created_at": "2018-09-12T01:27:32.036062+00:00"
  }
}
```

#### Params


param | description
- | -
email <br /><code><a href='#types' class='required'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#types' class='optional'>string</a></code> | The display name for a [patient](#patients) email address, visible to [workers](#workers)
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) which this email address is associated with.
user_id <br /><code><a href='#types' class='required'>guid</a></code> | (Deprecated) ID of the [patient](#patients) which this email address is associated with.
verified <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verification email. This does not guarantee that the email address is owned by the [patient](#patients). Default `false`
opted_in_to_email <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address. Default `false`
automatic_recipient <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive automated emails at this email address. Default `false`





### Update
Updates an existing __email address__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd -d '{
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
}
url = 'https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd';
const data = {
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/email_addresses/:id -d { }`

#### Required Scope
`email_addresses.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
    "email": "developer@welkinhealth.com",
    "friendly_name": "developer contact",
    "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
    "verified": false,
    "opted_in_to_email": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.035940+00:00",
    "created_at": "2018-09-12T01:27:32.036062+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __email addresses__ record.
email <br /><code><a href='#types' class='optional'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#types' class='optional'>string</a></code> | The display name for a [patient](#patients) email address, visible to [workers](#workers)
verified <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verification email. This does not guarantee that the email address is owned by the [patient](#patients). Default `false`
opted_in_to_email <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address. Default `false`
automatic_recipient <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive automated emails at this email address. Default `false`





### Delete
Deletes a single __email address__.


#### Invocation

> Example Request

```shell
curl -XDELETE https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd'

resp = requests.delete(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd';

const response = await axios({method: 'delete', url: url, headers: headers});

```

`DELETE /v1/email_addresses/:id`

#### Required Scope
`email_addresses.write` or `all`

> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __email addresses__ record.





### Find
Retrieves __email addresses__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __email addresses__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/email_addresses -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/email_addresses'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/email_addresses';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/email_addresses`

#### Required Scope
`email_addresses.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd",
      "email": "developer@welkinhealth.com",
      "friendly_name": "developer contact",
      "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
      "verified": false,
      "opted_in_to_email": true,
      "automatic_recipient": false,
      "updated_at": "2018-09-12T01:27:32.035940+00:00",
      "created_at": "2018-09-12T01:27:32.036062+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) which this email address is associated with.
user_id <br /><code><a href='#types' class='optional'>guid</a></code> | (Deprecated) ID of the [patient](#patients) which this email address is associated with.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Email Messages


Email messages can be viewed and created from the [conversation](#conversations) view of the [Patient](#patients)
profile.
Email messages can also be sent to patients via this API endpoint. Email messages sent from patients are received
and recorded in Welkin when the patient responds.














### Model

> Example Response

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
  "patient_id": "e6cf56d8-a62d-4581-8339-91c846960041",
  "direction": "outbound",
  "subject": "This is a test email subject",
  "body_text": "This is a sample email body",
  "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "automatically_sent": "false",
  "footer": "If you are experiencing a life-threatening emergency, please call 911.",
  "sent_at": "2019-10-13T01:32:12.000000+00:00",
  "updated_at": "2018-09-12T01:27:32.033666+00:00",
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __email messages__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
sender_id <br /><code><a href='#types'>guid</a></code> | The ID of the email sender. When creating an email, this must be a [worker](#workers) ID.
direction <br /><code><a href='#types'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
conversation_id <br /><code><a href='#types'>guid</a></code> | The [conversation](#conversations) that contains this message. This must refer to a conversation with `conversation_type` `"email"`. The [patient_id](#patients) of a newly created email will be the same as the patient in the conversation.
subject <br /><code><a href='#types'>string</a></code> | Subject of the message
body_html <br /><code><a href='#types'>html_template</a></code> | HTML body of the message
body_text <br /><code><a href='#types'>string</a></code> | Text body of the message
footer <br /><code><a href='#types'>string</a></code> | The content of the message footer which was appended to the bottom of the message automatically by Welkin before it was sent. This will be blank if footers have not been configured for the Wekin environment being used.
sent_at <br /><code><a href='#types'>isodatatime</a></code> | The time when the messages was sent. For `inbound` emails this is the time when Welkin received the message.
automatically_sent <br /><code><a href='#types'>boolean</a></code> | Denotes whether the message was created and sent by a [worker](#workers), or via automated process. Only applies to `outbound` messages.
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __email message__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/email_messages/76c5662c-1e16-4cfa-bbad-900e721a290b -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/email_messages/76c5662c-1e16-4cfa-bbad-900e721a290b'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/email_messages/76c5662c-1e16-4cfa-bbad-900e721a290b';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/email_messages/:id`

#### Required Scope
`email_messages.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
    "patient_id": "e6cf56d8-a62d-4581-8339-91c846960041",
    "direction": "outbound",
    "subject": "This is a test email subject",
    "body_text": "This is a sample email body",
    "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
    "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
    "automatically_sent": "false",
    "footer": "If you are experiencing a life-threatening emergency, please call 911.",
    "sent_at": "2019-10-13T01:32:12.000000+00:00",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __email messages__ record.





### Create


Send an email message through Welkin to the [patient](#patients).

If you omit `body_text` or `body_html`, Welkin will use the other field to populate the missing one.

You can provide an existing `conversation_id`, or provide a `conversation` object to batch-create a conversation for
this message.




#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/email_messages -d '{
  "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "subject": "This is a test email subject",
  "body_text": "This is a sample email body",
  "automatically_sent": "false"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "subject": "This is a test email subject",
  "body_text": "This is a sample email body",
  "automatically_sent": "false"
}
url = 'https://api.welkinhealth.com/v1/email_messages'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/email_messages';
const data = {
  "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "subject": "This is a test email subject",
  "body_text": "This is a sample email body",
  "automatically_sent": "false"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/email_messages -d { }`

#### Required Scope
`email_messages.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
    "patient_id": "e6cf56d8-a62d-4581-8339-91c846960041",
    "direction": "outbound",
    "subject": "This is a test email subject",
    "body_text": "This is a sample email body",
    "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
    "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
    "automatically_sent": "false",
    "footer": "If you are experiencing a life-threatening emergency, please call 911.",
    "sent_at": "2019-10-13T01:32:12.000000+00:00",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
sender_id <br /><code><a href='#types' class='required'>guid</a></code> | The ID of the email sender. When creating an email, this must be a [worker](#workers) ID.
conversation_id <br /><code><a href='#types' class='required'>guid</a></code> | The [conversation](#conversations) that contains this message. This must refer to a conversation with `conversation_type` `"email"`. The [patient_id](#patients) of a newly created email will be the same as the patient in the conversation.
subject <br /><code><a href='#types' class='required'>string</a></code> | Subject of the message
body_html <br /><code><a href='#types' class='optional'>html_template</a></code> | HTML body of the message
body_text <br /><code><a href='#types' class='optional'>string</a></code> | Text body of the message
automatically_sent <br /><code><a href='#types' class='required'>boolean</a></code> | Denotes whether the message was created and sent by a [worker](#workers), or via automated process. Only applies to `outbound` messages.







### Find
Retrieves __email messages__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __email messages__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/email_messages -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/email_messages'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/email_messages';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/email_messages`

#### Required Scope
`email_messages.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
      "patient_id": "e6cf56d8-a62d-4581-8339-91c846960041",
      "direction": "outbound",
      "subject": "This is a test email subject",
      "body_text": "This is a sample email body",
      "conversation_id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
      "sender_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
      "automatically_sent": "false",
      "footer": "If you are experiencing a life-threatening emergency, please call 911.",
      "sent_at": "2019-10-13T01:32:12.000000+00:00",
      "updated_at": "2018-09-12T01:27:32.033666+00:00",
      "created_at": "2018-09-12T01:27:32.033816+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Event Labels


Event Labels are used to classify the outcome of a [call](#calls) or [visit](#visits). [Workers](#workers) can
label events after they complete either from the timeline or in the prompt shown at the end of the call.
Event Labels are available in Welkin's analytics to help track the outcomes of events.







### Model

> Example Response

```json
{
  "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  },
  "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
  "entity_type": "call",
  "updated_at": "2018-09-12T01:27:32.033666+00:00",
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __event labels__ record.
body <br /><code><a href='#types'>json</a></code> | A json object containing label IDs and associated answers. The set of labels and their IDs and valid values are defined in [Workshop](https://workshop.welkinhealth.com).
entity_id <br /><code><a href='#types'>guid</a></code> | The ID of the [call](#calls) or [visit](#visits) which this event label set is attached to.
entity_type <br /><code><a href='#types'>enum</a></code> | The type of the `entity_id` object (either `call` or `visit`).
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated




### Get
Retrieves a single __event label__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/event_labels/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/event_labels/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/event_labels/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/event_labels/:id`

#### Required Scope
`event_labels.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
    "body": {
      "welkin_default": "completed",
      "follow_up": "no"
    },
    "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
    "entity_type": "call",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __event labels__ record.





### Create
Creates a new __event label__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/event_labels -d '{
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  },
  "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  },
  "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4"
}
url = 'https://api.welkinhealth.com/v1/event_labels'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/event_labels';
const data = {
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  },
  "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/event_labels -d { }`

#### Required Scope
`event_labels.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
    "body": {
      "welkin_default": "completed",
      "follow_up": "no"
    },
    "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
    "entity_type": "call",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
body <br /><code><a href='#types' class='required'>json</a></code> | A json object containing label IDs and associated answers. The set of labels and their IDs and valid values are defined in [Workshop](https://workshop.welkinhealth.com).
entity_id <br /><code><a href='#types' class='required'>guid</a></code> | The ID of the [call](#calls) or [visit](#visits) which this event label set is attached to.





### Update
Updates an existing __event label__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/event_labels/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7 -d '{
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  }
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  }
}
url = 'https://api.welkinhealth.com/v1/event_labels/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/event_labels/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7';
const data = {
  "body": {
    "welkin_default": "completed",
    "follow_up": "no"
  }
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/event_labels/:id -d { }`

#### Required Scope
`event_labels.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
    "body": {
      "welkin_default": "completed",
      "follow_up": "no"
    },
    "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
    "entity_type": "call",
    "updated_at": "2018-09-12T01:27:32.033666+00:00",
    "created_at": "2018-09-12T01:27:32.033816+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __event labels__ record.
body <br /><code><a href='#types' class='required'>json</a></code> | A json object containing label IDs and associated answers. The set of labels and their IDs and valid values are defined in [Workshop](https://workshop.welkinhealth.com).






### Find
Retrieves __event labels__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __event labels__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/event_labels -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/event_labels'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/event_labels';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/event_labels`

#### Required Scope
`event_labels.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7",
      "body": {
        "welkin_default": "completed",
        "follow_up": "no"
      },
      "entity_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
      "entity_type": "call",
      "updated_at": "2018-09-12T01:27:32.033666+00:00",
      "created_at": "2018-09-12T01:27:32.033816+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## External Ids


Welkin APIs and systems communicate via GUIDs. All communications with Welkin's standard API must be made using
Welkin's GUIDs. In rare cases, custom integrations are supported by mapping Welkin IDs to a set of external IDs.
To learn more about custom integrations, [drop us a line](https://welkinhealth.com/contact-us/).
<aside>Duplicate entries for the same Welkin ID or same External ID within a single namespace will be rejected.</aside>



### Model

> Example Response

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __external ids__ record.
resource <br /><code><a href='#types'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#types'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#types'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#types'>guid</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.




### Get
Retrieves a single __external id__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/external_ids/:id`

#### Required Scope
`external_ids.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
    "resource": "calendar_events",
    "namespace": "ehr",
    "external_id": "abc-123",
    "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __external ids__ record.





### Create
Creates a new __external id__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/external_ids -d '{
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
url = 'https://api.welkinhealth.com/v1/external_ids'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/external_ids';
const data = {
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/external_ids -d { }`

#### Required Scope
`external_ids.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
    "resource": "calendar_events",
    "namespace": "ehr",
    "external_id": "abc-123",
    "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
  }
}
```

#### Params


param | description
- | -
resource <br /><code><a href='#types' class='required'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#types' class='required'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#types' class='required'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.





### Update
Updates an existing __external id__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b -d '{
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
url = 'https://api.welkinhealth.com/v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b';
const data = {
  "resource": "calendar_events",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/external_ids/:id -d { }`

#### Required Scope
`external_ids.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
    "resource": "calendar_events",
    "namespace": "ehr",
    "external_id": "abc-123",
    "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __external ids__ record.
resource <br /><code><a href='#types' class='optional'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#types' class='optional'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#types' class='optional'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.






### Find
Retrieves __external ids__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __external ids__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/external_ids -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/external_ids'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/external_ids';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/external_ids`

#### Required Scope
`external_ids.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
      "resource": "calendar_events",
      "namespace": "ehr",
      "external_id": "abc-123",
      "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
resource <br /><code><a href='#types' class='optional'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#types' class='optional'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#types' class='optional'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#types' class='optional'>string</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## File Attachments


Attach [uploaded files](#file_uploads) to specific [patient](#patients) profiles. A single file can be attached to
multiple [patients](#patients).

A timeline event is automatically created when a file is attached to a [patient](#patients). This timeline event
includes the file preview and the attachment type.










### Model

> Example Response

```json
{
  "id": "b43694f1-ed2d-4e0d-a9ee-65a7e093efee",
  "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
  "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
  "attachment_type": "x-ray",
  "description": "Right leg",
  "file_upload_ids": [
    "efbcc819-f25f-4bf4-afd4-198a035d5340"
  ],
  "created_at": "2020-06-24T01:27:32.045336+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __file attachments__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) profile onto which the file will be attached
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the worker who is attaching the file
attachment_type <br /><code><a href='#types'>string</a></code> | A label attached to the file. Note, for your implementation of Welkin there may be a predefined set of possible labels.
description <br /><code><a href='#types'>optional</a> <a href='#types'>string</a></code> | Text description or notes about the file being attached
file_upload_ids <br /><code><a href='#types'>list(guid)</a></code> | List of [file upload IDs](#file-uploads) to attach to the [patient](#patients)
created_at <br /><code><a href='#types'>isodatetime</a></code> | Date and time when the attachment created




### Get
Retrieves a single __file attachment__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/file_attachments/b43694f1-ed2d-4e0d-a9ee-65a7e093efee -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/file_attachments/b43694f1-ed2d-4e0d-a9ee-65a7e093efee'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/file_attachments/b43694f1-ed2d-4e0d-a9ee-65a7e093efee';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/file_attachments/:id`

#### Required Scope
`file_attachments.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "b43694f1-ed2d-4e0d-a9ee-65a7e093efee",
    "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
    "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
    "attachment_type": "x-ray",
    "description": "Right leg",
    "file_upload_ids": [
      "efbcc819-f25f-4bf4-afd4-198a035d5340"
    ],
    "created_at": "2020-06-24T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __file attachments__ record.





### Create
Creates a new __file attachment__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/file_attachments -d '{
  "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
  "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
  "attachment_type": "x-ray",
  "description": "Right leg",
  "file_upload_ids": [
    "efbcc819-f25f-4bf4-afd4-198a035d5340"
  ]
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
  "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
  "attachment_type": "x-ray",
  "description": "Right leg",
  "file_upload_ids": [
    "efbcc819-f25f-4bf4-afd4-198a035d5340"
  ]
}
url = 'https://api.welkinhealth.com/v1/file_attachments'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/file_attachments';
const data = {
  "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
  "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
  "attachment_type": "x-ray",
  "description": "Right leg",
  "file_upload_ids": [
    "efbcc819-f25f-4bf4-afd4-198a035d5340"
  ]
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/file_attachments -d { }`

#### Required Scope
`file_attachments.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "b43694f1-ed2d-4e0d-a9ee-65a7e093efee",
    "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
    "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
    "attachment_type": "x-ray",
    "description": "Right leg",
    "file_upload_ids": [
      "efbcc819-f25f-4bf4-afd4-198a035d5340"
    ],
    "created_at": "2020-06-24T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) profile onto which the file will be attached
worker_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the worker who is attaching the file
attachment_type <br /><code><a href='#types' class='required'>string</a></code> | A label attached to the file. Note, for your implementation of Welkin there may be a predefined set of possible labels.
description <br /><code><a href='#types' class='optional'>string</a></code> | Text description or notes about the file being attached
file_upload_ids <br /><code><a href='#types' class='required'>list(guid)</a></code> | List of [file upload IDs](#file-uploads) to attach to the [patient](#patients)







### Find
Retrieves __file attachments__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __file attachments__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/file_attachments -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/file_attachments'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/file_attachments';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/file_attachments`

#### Required Scope
`file_attachments.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "b43694f1-ed2d-4e0d-a9ee-65a7e093efee",
      "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
      "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
      "attachment_type": "x-ray",
      "description": "Right leg",
      "file_upload_ids": [
        "efbcc819-f25f-4bf4-afd4-198a035d5340"
      ],
      "created_at": "2020-06-24T01:27:32.045336+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response






## File Uploads


Upload a file to Welkin. Uploaded files are stored on Amazon S3 and only become visible on a [patient](#patients)
profile one they have been attached via the [File Attachments](#file-attachments) api.

<aside>File upload is a non-RESTful operation which is conducted at <code>/v1/file_uploads/upload</code></aside>







### Model

> Example Response

```json
{
  "id": "efbcc819-f25f-4bf4-afd4-198a035d5340",
  "mime_type": "image/png",
  "url": "https://welkin-photos-prod-bdb45be0-464e.s3.amazonaws.com/2ab9791d-86f1-e50?AWSAccessKeyId=ASIA&Expires=153924&x-amz-security-token=FQoGZXdz&Signature=FjSiY"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __file uploads__ record.
mime_type <br /><code><a href='#types'>enum</a></code> | MIME type of the file being uploaded. Accepted MINE types: `image/tiff`, `image/jpeg`, `image/png`, `application/pdf`
url <br /><code><a href='#types'>string</a></code> | URL of the file, including access tokens, of the file on Amazon S3. Note, the example URL has been truncated for display purposes.




### Upload
Accepts the binary data of a file and creates the file upload record.

#### Invocation

> Example Request (Python)

```python
import requests

url = 'https://api.welkinhealth.com/v1/file_uploads/upload'
headers = {'Content-Type': 'image/png'}
file_data = open('example.png', 'rb')

r = requests.post(url, data=file_data, headers=headers)
```

`POST /v1/file_uploads/upload -d { }`

> Example Response

```json
{
    "id": "efbcc819-f25f-4bf4-afd4-198a035d5340",
    "mime_type": "image/png",
    "url": "https://welkin-photos-prod-bdb45be0-464e.s3.amazonaws.com/2ab9791d-86f1-e50?AWSAccessKeyId=ASIA&Expires=153924&x-amz-security-token=FQoGZXdz&Signature=FjSiY"
}
```

#### Required Scope
`all`

#### Params

param | description
- | -
Content-Type<br /><code><a href='#string'>string</a></code> | MIME type of the file being uploaded. Accepted MINE types: `image/tiff`, `image/jpeg`, `image/png`, `application/pdf`. Must be included as a header.
data<br /><code><a href='#binary'>binary</a></code> | The binary data of the file.


### Get
Retrieves a single __file upload__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/file_uploads/efbcc819-f25f-4bf4-afd4-198a035d5340 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/file_uploads/efbcc819-f25f-4bf4-afd4-198a035d5340'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/file_uploads/efbcc819-f25f-4bf4-afd4-198a035d5340';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/file_uploads/:id`

#### Required Scope
`file_uploads.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "efbcc819-f25f-4bf4-afd4-198a035d5340",
    "mime_type": "image/png",
    "url": "https://welkin-photos-prod-bdb45be0-464e.s3.amazonaws.com/2ab9791d-86f1-e50?AWSAccessKeyId=ASIA&Expires=153924&x-amz-security-token=FQoGZXdz&Signature=FjSiY"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __file uploads__ record.





### Find
Retrieves __file uploads__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __file uploads__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/file_uploads -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/file_uploads'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/file_uploads';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/file_uploads`

#### Required Scope
`file_uploads.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "efbcc819-f25f-4bf4-afd4-198a035d5340",
      "mime_type": "image/png",
      "url": "https://welkin-photos-prod-bdb45be0-464e.s3.amazonaws.com/2ab9791d-86f1-e50?AWSAccessKeyId=ASIA&Expires=153924&x-amz-security-token=FQoGZXdz&Signature=FjSiY"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response





## Integration Tasks (provisional)


This endpoint reports the statuses and resulting errors from the ingestion of data via custom integrations built
by Welkin.

<aside>This only applies for custom integrations built by Welkin and is rarely used. Integrations created using
Welkin's standard API are self reporting and do not require Integration Task monitoring as exposed here.</aside>











### Model

> Example Response

```json
{
  "id": "9bf1e295-47f5-4027-a382-008c860694c2",
  "status": "failed",
  "patient_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "ref_ids": [
    "abc123",
    "cdf456"
  ],
  "job_id": "8bf1e295-4944-1027-d382-0c36846acd4c",
  "task_name": "kiwihealth_pull.process_item",
  "updated_at": "2018-09-12T01:27:32.041332+00:00",
  "created_at": "2018-09-12T01:27:32.041464+00:00",
  "errors": [
    {
      "code": "patient_not_found",
      "message": "There is no patient with that ID."
    }
  ]
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __integration tasks__ record.
status <br /><code><a href='#types'>enum</a></code> | Status of the task. Possible options are, `unattempted`, `running`, `failed`, or `succeeded`
patient_id <br /><code><a href='#types'>guid</a></code> | The ID of the [patient](#patients)
ref_ids <br /><code><a href='#types'>array</a> <a href='#types'>string</a></code> | Array of external IDs associated with the tasks, linking the task to the resource in external systems.
job_id <br /><code><a href='#types'>string</a></code> | Groups related tasks together
task_name <br /><code><a href='#types'>string</a></code> | The name of the task prefixed by the name of the job
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
errors <br /><code><a href='#types'>array</a> <a href='#types'>integration-errors</a></code> | Array of all the errors that resulted from this specific task. Note, these errors do not roll up to parent tasks.




### Model integration-errors
field | type | description
- | - | -
code | `string` | Machine readable error code. The set of possible errors is defined during custom implementation. Examples include: `patient_not_found` or `customer_disabled`
message | `string` | The display message associated with the error code
extra | `string` | JSON blob of information related to this error

### Integration jobs
An integration job is a series of tasks all linked together with a common job id.

The following describes an example of a custom integration, and how a job can be structured and reported.

Kiwi Health is an external system that sends patient data to Welkin through a custom integration. When new data is available for Welkin to consume, Kiwi Health sends Welkin a notification. Welkin then validates the notification, fetches the data, and processes it.

A custom integration job could be structured as follows:

* kiwihealth_pull.run_kiwihealth_pull
    * kiwihealth_pull.validate_patient
    * kiwihealth_pull.fetch_results
    * kiwihealth_pull.process_response
        * kiwihealth_pull.process_item (potentially multiple process_item tasks)

The top-level task (run_kiwihealth_pull) reports the status of the entire job, not the individual tasks linked to the job. Individual task statuses are reported by task, but any errors they encounter can cause the whole job to fail.


### Get
Retrieves a single __integration task__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/integration_tasks/9bf1e295-47f5-4027-a382-008c860694c2 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/integration_tasks/9bf1e295-47f5-4027-a382-008c860694c2'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/integration_tasks/9bf1e295-47f5-4027-a382-008c860694c2';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/integration_tasks/:id`

#### Required Scope
`integration_tasks.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "9bf1e295-47f5-4027-a382-008c860694c2",
    "status": "failed",
    "patient_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "ref_ids": [
      "abc123",
      "cdf456"
    ],
    "job_id": "8bf1e295-4944-1027-d382-0c36846acd4c",
    "task_name": "kiwihealth_pull.process_item",
    "updated_at": "2018-09-12T01:27:32.041332+00:00",
    "created_at": "2018-09-12T01:27:32.041464+00:00",
    "errors": [
      {
        "code": "patient_not_found",
        "message": "There is no patient with that ID."
      }
    ]
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __integration tasks__ record.








### Find


Finds integration tasks, using param filters.





#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/integration_tasks -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/integration_tasks'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/integration_tasks';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/integration_tasks`

#### Required Scope
`integration_tasks.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "9bf1e295-47f5-4027-a382-008c860694c2",
      "status": "failed",
      "patient_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
      "ref_ids": [
        "abc123",
        "cdf456"
      ],
      "job_id": "8bf1e295-4944-1027-d382-0c36846acd4c",
      "task_name": "kiwihealth_pull.process_item",
      "updated_at": "2018-09-12T01:27:32.041332+00:00",
      "created_at": "2018-09-12T01:27:32.041464+00:00",
      "errors": [
        {
          "code": "patient_not_found",
          "message": "There is no patient with that ID."
        }
      ]
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
job_id <br /><code><a href='#types' class='optional'>string</a></code> | Groups related tasks together
task_name <br /><code><a href='#types' class='optional'>string</a></code> | The name of the task prefixed by the name of the job
ref_id <br /><code><a href='#types' class='optional'>string</a></code> | An external ID associated with the task, linking the task to the resource in external systems.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response






## Patient Facing Assessment Links


A patient facing assessment link is a unique, one-time link that can be shared with a patient so
they can fill out the assessment independently.

Generated links are only valid for the specific duration. This duration is set to 30 days by default,
although it can be changed through a PSE request





### Model

> Example Response

```json
{
  "url": "https://survey.welkinhealth.com/beta/?token=6db22d8e-de8e-43a8-be5c-19957dd2b2a0&spec_name=pet_wellness",
  "created_at": "2020-05-28T14:19:29.503879+00:00",
  "updated_at": "2020-05-28T14:19:29.503904+00:00",
  "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
  "expire_time": "2020-06-27T14:19:29.500985+00:00",
  "id": "6db22d8e-de8e-43a8-be5c-19957dd2b2a0"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __patient facing assessment links__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) on which the assessment response will be placed
expire_time <br /><code></code> | Datetime when the link will expire
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
url <br /><code></code> | Fully qualified URL to be presented to the user to fill out the assessment




### Get
Retrieves a single __patient facing assessment link__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/patient_facing_assessment_links/6db22d8e-de8e-43a8-be5c-19957dd2b2a0 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/patient_facing_assessment_links/6db22d8e-de8e-43a8-be5c-19957dd2b2a0'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/patient_facing_assessment_links/6db22d8e-de8e-43a8-be5c-19957dd2b2a0';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/patient_facing_assessment_links/:id`

#### Required Scope
`patient_facing_assessment_links.read` or `all`

> Example Response

```json
{
  "data": {
    "url": "https://survey.welkinhealth.com/beta/?token=6db22d8e-de8e-43a8-be5c-19957dd2b2a0&spec_name=pet_wellness",
    "created_at": "2020-05-28T14:19:29.503879+00:00",
    "updated_at": "2020-05-28T14:19:29.503904+00:00",
    "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
    "expire_time": "2020-06-27T14:19:29.500985+00:00",
    "id": "6db22d8e-de8e-43a8-be5c-19957dd2b2a0"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __patient facing assessment links__ record.





### Create
Creates a new __patient facing assessment link__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/patient_facing_assessment_links -d '{
  "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
  "spec_name": "some_string"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
  "spec_name": "some_string"
}
url = 'https://api.welkinhealth.com/v1/patient_facing_assessment_links'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/patient_facing_assessment_links';
const data = {
  "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
  "spec_name": "some_string"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/patient_facing_assessment_links -d { }`

#### Required Scope
`patient_facing_assessment_links.write` or `all`

> Example Response

```json
{
  "data": {
    "url": "https://survey.welkinhealth.com/beta/?token=6db22d8e-de8e-43a8-be5c-19957dd2b2a0&spec_name=pet_wellness",
    "created_at": "2020-05-28T14:19:29.503879+00:00",
    "updated_at": "2020-05-28T14:19:29.503904+00:00",
    "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
    "expire_time": "2020-06-27T14:19:29.500985+00:00",
    "id": "6db22d8e-de8e-43a8-be5c-19957dd2b2a0"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) on which the assessment response will be placed
spec_name <br /><code><a href='#types' class='required'>string</a></code> | The ref_name for the assessment as it appears in [Workshop](https://workshop.welkinhealth.com).







### Find
Retrieves __patient facing assessment links__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __patient facing assessment links__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/patient_facing_assessment_links -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/patient_facing_assessment_links'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/patient_facing_assessment_links';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/patient_facing_assessment_links`

#### Required Scope
`patient_facing_assessment_links.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "url": "https://survey.welkinhealth.com/beta/?token=6db22d8e-de8e-43a8-be5c-19957dd2b2a0&spec_name=pet_wellness",
      "created_at": "2020-05-28T14:19:29.503879+00:00",
      "updated_at": "2020-05-28T14:19:29.503904+00:00",
      "patient_id": "4f0a3adf-8e74-4981-a984-1dc079df577c",
      "expire_time": "2020-06-27T14:19:29.500985+00:00",
      "id": "6db22d8e-de8e-43a8-be5c-19957dd2b2a0"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) on which the assessment response will be placed
spec_name <br /><code><a href='#types' class='optional'>string</a></code> | The ref_name for the assessment as it appears in [Workshop](https://workshop.welkinhealth.com).
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Patients


Patients are the primary data object within Welkin. Almost all other data is attached to a patient.
[Emails](#email-addresses), [assessment responses](#assessment-responses), [care flows](#care-flows), and many more
resources are mapped directly to a specific patient.

There are no restrictions on patient data, so it's possible for duplicates to be created-on purpose or by accident.
Take care to ensure you are not duplicating a patient when creating a new one.

When using the Welkin API it's best to designate one system as the master system, and have the other systems be
followers. In this model, patients are created in only one source, limiting the possibility of duplicate patient
generation.


















english, spanish, vietnamese, tagalog, chinese, arabic, korean, punjabi, russian, other, unknown,
cantonese, hmong, mandarin_chinese, abkhazian, afar, afrikaans, akan, albanian, amharic,
aragonese, armenian, assamese, avaric, avestan, aymara, azerbaijani, bambara, bashkir, basque,
belarusian, bengali, bihari, bislama, bosnian, breton, bulgarian, burmese, catalan, chamorro,
chechen, chewa, chuvash, cornish, corsican, cree, croatian, czech, danish, maldivian, dutch,
dzongkha, esperanto, estonian, ewe, faroese, fijian, finnish, french, fulah, galician, georgian,
german, greek, guarani, gujarati, haitian, hausa, hebrew, herero, hindi, hiri_motu, hungarian,
indonesian, irish, igbo, inupiaq, ido, icelandic, italian, inuktitut, japanese, javanese, greenlandic,
kannada, kanuri, kashmiri, kazakh, central_khmer, kikuyu, kinyarwanda, kyrgyz, komi, kongo, kurdish,
kwanyama, latin, luxembourgish, ganda, limburgish, lingala, lao, lithuanian, luba_katanga, latvian,
manx, macedonian, malagasy, malay, malayalam, maltese, maori, marathi, marshallese, mongolian,
nauru, navajo, north_ndebele, nepali, ndonga, norwegian_bokmal, norwegian_nynorsk, norwegian,
nuosu, south_ndebele, occitan, ojibwa, oromo, oriya, ossetian, pali, persian, polish, pashto,
portuguese, quechua, romansh, rundi, romanian, sanskrit, sardinian, sindhi, northern_sami, samoan,
sango, serbian, gaelic, shona, sinhalese, slovak, slovenian, somali, southern_sotho, sundanese,
swahili, swati, swedish, tamil, telugu, tajik, thai, tigrinya, tibetan, turkmen, tswana, tonga,
turkish, tsonga, tatar, twi, tahitian, uyghur, ukrainian, urdu, uzbek, venda, volapuk, walloon, welsh,
wolof, western_frisian, xhosa, yiddish, yoruba, chuang, zului











### Model

> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "provider_id_number": "7IHnPI80",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "gender": "Female",
  "height": "72",
  "primary_language": "english",
  "smokes": "false",
  "weight": "175",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "is_active": "true",
  "updated_at": "2018-09-12T01:27:32.108773+00:00",
  "created_at": "2018-09-12T01:27:32.109872+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __patients__ record.
phase <br /><code><a href='#types'>enum</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
is_active <br /><code><a href='#types'>boolean</a></code> | `true` or `false` for whether the patient record is active or inactive. Caution: marking a patient inactive will also finish calendar events and dismiss alerts.
primary_worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
coach_id <br /><code><a href='#types'>guid</a></code> | (Deprecated) ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
timezone <br /><code><a href='#types'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#types'>string</a></code> | First name of this patient
last_name <br /><code><a href='#types'>string</a></code> | Last name of this patient
birthday <br /><code><a href='#types'>optional</a> <a href='#types'>date</a></code> | Date of birth of this patient
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
email_addresses <br /><code><a href='#types'>object</a></code> | 
street <br /><code><a href='#types'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#types'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#types'>string</a></code> | City of this patient's address
county <br /><code><a href='#types'>string</a></code> | County in which this patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#types'>optional</a> <a href='#types'>zip_code</a></code> | Zip code of this patient's address in five or nine digit form. `94115` or `94115-4619`
state <br /><code><a href='#types'>optional</a> <a href='#types'>state</a></code> | Two character abbreviation of the state in which this patient resides
country <br /><code><a href='#types'>country</a></code> | Country in which this patient lives
primary_language <br /><code><a href='#types'>optional</a> <a href='#types'>enum</a></code> | This patient's primary language. Available options include ISO 639-1:
gender <br /><code><a href='#types'>string</a></code> | Gender of this patient
height <br /><code><a href='#types'>string</a></code> | The two digit height of this patient in inches.
weight <br /><code><a href='#types'>string</a></code> | The weight of this patient in pounds.
smokes <br /><code><a href='#types'>boolean</a></code> | `true` or `false` for whether this patient smokes.
provider_id_number <br /><code><a href='#types'>string</a></code> | ID of the patient in 3rd party system. Can be any string format.




### Get
Retrieves a single __patient__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/patients/:id`

#### Required Scope
`patients.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "phase": "intake",
    "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
    "provider_id_number": "7IHnPI80",
    "timezone": "US/Pacific",
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female",
    "height": "72",
    "primary_language": "english",
    "smokes": "false",
    "weight": "175",
    "street": "3265 17th St",
    "street_line_two": "#304",
    "city": "San Francisco",
    "county": "San Francisco County",
    "zip_code": "94110",
    "state": "CA",
    "country": "US",
    "is_active": "true",
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __patients__ record.





### Create
Creates a new __patient__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/patients -d '{
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "primary_language": "english",
  "gender": "Female",
  "height": "72",
  "weight": "175",
  "smokes": "false",
  "provider_id_number": "7IHnPI80"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "primary_language": "english",
  "gender": "Female",
  "height": "72",
  "weight": "175",
  "smokes": "false",
  "provider_id_number": "7IHnPI80"
}
url = 'https://api.welkinhealth.com/v1/patients'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/patients';
const data = {
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "primary_language": "english",
  "gender": "Female",
  "height": "72",
  "weight": "175",
  "smokes": "false",
  "provider_id_number": "7IHnPI80"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/patients -d { }`

#### Required Scope
`patients.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "phase": "intake",
    "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
    "provider_id_number": "7IHnPI80",
    "timezone": "US/Pacific",
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female",
    "height": "72",
    "primary_language": "english",
    "smokes": "false",
    "weight": "175",
    "street": "3265 17th St",
    "street_line_two": "#304",
    "city": "San Francisco",
    "county": "San Francisco County",
    "zip_code": "94110",
    "state": "CA",
    "country": "US",
    "is_active": "true",
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
phase <br /><code><a href='#types' class='required'>enum</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
primary_worker_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
coach_id <br /><code><a href='#types' class='optional'>guid</a></code> | (Deprecated) ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
timezone <br /><code><a href='#types' class='required'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#types' class='required'>string</a></code> | First name of this patient
last_name <br /><code><a href='#types' class='required'>string</a></code> | Last name of this patient
birthday <br /><code><a href='#types' class='optional'>date</a></code> | Date of birth of this patient
email_addresses <br /><code><a href='#types' class='optional'>list(object)</a></code> | 
street <br /><code><a href='#types' class='optional'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#types' class='optional'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#types' class='optional'>string</a></code> | City of this patient's address
county <br /><code><a href='#types' class='optional'>string</a></code> | County in which this patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#types' class='optional'>zip_code</a></code> | Zip code of this patient's address in five or nine digit form. `94115` or `94115-4619`
state <br /><code><a href='#types' class='optional'>state</a></code> | Two character abbreviation of the state in which this patient resides
country <br /><code><a href='#types' class='optional'>country</a></code> | Country in which this patient lives
primary_language <br /><code><a href='#types' class='optional'>enum</a></code> | This patient's primary language. Available options include ISO 639-1:
gender <br /><code><a href='#types' class='optional'>string</a></code> | Gender of this patient
height <br /><code><a href='#types' class='optional'>string</a></code> | The two digit height of this patient in inches.
weight <br /><code><a href='#types' class='optional'>string</a></code> | The weight of this patient in pounds.
smokes <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` or `false` for whether this patient smokes.
provider_id_number <br /><code><a href='#types' class='optional'>string</a></code> | ID of the patient in 3rd party system. Can be any string format.
email <br /><code><a href='#types' class='optional'>email</a></code> | (Deprecated) Email addresses should be created via the [email address](#email-addresses) endpoint.
phone <br /><code><a href='#types' class='optional'>e164_phone</a></code> | (Deprecated) Phone numbers should be created via the [phone number](#phone-numbers) endpoint.





### Update
Updates an existing __patient__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c -d '{
  "phase": "intake",
  "is_active": "true",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "primary_language": "english",
  "gender": "Female",
  "height": "72",
  "weight": "175",
  "smokes": "false",
  "provider_id_number": "7IHnPI80"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "phase": "intake",
  "is_active": "true",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "primary_language": "english",
  "gender": "Female",
  "height": "72",
  "weight": "175",
  "smokes": "false",
  "provider_id_number": "7IHnPI80"
}
url = 'https://api.welkinhealth.com/v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c';
const data = {
  "phase": "intake",
  "is_active": "true",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "US",
  "primary_language": "english",
  "gender": "Female",
  "height": "72",
  "weight": "175",
  "smokes": "false",
  "provider_id_number": "7IHnPI80"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/patients/:id -d { }`

#### Required Scope
`patients.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "phase": "intake",
    "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
    "provider_id_number": "7IHnPI80",
    "timezone": "US/Pacific",
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female",
    "height": "72",
    "primary_language": "english",
    "smokes": "false",
    "weight": "175",
    "street": "3265 17th St",
    "street_line_two": "#304",
    "city": "San Francisco",
    "county": "San Francisco County",
    "zip_code": "94110",
    "state": "CA",
    "country": "US",
    "is_active": "true",
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __patients__ record.
phase <br /><code><a href='#types' class='optional'>enum</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
is_active <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` or `false` for whether the patient record is active or inactive. Caution: marking a patient inactive will also finish calendar events and dismiss alerts.
primary_worker_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
coach_id <br /><code><a href='#types' class='optional'>guid</a></code> | (Deprecated) ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
timezone <br /><code><a href='#types' class='optional'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#types' class='optional'>string</a></code> | First name of this patient
last_name <br /><code><a href='#types' class='optional'>string</a></code> | Last name of this patient
birthday <br /><code><a href='#types' class='optional'>date</a></code> | Date of birth of this patient
street <br /><code><a href='#types' class='optional'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#types' class='optional'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#types' class='optional'>string</a></code> | City of this patient's address
county <br /><code><a href='#types' class='optional'>string</a></code> | County in which this patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#types' class='optional'>zip_code</a></code> | Zip code of this patient's address in five or nine digit form. `94115` or `94115-4619`
state <br /><code><a href='#types' class='optional'>state</a></code> | Two character abbreviation of the state in which this patient resides
country <br /><code><a href='#types' class='optional'>country</a></code> | Country in which this patient lives
primary_language <br /><code><a href='#types' class='optional'>enum</a></code> | This patient's primary language. Available options include ISO 639-1:
gender <br /><code><a href='#types' class='optional'>string</a></code> | Gender of this patient
height <br /><code><a href='#types' class='optional'>string</a></code> | The two digit height of this patient in inches.
weight <br /><code><a href='#types' class='optional'>string</a></code> | The weight of this patient in pounds.
smokes <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` or `false` for whether this patient smokes.
provider_id_number <br /><code><a href='#types' class='optional'>string</a></code> | ID of the patient in 3rd party system. Can be any string format.






### Find
Retrieves __patients__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __patients__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/patients -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/patients'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/patients';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/patients`

#### Required Scope
`patients.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
      "phase": "intake",
      "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
      "provider_id_number": "7IHnPI80",
      "timezone": "US/Pacific",
      "first_name": "Grace",
      "last_name": "Hopper",
      "birthday": "1906-12-09",
      "gender": "Female",
      "height": "72",
      "primary_language": "english",
      "smokes": "false",
      "weight": "175",
      "street": "3265 17th St",
      "street_line_two": "#304",
      "city": "San Francisco",
      "county": "San Francisco County",
      "zip_code": "94110",
      "state": "CA",
      "country": "US",
      "is_active": "true",
      "updated_at": "2018-09-12T01:27:32.108773+00:00",
      "created_at": "2018-09-12T01:27:32.109872+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Phone Numbers


Manage the available phone based contact methods for a [patient](#patients). Phone based contact methods are
call and sms.

Each patient phone number has its own consents and opt in status. When setting the consent flags on a phone number
make sure that you have a record of how and when consent was received from the patient.

<aside>There are no uniqueness constraints on phone numbers but if two <a href="#patients">patients</a> share the same
phone number calls and sms messages will be listed as unassigned in the Welkin Portal rather than
associated directly with the <a href="#patients">patient's</a> profile.</aside>














### Model

> Example Response

```json
{
  "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false,
  "updated_at": "2018-09-12T01:27:32.123172+00:00",
  "created_at": "2018-09-12T01:27:32.123301+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __phone numbers__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#types'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#types'>e164_phone</a></code> | The phone number to be associated with the patient. Must be in international, E.164 format. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#types'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#types'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#types'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#types'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __phone number__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/phone_numbers/:id`

#### Required Scope
`phone_numbers.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
    "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
    "phone_number": "+15555555555",
    "phone_number_type": "landline",
    "friendly_name": "main number",
    "verified": false,
    "opted_in_to_sms": true,
    "opted_in_to_call_recording": false,
    "opted_in_to_voicemail": false,
    "opted_in_to_phone": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.123172+00:00",
    "created_at": "2018-09-12T01:27:32.123301+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __phone numbers__ record.





### Create
Creates a new __phone number__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/phone_numbers -d '{
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}
url = 'https://api.welkinhealth.com/v1/phone_numbers'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/phone_numbers';
const data = {
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/phone_numbers -d { }`

#### Required Scope
`phone_numbers.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
    "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
    "phone_number": "+15555555555",
    "phone_number_type": "landline",
    "friendly_name": "main number",
    "verified": false,
    "opted_in_to_sms": true,
    "opted_in_to_call_recording": false,
    "opted_in_to_voicemail": false,
    "opted_in_to_phone": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.123172+00:00",
    "created_at": "2018-09-12T01:27:32.123301+00:00"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#types' class='required'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#types' class='required'>e164_phone</a></code> | The phone number to be associated with the patient. Must be in international, E.164 format. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#types' class='required'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#types' class='optional'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`





### Update
Updates an existing __phone number__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -d '{
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}
url = 'https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f';
const data = {
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/phone_numbers/:id -d { }`

#### Required Scope
`phone_numbers.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
    "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
    "phone_number": "+15555555555",
    "phone_number_type": "landline",
    "friendly_name": "main number",
    "verified": false,
    "opted_in_to_sms": true,
    "opted_in_to_call_recording": false,
    "opted_in_to_voicemail": false,
    "opted_in_to_phone": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.123172+00:00",
    "created_at": "2018-09-12T01:27:32.123301+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __phone numbers__ record.
phone_number <br /><code><a href='#types' class='optional'>e164_phone</a></code> | Not allowed. To update a patient's phone number you must delete the phone number and create a new phone number. This will also remove the existing [conversation](#conversations) associated with this phone number.
phone_number_type <br /><code><a href='#types' class='optional'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#types' class='optional'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`





### Delete
Deletes a single __phone number__.


#### Invocation

> Example Request

```shell
curl -XDELETE https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f'

resp = requests.delete(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f';

const response = await axios({method: 'delete', url: url, headers: headers});

```

`DELETE /v1/phone_numbers/:id`

#### Required Scope
`phone_numbers.write` or `all`

> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __phone numbers__ record.





### Find
Retrieves __phone numbers__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __phone numbers__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/phone_numbers -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/phone_numbers'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/phone_numbers';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/phone_numbers`

#### Required Scope
`phone_numbers.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
      "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
      "phone_number": "+15555555555",
      "phone_number_type": "landline",
      "friendly_name": "main number",
      "verified": false,
      "opted_in_to_sms": true,
      "opted_in_to_call_recording": false,
      "opted_in_to_voicemail": false,
      "opted_in_to_phone": true,
      "automatic_recipient": false,
      "updated_at": "2018-09-12T01:27:32.123172+00:00",
      "created_at": "2018-09-12T01:27:32.123301+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#types' class='optional'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response





### Find By Post
Retrieves __phone numbers__, filtered by the supplied parameters, sent in the `POST body`. Only the parameters listed below are supported in Find By Post for the __phone numbers__ resource.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/phone_numbers/find -d '{
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phone_number": "+15555555555"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/phone_numbers/find'
data = {
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phone_number": "+15555555555"
}

resp = requests.post(url,headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/phone_numbers/find';
const data = {
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phone_number": "+15555555555"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/phone_numbers/find`

#### Required Scope
`phone_numbers.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
      "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
      "phone_number": "+15555555555",
      "phone_number_type": "landline",
      "friendly_name": "main number",
      "verified": false,
      "opted_in_to_sms": true,
      "opted_in_to_call_recording": false,
      "opted_in_to_voicemail": false,
      "opted_in_to_phone": true,
      "automatic_recipient": false,
      "updated_at": "2018-09-12T01:27:32.123172+00:00",
      "created_at": "2018-09-12T01:27:32.123301+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#types' class='optional'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#types' class='optional'>string</a></code> | The phone number to be associated with the patient. Must be in international, E.164 format. Note, this can be a phone number of the patient, a care giver, or other associated entity.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response






## Profile Phone Numbers


Manage the available phone based contact methods for a [profile](#profiles). Phone based contact methods are
call and sms.

Each profile phone number has its own consents and opt in status. When setting the consent flags on a phone number
make sure that you have a record of how and when consent was received from the profile.















### Model

> Example Response

```json
{
  "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
  "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "archived": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false,
  "updated_at": "2018-09-12T01:27:32.123172+00:00",
  "created_at": "2018-09-12T01:27:32.123301+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __profile phone numbers__ record.
profile_id <br /><code><a href='#types'>guid</a></code> | The identifier of the [profile](#profiles) to which this phone number is associated.
phone_number <br /><code><a href='#types'>e164_phone</a></code> | The phone number to be associated with the profile. Must be in international, E.164 format.
phone_number_type <br /><code><a href='#types'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#types'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between profile phone numbers
verified <br /><code><a href='#types'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [profile](#profiles) by calling this number and confirming the [profile's](#profiles) identity details. Default `false`
archived <br /><code><a href='#types'>boolean</a></code> | `true` if the phone number has been removed from the Profile.
opted_in_to_sms <br /><code><a href='#types'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#types'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#types'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#types'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#types'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __profile phone number__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/profile_phone_numbers/:id`

#### Required Scope
`profile_phone_numbers.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
    "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
    "phone_number": "+15555555555",
    "phone_number_type": "landline",
    "friendly_name": "main number",
    "verified": false,
    "archived": false,
    "opted_in_to_sms": true,
    "opted_in_to_call_recording": false,
    "opted_in_to_voicemail": false,
    "opted_in_to_phone": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.123172+00:00",
    "created_at": "2018-09-12T01:27:32.123301+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __profile phone numbers__ record.





### Create
Creates a new __profile phone number__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/profile_phone_numbers -d '{
  "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}
url = 'https://api.welkinhealth.com/v1/profile_phone_numbers'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profile_phone_numbers';
const data = {
  "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/profile_phone_numbers -d { }`

#### Required Scope
`profile_phone_numbers.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
    "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
    "phone_number": "+15555555555",
    "phone_number_type": "landline",
    "friendly_name": "main number",
    "verified": false,
    "archived": false,
    "opted_in_to_sms": true,
    "opted_in_to_call_recording": false,
    "opted_in_to_voicemail": false,
    "opted_in_to_phone": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.123172+00:00",
    "created_at": "2018-09-12T01:27:32.123301+00:00"
  }
}
```

#### Params


param | description
- | -
profile_id <br /><code><a href='#types' class='required'>guid</a></code> | The identifier of the [profile](#profiles) to which this phone number is associated.
phone_number <br /><code><a href='#types' class='required'>e164_phone</a></code> | The phone number to be associated with the profile. Must be in international, E.164 format.
phone_number_type <br /><code><a href='#types' class='required'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#types' class='optional'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between profile phone numbers
verified <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [profile](#profiles) by calling this number and confirming the [profile's](#profiles) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`





### Update
Updates an existing __profile phone number__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -d '{
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}
url = 'https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f';
const data = {
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/profile_phone_numbers/:id -d { }`

#### Required Scope
`profile_phone_numbers.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
    "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
    "phone_number": "+15555555555",
    "phone_number_type": "landline",
    "friendly_name": "main number",
    "verified": false,
    "archived": false,
    "opted_in_to_sms": true,
    "opted_in_to_call_recording": false,
    "opted_in_to_voicemail": false,
    "opted_in_to_phone": true,
    "automatic_recipient": false,
    "updated_at": "2018-09-12T01:27:32.123172+00:00",
    "created_at": "2018-09-12T01:27:32.123301+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __profile phone numbers__ record.
phone_number <br /><code><a href='#types' class='optional'>e164_phone</a></code> | The phone number to be associated with the profile. Must be in international, E.164 format.
phone_number_type <br /><code><a href='#types' class='optional'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#types' class='optional'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between profile phone numbers
verified <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [profile](#profiles) by calling this number and confirming the [profile's](#profiles) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` only if the [profile](#profiles) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`





### Delete
Deletes a single __profile phone number__.


#### Invocation

> Example Request

```shell
curl -XDELETE https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f'

resp = requests.delete(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profile_phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f';

const response = await axios({method: 'delete', url: url, headers: headers});

```

`DELETE /v1/profile_phone_numbers/:id`

#### Required Scope
`profile_phone_numbers.write` or `all`

> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __profile phone numbers__ record.





### Find
Retrieves __profile phone numbers__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __profile phone numbers__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/profile_phone_numbers -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/profile_phone_numbers'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profile_phone_numbers';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/profile_phone_numbers`

#### Required Scope
`profile_phone_numbers.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f",
      "profile_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
      "phone_number": "+15555555555",
      "phone_number_type": "landline",
      "friendly_name": "main number",
      "verified": false,
      "archived": false,
      "opted_in_to_sms": true,
      "opted_in_to_call_recording": false,
      "opted_in_to_voicemail": false,
      "opted_in_to_phone": true,
      "automatic_recipient": false,
      "updated_at": "2018-09-12T01:27:32.123172+00:00",
      "created_at": "2018-09-12T01:27:32.123301+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
profile_id <br /><code><a href='#types' class='optional'>guid</a></code> | The identifier of the [profile](#profiles) to which this phone number is associated.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Profiles


Profiles represent non-patient entities in Welkin. These could be family members, loved ones, care givers, doctors,
clinic locations, regions, patient cohorts, and many more. [Relationships](#relationship-records) link Profiles to
[Patients](#patients), [Workers](#workers), and other Profiles.

In [Workshop](https://workshop.welkinhealth.com) you can define the set of fields on each Profile type. You can also
define the [Relationships](#relationship-records) which link them.






### Model

> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "profile_type_name": "test_profile",
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  },
  "updated_at": "2018-09-12T01:27:32.108773+00:00",
  "created_at": "2018-09-12T01:27:32.109872+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __profiles__ record.
profile_type_name <br /><code><a href='#types'>string</a></code> | Name of the Profile spec as defined in [Workshop](https://workshop.welkinhealth.com)
body <br /><code><a href='#types'>json</a></code> | A JSON object representing the fields that are required for that Profile type
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __profile__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/profiles/45ceeba9-4944-43d1-b34d-0c36846acd4c -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/profiles/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/profiles/45ceeba9-4944-43d1-b34d-0c36846acd4c';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/profiles/:id`

#### Required Scope
`profiles.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "profile_type_name": "test_profile",
    "body": {
      "first_name": "Grace",
      "last_name": "Hopper",
      "birthday": "1906-12-09",
      "gender": "Female"
    },
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __profiles__ record.





### Create
Creates a new __profile__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/profiles -d '{
  "profile_type_name": "test_profile",
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  }
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "profile_type_name": "test_profile",
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  }
}
url = 'https://api.welkinhealth.com/v1/profiles'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profiles';
const data = {
  "profile_type_name": "test_profile",
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  }
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/profiles -d { }`

#### Required Scope
`profiles.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "profile_type_name": "test_profile",
    "body": {
      "first_name": "Grace",
      "last_name": "Hopper",
      "birthday": "1906-12-09",
      "gender": "Female"
    },
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
profile_type_name <br /><code><a href='#types' class='required'>string</a></code> | Name of the Profile spec as defined in [Workshop](https://workshop.welkinhealth.com)
body <br /><code><a href='#types' class='required'>json</a></code> | A JSON object representing the fields that are required for that Profile type





### Update
Updates an existing __profile__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/profiles/45ceeba9-4944-43d1-b34d-0c36846acd4c -d '{
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  }
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  }
}
url = 'https://api.welkinhealth.com/v1/profiles/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profiles/45ceeba9-4944-43d1-b34d-0c36846acd4c';
const data = {
  "body": {
    "first_name": "Grace",
    "last_name": "Hopper",
    "birthday": "1906-12-09",
    "gender": "Female"
  }
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/profiles/:id -d { }`

#### Required Scope
`profiles.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "profile_type_name": "test_profile",
    "body": {
      "first_name": "Grace",
      "last_name": "Hopper",
      "birthday": "1906-12-09",
      "gender": "Female"
    },
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __profiles__ record.
body <br /><code><a href='#types' class='required'>json</a></code> | A JSON object representing the fields that are required for that Profile type






### Find
Retrieves __profiles__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __profiles__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/profiles -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/profiles'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/profiles';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/profiles`

#### Required Scope
`profiles.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
      "profile_type_name": "test_profile",
      "body": {
        "first_name": "Grace",
        "last_name": "Hopper",
        "birthday": "1906-12-09",
        "gender": "Female"
      },
      "updated_at": "2018-09-12T01:27:32.108773+00:00",
      "created_at": "2018-09-12T01:27:32.109872+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
profile_type_name <br /><code><a href='#types' class='optional'>string</a></code> | Name of the Profile spec as defined in [Workshop](https://workshop.welkinhealth.com)
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Relationship Records


Relationships link [patients](#patients), [worker](#workers), and profiles together allowing [workers](#workers)
to visualize the care network of a patient. Relationships also allow [workers](#workers)
to quickly navigate to view details about the people and places in a [patient's](#patients) care network.











### Model

> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "relationship_type_id": "family_member",
  "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
  "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
  "start_date": "2018-02-02",
  "end_date": "2018-12-17",
  "archived_at": null,
  "updated_at": "2018-09-12T01:27:32.108773+00:00",
  "created_at": "2018-09-12T01:27:32.109872+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __relationship records__ record.
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
start_date <br /><code><a href='#types'>date</a></code> | The date on which the relationship began between entity 1 and entity 2. This date must be in the past relative to current time.
end_date <br /><code><a href='#types'>date</a></code> | The date on which the relationship ended between entity 1 and entity 2. This date must be in the past relative to current time and must be after `start_date`.
archived_at <br /><code><a href='#types'>isodatetime</a></code> | The date when the relationship was archived (hidden from [workers](#workers) in Welkin).
entity_1_id <br /><code><a href='#types'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 1 as defined in [Workshop](https://workshop.welkinhealth.com).
entity_2_id <br /><code><a href='#types'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 2 as defined in [Workshop](https://workshop.welkinhealth.com).
relationship_type_id <br /><code><a href='#types'>string</a></code> | The ID of the relationship type as defined in [Workshop](https://workshop.welkinhealth.com). This relationship type defines the roles that entity 1 and entity 2 fulfill in the relationship.




### Get
Retrieves a single __relationship record__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/relationship_records/:id`

#### Required Scope
`relationship_records.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "relationship_type_id": "family_member",
    "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
    "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
    "start_date": "2018-02-02",
    "end_date": "2018-12-17",
    "archived_at": null,
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __relationship records__ record.





### Create
Creates a new __relationship record__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/relationship_records -d '{
  "start_date": "2018-02-02",
  "end_date": "2018-12-17",
  "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
  "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
  "relationship_type_id": "family_member"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "start_date": "2018-02-02",
  "end_date": "2018-12-17",
  "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
  "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
  "relationship_type_id": "family_member"
}
url = 'https://api.welkinhealth.com/v1/relationship_records'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/relationship_records';
const data = {
  "start_date": "2018-02-02",
  "end_date": "2018-12-17",
  "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
  "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
  "relationship_type_id": "family_member"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/relationship_records -d { }`

#### Required Scope
`relationship_records.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "relationship_type_id": "family_member",
    "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
    "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
    "start_date": "2018-02-02",
    "end_date": "2018-12-17",
    "archived_at": null,
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
start_date <br /><code><a href='#types' class='required'>date</a></code> | The date on which the relationship began between entity 1 and entity 2. This date must be in the past relative to current time.
end_date <br /><code><a href='#types' class='optional'>date</a></code> | The date on which the relationship ended between entity 1 and entity 2. This date must be in the past relative to current time and must be after `start_date`.
entity_1_id <br /><code><a href='#types' class='required'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 1 as defined in [Workshop](https://workshop.welkinhealth.com).
entity_2_id <br /><code><a href='#types' class='required'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 2 as defined in [Workshop](https://workshop.welkinhealth.com).
relationship_type_id <br /><code><a href='#types' class='required'>string</a></code> | The ID of the relationship type as defined in [Workshop](https://workshop.welkinhealth.com). This relationship type defines the roles that entity 1 and entity 2 fulfill in the relationship.





### Update
Updates an existing __relationship record__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c -d '{
  "start_date": "2018-02-02",
  "end_date": "2018-12-17"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "start_date": "2018-02-02",
  "end_date": "2018-12-17"
}
url = 'https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c';
const data = {
  "start_date": "2018-02-02",
  "end_date": "2018-12-17"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/relationship_records/:id -d { }`

#### Required Scope
`relationship_records.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "relationship_type_id": "family_member",
    "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
    "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
    "start_date": "2018-02-02",
    "end_date": "2018-12-17",
    "archived_at": null,
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __relationship records__ record.
start_date <br /><code><a href='#types' class='optional'>date</a></code> | The date on which the relationship began between entity 1 and entity 2. This date must be in the past relative to current time.
end_date <br /><code><a href='#types' class='optional'>date</a></code> | The date on which the relationship ended between entity 1 and entity 2. This date must be in the past relative to current time and must be after `start_date`.





### Delete


Archive a specific relationship. Archived relationships no longer show up in the coach portal but do still exist in
the data.




#### Invocation

> Example Request

```shell
curl -XDELETE https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c'

resp = requests.delete(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c';

const response = await axios({method: 'delete', url: url, headers: headers});

```

`DELETE /v1/relationship_records/:id`

#### Required Scope
`relationship_records.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
    "relationship_type_id": "family_member",
    "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
    "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
    "start_date": "2018-02-02",
    "end_date": "2018-12-17",
    "archived_at": null,
    "updated_at": "2018-09-12T01:27:32.108773+00:00",
    "created_at": "2018-09-12T01:27:32.109872+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __relationship records__ record.





### Find
Retrieves __relationship records__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __relationship records__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/relationship_records -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/relationship_records'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/relationship_records';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/relationship_records`

#### Required Scope
`relationship_records.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
      "relationship_type_id": "family_member",
      "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
      "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
      "start_date": "2018-02-02",
      "end_date": "2018-12-17",
      "archived_at": null,
      "updated_at": "2018-09-12T01:27:32.108773+00:00",
      "created_at": "2018-09-12T01:27:32.109872+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
relationship_type_id <br /><code><a href='#types' class='optional'>string</a></code> | The ID of the relationship type as defined in [Workshop](https://workshop.welkinhealth.com). This relationship type defines the roles that entity 1 and entity 2 fulfill in the relationship.
entity_id <br /><code><a href='#types' class='optional'>guid</a></code> | The ID of an entity to find relationships for. This entity can fulfill entity 1 or entity 2 in the relationship.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Sms Messages


SMS Messages can be viewed and created from the [conversation](#conversations) view of the [Patient](#patients)
profile.












### Model

> Example Response

```json
{
  "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "automatically_sent": false,
  "sent_at": "2018-09-12T01:27:32.045046+00:00",
  "updated_at": "2018-09-12T01:27:32.045196+00:00",
  "created_at": "2018-09-12T01:27:32.045336+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __sms messages__ record.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) who sent or received this message. Must match the [patient](#patients) participant of the [conversation](#conversations).
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#types'>guid</a></code> | ID of the [conversation](#conversations) that contains this message
direction <br /><code><a href='#types'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#types'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#types'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
sent_at <br /><code><a href='#types'>isodatetime</a></code> | Date and time when the message was sent
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __sms message__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/sms_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/sms_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/sms_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/sms_messages/:id`

#### Required Scope
`sms_messages.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
    "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
    "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
    "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
    "direction": "inbound",
    "contents": "Hi Developer, Welcome to Welkin Health.",
    "automatically_sent": false,
    "sent_at": "2018-09-12T01:27:32.045046+00:00",
    "updated_at": "2018-09-12T01:27:32.045196+00:00",
    "created_at": "2018-09-12T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __sms messages__ record.





### Create


Create a new message which will be visible in the [conversation](#conversations) view of the [Patient](#patients)
profile.

<aside>Creating an SMS Message will send that message to the <a href="#patients">patient</a> only if the
<code>welkin_send</code> parameter is <code>true</code>. Creating the message resource via this api without setting <code>welkin_send</code> to
<code>true</code> only records that the message was sent to the <a href="#patients">patient</a>.</aside>




#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/sms_messages -d '{
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "automatically_sent": false,
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "automatically_sent": false,
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}
url = 'https://api.welkinhealth.com/v1/sms_messages'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/sms_messages';
const data = {
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "automatically_sent": false,
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/sms_messages -d { }`

#### Required Scope
`sms_messages.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
    "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
    "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
    "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
    "direction": "inbound",
    "contents": "Hi Developer, Welcome to Welkin Health.",
    "automatically_sent": false,
    "sent_at": "2018-09-12T01:27:32.045046+00:00",
    "updated_at": "2018-09-12T01:27:32.045196+00:00",
    "created_at": "2018-09-12T01:27:32.045336+00:00"
  }
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) who sent or received this message. Must match the [patient](#patients) participant of the [conversation](#conversations).
worker_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [conversation](#conversations) that contains this message
direction <br /><code><a href='#types' class='required'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#types' class='required'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#types' class='required'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
sent_at <br /><code><a href='#types' class='optional'>isodatetime</a></code> | Date and time when the message was sent
welkin_send <br /><code><a href='#types' class='required'>boolean</a></code> | Indicates if Welkin should send the message for outbound SMS messages







### Find
Retrieves __sms messages__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __sms messages__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/sms_messages -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/sms_messages'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/sms_messages';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/sms_messages`

#### Required Scope
`sms_messages.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26",
      "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
      "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
      "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
      "direction": "inbound",
      "contents": "Hi Developer, Welcome to Welkin Health.",
      "automatically_sent": false,
      "sent_at": "2018-09-12T01:27:32.045046+00:00",
      "updated_at": "2018-09-12T01:27:32.045196+00:00",
      "created_at": "2018-09-12T01:27:32.045336+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [patient](#patients) who sent or received this message. Must match the [patient](#patients) participant of the [conversation](#conversations).
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Unavailable Times


Unavailable Times represent time when events can not be scheduled for the [worker](#workers).
These blocks are either single blocks are repeating blocks of time. Unavailable times
are linked to a [worker](#workers)'s [Calendar](#calendars).











### Model

> Example Response

```json
{
  "id": "7bbe0d77-9deb-4e81-8aff-6fb5d112e85f",
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly",
  "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4",
  "updated_at": "2019-03-01T12:10:11.10+00:00",
  "created_at": "2019-03-01T12:10:11.10+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __unavailable times__ record.
date <br /><code><a href='#types'>date</a></code> | The initial date of this unavailability, in the format `YYYY-MM-DD` in the worker's local timezone.
all_day <br /><code><a href='#types'>boolean</a></code> | `true` if this unavailability will last the whole day
start_time <br /><code><a href='#types'>string</a></code> | The start time of a worker's unavailability in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#types'>string</a></code> | The ending time of a worker's unavailability (inclusive) in their local timezone. Uses 24-hour time notation
recurrence <br /><code><a href='#types'>enum</a></code> | The frequency at which this block of unavailable time repeats. If specified, this unavailable time block will repeat at this interval until the unavailable time block is deleted. Possible values `none`, `daily`, or `weekly`
calendar_id <br /><code><a href='#types'>guid</a></code> | The ID of the calendar this day belongs to
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on the associated calendar)
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __unavailable time__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/unavailable_times/:id`

#### Required Scope
`unavailable_times.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "7bbe0d77-9deb-4e81-8aff-6fb5d112e85f",
    "date": "2019-01-02",
    "all_day": false,
    "start_time": "12:00:00",
    "end_time": "14:30:00",
    "recurrence": "weekly",
    "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4",
    "updated_at": "2019-03-01T12:10:11.10+00:00",
    "created_at": "2019-03-01T12:10:11.10+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __unavailable times__ record.





### Create
Creates a new __unavailable time__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/unavailable_times -d '{
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly",
  "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly",
  "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4"
}
url = 'https://api.welkinhealth.com/v1/unavailable_times'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/unavailable_times';
const data = {
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly",
  "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/unavailable_times -d { }`

#### Required Scope
`unavailable_times.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "7bbe0d77-9deb-4e81-8aff-6fb5d112e85f",
    "date": "2019-01-02",
    "all_day": false,
    "start_time": "12:00:00",
    "end_time": "14:30:00",
    "recurrence": "weekly",
    "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4",
    "updated_at": "2019-03-01T12:10:11.10+00:00",
    "created_at": "2019-03-01T12:10:11.10+00:00"
  }
}
```

#### Params


param | description
- | -
date <br /><code><a href='#types' class='required'>date</a></code> | The initial date of this unavailability, in the format `YYYY-MM-DD` in the worker's local timezone.
all_day <br /><code><a href='#types' class='required'>boolean</a></code> | `true` if this unavailability will last the whole day
start_time <br /><code><a href='#types' class='optional'>string</a></code> | The start time of a worker's unavailability in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#types' class='optional'>string</a></code> | The ending time of a worker's unavailability (inclusive) in their local timezone. Uses 24-hour time notation
recurrence <br /><code><a href='#types' class='required'>enum</a></code> | The frequency at which this block of unavailable time repeats. If specified, this unavailable time block will repeat at this interval until the unavailable time block is deleted. Possible values `none`, `daily`, or `weekly`
calendar_id <br /><code><a href='#types' class='required'>guid</a></code> | The ID of the calendar this day belongs to





### Update
Updates an existing __unavailable time__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f -d '{
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly"
}
url = 'https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f';
const data = {
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/unavailable_times/:id -d { }`

#### Required Scope
`unavailable_times.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "7bbe0d77-9deb-4e81-8aff-6fb5d112e85f",
    "date": "2019-01-02",
    "all_day": false,
    "start_time": "12:00:00",
    "end_time": "14:30:00",
    "recurrence": "weekly",
    "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4",
    "updated_at": "2019-03-01T12:10:11.10+00:00",
    "created_at": "2019-03-01T12:10:11.10+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __unavailable times__ record.
date <br /><code><a href='#types' class='optional'>date</a></code> | The initial date of this unavailability, in the format `YYYY-MM-DD` in the worker's local timezone.
all_day <br /><code><a href='#types' class='optional'>boolean</a></code> | `true` if this unavailability will last the whole day
start_time <br /><code><a href='#types' class='optional'>string</a></code> | The start time of a worker's unavailability in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#types' class='optional'>string</a></code> | The ending time of a worker's unavailability (inclusive) in their local timezone. Uses 24-hour time notation
recurrence <br /><code><a href='#types' class='optional'>enum</a></code> | The frequency at which this block of unavailable time repeats. If specified, this unavailable time block will repeat at this interval until the unavailable time block is deleted. Possible values `none`, `daily`, or `weekly`





### Delete
Deletes a single __unavailable time__.


#### Invocation

> Example Request

```shell
curl -XDELETE https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f'

resp = requests.delete(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f';

const response = await axios({method: 'delete', url: url, headers: headers});

```

`DELETE /v1/unavailable_times/:id`

#### Required Scope
`unavailable_times.write` or `all`

> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __unavailable times__ record.





### Find
Retrieves __unavailable times__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __unavailable times__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/unavailable_times -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/unavailable_times'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/unavailable_times';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/unavailable_times`

#### Required Scope
`unavailable_times.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "7bbe0d77-9deb-4e81-8aff-6fb5d112e85f",
      "date": "2019-01-02",
      "all_day": false,
      "start_time": "12:00:00",
      "end_time": "14:30:00",
      "recurrence": "weekly",
      "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4",
      "updated_at": "2019-03-01T12:10:11.10+00:00",
      "created_at": "2019-03-01T12:10:11.10+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Visits

Visits record an in-person meeting between [workers](#workers)
and [patients](#patients).












### Model

> Example Response

```json
{
  "id": "2238a503-7ac6-4b4a-b43f-ff8c9d931ae9",
  "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
  "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
  "assessment_response_id": null,
  "start_time": "2019-09-28T21:45:11.093557+00:00",
  "end_time": "2019-09-28T21:45:11.093557+00:00",
  "updated_at": "2019-09-27T20:45:12.176691+00:00",
  "created_at": "2019-09-27T20:45:12.176691+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __visits__ record.
worker_id <br /><code><a href='#types'>guid</a></code> | ID of the [worker](#workers) participant in the visit.  Only one worker can be part of a visit.
patient_id <br /><code><a href='#types'>guid</a></code> | ID of the [patient](#patients) participant in the visit.  Only one patient can be part of a visit.
calendar_event_id <br /><code><a href='#types'>guid</a></code> | ID of the [calendar event](#calendar-events) that resulted in this visit, if any.
assessment_response_id <br /><code><a href='#types'>guid</a></code> | ID of an [assessment response](#assessment-responses) for this visit, if any.
disposition <br /><code><a href='#types'>enum</a></code> | (Deprecated) This field will always return None.
start_time <br /><code><a href='#types'>isodatetime</a></code> | Datetime of the starting time of the visit
end_time <br /><code><a href='#types'>isodatetime</a></code> | Datetime of the ending time of the visit
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated




### Get
Retrieves a single __visit__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/visits/2238a503-7ac6-4b4a-b43f-ff8c9d931ae9 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/visits/2238a503-7ac6-4b4a-b43f-ff8c9d931ae9'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/visits/2238a503-7ac6-4b4a-b43f-ff8c9d931ae9';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/visits/:id`

#### Required Scope
`visits.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "2238a503-7ac6-4b4a-b43f-ff8c9d931ae9",
    "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
    "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
    "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
    "assessment_response_id": null,
    "start_time": "2019-09-28T21:45:11.093557+00:00",
    "end_time": "2019-09-28T21:45:11.093557+00:00",
    "updated_at": "2019-09-27T20:45:12.176691+00:00",
    "created_at": "2019-09-27T20:45:12.176691+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __visits__ record.





### Create
Creates a new __visit__.


#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/visits -d '{
  "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
  "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
  "start_time": "2019-09-28T21:45:11.093557+00:00",
  "end_time": "2019-09-28T21:45:11.093557+00:00"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
  "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
  "start_time": "2019-09-28T21:45:11.093557+00:00",
  "end_time": "2019-09-28T21:45:11.093557+00:00"
}
url = 'https://api.welkinhealth.com/v1/visits'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/visits';
const data = {
  "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
  "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
  "start_time": "2019-09-28T21:45:11.093557+00:00",
  "end_time": "2019-09-28T21:45:11.093557+00:00"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/visits -d { }`

#### Required Scope
`visits.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "2238a503-7ac6-4b4a-b43f-ff8c9d931ae9",
    "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
    "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
    "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
    "assessment_response_id": null,
    "start_time": "2019-09-28T21:45:11.093557+00:00",
    "end_time": "2019-09-28T21:45:11.093557+00:00",
    "updated_at": "2019-09-27T20:45:12.176691+00:00",
    "created_at": "2019-09-27T20:45:12.176691+00:00"
  }
}
```

#### Params


param | description
- | -
worker_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [worker](#workers) participant in the visit.  Only one worker can be part of a visit.
patient_id <br /><code><a href='#types' class='required'>guid</a></code> | ID of the [patient](#patients) participant in the visit.  Only one patient can be part of a visit.
calendar_event_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [calendar event](#calendar-events) that resulted in this visit, if any.
assessment_response_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of an [assessment response](#assessment-responses) for this visit, if any.
start_time <br /><code><a href='#types' class='required'>isodatetime</a></code> | Datetime of the starting time of the visit
end_time <br /><code><a href='#types' class='required'>isodatetime</a></code> | Datetime of the ending time of the visit





### Update
Updates an existing __visit__.


#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/visits/2238a503-7ac6-4b4a-b43f-ff8c9d931ae9 -d '{
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb"
}
url = 'https://api.welkinhealth.com/v1/visits/2238a503-7ac6-4b4a-b43f-ff8c9d931ae9'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/visits/2238a503-7ac6-4b4a-b43f-ff8c9d931ae9';
const data = {
  "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/visits/:id -d { }`

#### Required Scope
`visits.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "2238a503-7ac6-4b4a-b43f-ff8c9d931ae9",
    "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
    "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
    "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
    "assessment_response_id": null,
    "start_time": "2019-09-28T21:45:11.093557+00:00",
    "end_time": "2019-09-28T21:45:11.093557+00:00",
    "updated_at": "2019-09-27T20:45:12.176691+00:00",
    "created_at": "2019-09-27T20:45:12.176691+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __visits__ record.
calendar_event_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of the [calendar event](#calendar-events) that resulted in this visit, if any.
assessment_response_id <br /><code><a href='#types' class='optional'>guid</a></code> | ID of an [assessment response](#assessment-responses) for this visit, if any.






### Find
Retrieves __visits__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __visits__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/visits -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/visits'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/visits';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/visits`

#### Required Scope
`visits.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "2238a503-7ac6-4b4a-b43f-ff8c9d931ae9",
      "worker_id": "68140115-f3c9-4bcf-b029-783a1eb24153",
      "patient_id": "2923428f-2331-46bb-ab8f-04cca3aa0299",
      "calendar_event_id": "8dbd90d2-3aeb-4e1f-8b1e-8dc7a9b34adb",
      "assessment_response_id": null,
      "start_time": "2019-09-28T21:45:11.093557+00:00",
      "end_time": "2019-09-28T21:45:11.093557+00:00",
      "updated_at": "2019-09-27T20:45:12.176691+00:00",
      "created_at": "2019-09-27T20:45:12.176691+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Workers


Workers have access to the Welkin Portal and provide care to [patients](#patients).

Workers are assigned to [patients](#patients) as the patient's primary worker via <br />`patient.primary_worker_id`














### Model

> Example Response

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True",
  "updated_at": "2018-09-12T01:27:32.125123+00:00",
  "created_at": "2018-09-12T01:27:32.125229+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __workers__ record.
email <br /><code><a href='#types'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
first_name <br /><code><a href='#types'>string</a></code> | Worker's first name
last_name <br /><code><a href='#types'>string</a></code> | Worker's last name
phone_number <br /><code><a href='#types'>optional</a> <a href='#types'>e164_phone</a></code> | Direct line phone number of the worker in international, E.164 format.
timezone <br /><code><a href='#types'>timezone</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#types'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
role_ids <br /><code><a href='#types'>list(string)</a></code> | The human readable and chosen IDs of the roles of this worker. The set of possible roles for your program are defined in [Workshop](https://workshop.welkinhealth.com)
roles <br /><code><a href='#types'>optional</a> <a href='#types'>list(string)</a></code> | (Deprecated) The database/code ID of the roles that a worker has. This is deprecated due to the fact that these IDs are not exposed or controllable in workshop.
active <br /><code><a href='#types'>boolean</a></code> | The worker account is in an active state and can be used to log in. Default is False.
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __worker__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/workers/:id`

#### Required Scope
`workers.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
    "email": "developer@welkinhealth.com",
    "first_name": "Emily",
    "last_name": "Smith",
    "phone_number": "+15555555555",
    "timezone": "US/Eastern",
    "gender": "Female",
    "role_ids": [
      "cde",
      "admin"
    ],
    "active": "True",
    "updated_at": "2018-09-12T01:27:32.125123+00:00",
    "created_at": "2018-09-12T01:27:32.125229+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __workers__ record.





### Create


Creates a new __worker__. The new worker will have no password and the worker must go through the
password reset flow before they can log in.

In order to create workers you must have this functionality enabled by Welkin. Please contact
your implementation manager or customer success manager to have this functionality enabled for your program.




#### Invocation

> Example Request

```shell
curl -XPOST https://api.welkinhealth.com/v1/workers -d '{
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True"
}
url = 'https://api.welkinhealth.com/v1/workers'

resp = requests.post(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/workers';
const data = {
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True"
};

const response = await axios({method: 'post', url: url, headers: headers, data: data});

```

`POST /v1/workers -d { }`

#### Required Scope
`workers.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
    "email": "developer@welkinhealth.com",
    "first_name": "Emily",
    "last_name": "Smith",
    "phone_number": "+15555555555",
    "timezone": "US/Eastern",
    "gender": "Female",
    "role_ids": [
      "cde",
      "admin"
    ],
    "active": "True",
    "updated_at": "2018-09-12T01:27:32.125123+00:00",
    "created_at": "2018-09-12T01:27:32.125229+00:00"
  }
}
```

#### Params


param | description
- | -
email <br /><code><a href='#types' class='required'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
first_name <br /><code><a href='#types' class='required'>string</a></code> | Worker's first name
last_name <br /><code><a href='#types' class='required'>string</a></code> | Worker's last name
phone_number <br /><code><a href='#types' class='optional'>e164_phone</a></code> | Direct line phone number of the worker in international, E.164 format.
timezone <br /><code><a href='#types' class='required'>timezone</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#types' class='optional'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
role_ids <br /><code><a href='#types' class='required'>list(string)</a></code> | The human readable and chosen IDs of the roles of this worker. The set of possible roles for your program are defined in [Workshop](https://workshop.welkinhealth.com)
active <br /><code><a href='#types' class='optional'>boolean</a></code> | The worker account is in an active state and can be used to log in. Default is False.





### Update


Updates an existing __worker__.

In order to update workers you must have this functionality enabled by Welkin. Please contact
your implementation manager or customer success manager to have this functionality enabled for your program.





#### Invocation

> Example Request

```shell
curl -XPUT https://api.welkinhealth.com/v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f -d '{
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True"
}' -H "Authorization: Bearer <your access token>" -H "Content-Type: application/json"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}

data = {
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True"
}
url = 'https://api.welkinhealth.com/v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f'

resp = requests.put(url, headers=headers, json=data).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f';
const data = {
  "email": "developer@welkinhealth.com",
  "first_name": "Emily",
  "last_name": "Smith",
  "phone_number": "+15555555555",
  "timezone": "US/Eastern",
  "gender": "Female",
  "role_ids": [
    "cde",
    "admin"
  ],
  "active": "True"
};

const response = await axios({method: 'put', url: url, headers: headers, data: data});

```

`PUT /v1/workers/:id -d { }`

#### Required Scope
`workers.write` or `all`

> Example Response

```json
{
  "data": {
    "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
    "email": "developer@welkinhealth.com",
    "first_name": "Emily",
    "last_name": "Smith",
    "phone_number": "+15555555555",
    "timezone": "US/Eastern",
    "gender": "Female",
    "role_ids": [
      "cde",
      "admin"
    ],
    "active": "True",
    "updated_at": "2018-09-12T01:27:32.125123+00:00",
    "created_at": "2018-09-12T01:27:32.125229+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __workers__ record.
email <br /><code><a href='#types' class='optional'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
first_name <br /><code><a href='#types' class='optional'>string</a></code> | Worker's first name
last_name <br /><code><a href='#types' class='optional'>string</a></code> | Worker's last name
phone_number <br /><code><a href='#types' class='optional'>e164_phone</a></code> | Direct line phone number of the worker in international, E.164 format.
timezone <br /><code><a href='#types' class='optional'>timezone</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#types' class='optional'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
role_ids <br /><code><a href='#types' class='optional'>list(string)</a></code> | The human readable and chosen IDs of the roles of this worker. The set of possible roles for your program are defined in [Workshop](https://workshop.welkinhealth.com)
active <br /><code><a href='#types' class='optional'>boolean</a></code> | The worker account is in an active state and can be used to log in. Default is False.






### Find


Retrieves __worker__, filtered by the supplied parameters.      Only the parameters listed below are supported in Find for the __worker__      resource.
It is possible to filter by email and phone.     Both attributes can be used at the same time and will act as logical OR





#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/workers -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/workers'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/workers';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/workers`

#### Required Scope
`workers.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
      "email": "developer@welkinhealth.com",
      "first_name": "Emily",
      "last_name": "Smith",
      "phone_number": "+15555555555",
      "timezone": "US/Eastern",
      "gender": "Female",
      "role_ids": [
        "cde",
        "admin"
      ],
      "active": "True",
      "updated_at": "2018-09-12T01:27:32.125123+00:00",
      "created_at": "2018-09-12T01:27:32.125229+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
email <br /><code><a href='#types' class='optional'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
phone <br /><code><a href='#types' class='optional'>e164_phone</a></code> | Direct line phone number of the worker in international, E.164 format.
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response







## Working Hours


Working Hours represent the time each day that a [worker](#workers) is scheduled to be working.
Each [worker's](#workers) [calendar](#calendars) has an entry for each day of the week that
represents their working times on that day. Working hours link to a [worker's](#workers) [Calendar](#calendars).

<aside>Working Hours can only be updated via the coach profile in Welkin.</aside>










### Model

> Example Response

```json
{
  "id": "fd6eb4a3-fa06-4b95-91f2-eea0e050da79",
  "day": "Monday",
  "day_off": false,
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "calendar_id": "36872ac5-7c8d-4d15-9e5c-8e2a1bed7aaa",
  "updated_at": "2019-03-01T12:10:11.10+00:00",
  "created_at": "2019-03-01T12:10:11.10+00:00"
}
```


param | description
- | -
id <br /><code><a href='#types'>guid</a></code> | The primary identifier of the __working hours__ record.
day <br /><code><a href='#types'>enum</a></code> | The day of the week that these working hours apply to. Possible options are `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, or `Sunday`
day_off <br /><code><a href='#types'>boolean</a></code> | `true` if a worker has designated this as a non-working day
start_time <br /><code><a href='#types'>string</a></code> | The start time of a worker's work day in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#types'>string</a></code> | The ending time of a worker's work day (inclusive) in their local timezone. Uses 24-hour time notation
calendar_id <br /><code><a href='#types'>guid</a></code> | The ID of the calendar this day belongs to
updated_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on the associated calendar)
created_at <br /><code><a href='#types'>isodatetime</a></code> | Datetime the resource was created




### Get
Retrieves a single __working hour__ by `id`.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/working_hours/fd6eb4a3-fa06-4b95-91f2-eea0e050da79 -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/working_hours/fd6eb4a3-fa06-4b95-91f2-eea0e050da79'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"}
const url = 'https://api.welkinhealth.com/v1/working_hours/fd6eb4a3-fa06-4b95-91f2-eea0e050da79';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/working_hours/:id`

#### Required Scope
`working_hours.read` or `all`

> Example Response

```json
{
  "data": {
    "id": "fd6eb4a3-fa06-4b95-91f2-eea0e050da79",
    "day": "Monday",
    "day_off": false,
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "calendar_id": "36872ac5-7c8d-4d15-9e5c-8e2a1bed7aaa",
    "updated_at": "2019-03-01T12:10:11.10+00:00",
    "created_at": "2019-03-01T12:10:11.10+00:00"
  }
}
```

#### Params


param | description
- | -
id <br /><code><a href='#types' class='required'>guid</a></code> | The primary identifier of the __working hours__ record.








### Find
Retrieves __working hours__, filtered by the supplied parameters. Only the parameters listed below are supported in Find for the __working hours__ resource.


#### Invocation

> Example Request

```shell
curl -XGET https://api.welkinhealth.com/v1/working_hours -H "Authorization: Bearer <your access token>"
```

```python
import requests

headers = {"Authorization": "Bearer <token>"}
url = 'https://api.welkinhealth.com/v1/working_hours'

resp = requests.get(url, headers=headers).json()

```

```javascript
const axios = require('axios');

const headers = {"Authorization": "Bearer <token>"};
const url = 'https://api.welkinhealth.com/v1/working_hours';

const response = await axios({method: 'get', url: url, headers: headers});

```

`GET /v1/working_hours`

#### Required Scope
`working_hours.read` or `all`

> Example Response

```json
{
  "data": [
    {
      "id": "fd6eb4a3-fa06-4b95-91f2-eea0e050da79",
      "day": "Monday",
      "day_off": false,
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "calendar_id": "36872ac5-7c8d-4d15-9e5c-8e2a1bed7aaa",
      "updated_at": "2019-03-01T12:10:11.10+00:00",
      "created_at": "2019-03-01T12:10:11.10+00:00"
    }
  ],
  "links": "Elided for simplicity, see Find Endpoints Overview above"
}
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#types' class='optional'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#types' class='optional'>integer</a></code> | Maximum number of items to include in the response








# Additional Information

## Batch creation of resources

> Example Patient creation with Phone Numbers and External IDs

```json
{
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
  "timezone": "US/Pacific",
  "first_name": "Grace",
  "last_name": "Hopper",
  "birthday": "1906-12-09",
  "street": "3265 17th St",
  "street_line_two": "#304",
  "city": "San Francisco",
  "county": "San Francisco County",
  "zip_code": "94110",
  "state": "CA",
  "country": "USA",
  "phone_numbers": [
    {
      "phone_number_type": "cell",
      "phone_number": "4155555555"
    },
    {
      "phone_number_type": "landline",
      "phone_number": "4155555556"
    }
  ],
  "external_ids": [
    {
      "external_id": "abc-123",
      "namespace": "ehr"
    }
  ]
}
```

Welkin's APIs support the creation of related resources in a single API call. This simplifies the creation of resources and ensures that they are correctly linked.

For example, when creating a [patient](#patients) you can include their phone numbers and email addresses.

Current supported batch creation relationships:

base type | sub type | base type key | plurality
- | - | - | -
[calendar events](#calendar-events) | [external ids](#external-ids) | `external_ids` | one to many
[conversations](#conversations) | [email messages](#email-messages) | `email_messages` | one to many
[custom data type records](#custom-data-type-records) | [patients](#patients) | `patient` | one to one
[email addresses](#email-addresses) | [patients](#patients) | `patient` | one to one
[email messages](#email-messages) | [conversations](#conversations) | `conversation` | one to one
[external ids](#external-ids) | [calendar events](#calendar-events) | `calendar_event` | one to one
[external ids](#external-ids) | [patients](#patients) | `patient` | one to one
[external ids](#external-ids) | [profiles](#profiles) | `profile` | one to one
[external ids](#external-ids) | [workers](#workers) | `worker` | one to one
[patients](#patients) | [custom data type records](#custom-data-type-records) | `custom_data_type_records` | one to many
[patients](#patients) | [email addresses](#email-addresses) | `email_addresses` | one to many
[patients](#patients) | [external ids](#external-ids) | `external_ids` | one to many
[patients](#patients) | [phone numbers](#phone-numbers) | `phone_numbers` | one to many
[phone numbers](#phone-numbers) | [patients](#patients) | `patient` | one to one
[profiles](#profiles) | [external ids](#external-ids) | `external_ids` | one to many
[profiles](#profiles) | [profile phone numbers](#profile-phone-numbers) | `profile_phone_numbers` | one to many
[profile phone numbers](#profile-phone-numbers) | [profiles](#profiles) | `profile` | one to one
[workers](#workers) | [external ids](#external-ids) | `external_ids` | one to many

<aside>If creation of one of the resources fails then the entire transaction fails and none of the resources are created in Welkin.</aside>

## Errors

Requests to the common apis are transactional. Any errors that occur in the course of serving
a request will fail the operation. In the case of failure, errors will be collected in the `errors`
key in the following format

field | Meaning
---------- | -------
status <br /> `int` | The http status code of the error. If client logic relies on this value, consider using the response's top-level http status code instead (more below).
code <br /> `string` | A string identifier of the welkin-specific error. Refer to the table below.
title <br /> `string` | A human-readable title explaining the class of error.
detail <br /> `string` | A human-readable description of the specific error instance.
extra <br /> `json` | Optional values that provide additional context on the failure.


> Example Response

```json
  {
    "errors": [{
      "status": 400,
      "code": "parse_exception",
      "title": "Parse Exception",
      "detail": "Failed to parse guid at .id",
      "extra": {
        "path": ".id"
      }
    }]
  }
```

Note that each error is assigned both an integer status and a string code. The code strings
represent stable identifiers for welkin-specific errors. Each code string offers a more detailed
classification of the error response than an http status allows. A list of common welkin error
codes, and their corresponding http status is shown below:

Welkin Code | Http Status| Description
- | - | -
parse_exception | 400 | The json body of the request is invalid.
uniqueness_exception | 400 | The request attempted to create a duplicate resource.
bad_request | 400 | The request is invalid for other reasons.
unauthorized | 401 | The credentials used for the request are invalid.
forbidden | 403 | The requester does not have access.
not_found | 404 | The route or resource requested does not exist.
resource_not_found | 404 | One or multiple secondary resources could not be found.
internal_server_error | 500 | Welkin failed to process the request. We're looking into it.

When handling welkin errors, it is correct to use the http status code of the response OR the
string codes of individual errors, depending on the needs of the client code. While the body of
the response can contain multiple errors, the http response will always have a single
integer status code, indicating the primary cause of failure.

## Types

type | definition | example
- | - | -
boolean | JSON style boolean | `true`
date | `string` following the [isodatetime format](https://en.wikipedia.org/wiki/ISO_8601) representing a day in the local timezone of the [worker](#workers) or [patient](#patients) | `"2018-09-15"`
e164_phone | `string` representing an international, E.164 formatted phone number without extensions or other dialing information. Country code must be included. | `"+15555551234"`
email | `string` representing an email address | `"support@welkinhealth.com"`
enum | `string` with predefined set of values (also known as an enumeration) | `"Female"`
guid | `string` with 36 characters separated into groups by dashes 8-4-4-4-12. | `"45ceeba9-4944-43d1-b34d-0c36846acd4c"`
integer | Counting numbers with no decimal place including zero and negative numbers | `42`
isodatetime | `string` following [isodatetime format](https://en.wikipedia.org/wiki/ISO_8601) representing a date and time in UTC | `"2018-09-15T15:20:01"`
json | `string` following [JSON format](https://en.wikipedia.org/wiki/JSON). Welkin may require the `json` to have a specific format depending on API endpoint. | `"{"foo": "bar"}"`
list(x) | JSON list of objects of type `x` | `["a", "b", "c"]`
state | `string` of the capitalized two character United States state abbreviation | `"CA"`
string | Any quoted set of ASCII characters with no length restriction | `"Welcome to Welkin's APIs"`
timezone | `string` following [iana tz format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) | `"US/Pacific"`
zip_code | `string` of a five digit United States zip code | `"94110"`

<aside>GUIDs are global unique identifiers for objects within Welkin. These IDs are long lived for resources and are unique within and across resources.</aside>


