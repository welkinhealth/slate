# Overview

Welkin’s goal is to empower you, our customers, to deliver patient-centered care. Our API exists in support of this goal. Whether it’s data kept within our platform, or your pre-existing systems, we think you should have complete, real-time access and agency over your own data.

Using Welkin's APIs will allow you to keep your systems in sync with Welkin.

By design, our API notifies your subscribed systems of any updates to your resources within Welkin. For example, when a patient's phone number is changed in Welkin, that information is immediately sent to your systems, keeping them up to date with the latest values stored in our platform.

Welkin's API also transfer the data created and updated in your 3rd party systems into our platform, keeping your information across systems aligned.

This documentation outlines the data types available via Welkin’s APIs and the usage of these APIs. APIs exist for all of the core data types managed within Welkin.

**Base URL:** https://api.welkinhealth.com

## API updates
**Welkin's API is in active development.** We will be making backwards compatible changes over the coming months with little or no advanced notice. You should expect Welkin to add additional optional fields to resource schemas and new resource types to the API. Your integration should be built with this understanding and should not break with the addition of new fields or resource types. Use of strict schema validation is not recommended. Breaking changes will be communicated in advance of rollout and we will work with you to make the transition.

## Authentication
> Example token fetch (PYTHON)

```python
JWT_BEARER_URI = 'urn:ietf:params:oauth:grant-type:jwt-bearer'

def get_token(client_id, client_secret, scope, endpoint, audience):
  claim = {
    'iss': client_id,
    'aud': audience,
    'exp': arrow.utcnow().replace(seconds=3600).timestamp,
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

token = get_token('<client_id>',
                  '<client_secret>',
                  'all',
                  'https://api.welkinhealth.com/v1/token',
                  'https://api.welkinhealth.com/v1/token')
```

> Example token usage (PYTHON)

```python
headers = {"Authorization": "Bearer <token>"}

resp = requests.post('https://api.welkinhealth.com/v1/patients', headers=headers).json()
```

Welkin's APIs are secured using a 2-legged OAuth JWT-Bearer authorization flow. This ensures that data stored within Welkin remains secure and is not accessible by unauthorized parties.

Once you obtain an access token, the token can be passed as an Authorization header along with the keyword `Bearer`.

More information on the JWT protocol can be found at [jwt.io](https://jwt.io/).

A simple guide to understanding JWT can be found in this [Medium article](https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec).

**Token endpoint**: `https://api.welkinhealth.com/v1/token`

**Expected JWT fields**

* `iss` = your client_id as issued by Welkin
* `aud` = `https://api.welkinhealth.com/v1/token`
* `exp` = ISO timestamp when the token should expire (recommended 1 hours from current time)
* `scope` = `all`

**Expected POST body fields**

* `assertion` = JWT token
* `grant_type` = `urn:ietf:params:oauth:grant-type:jwt-bearer`

# Update Notifications
Welkin's APIs work using a “ping and pull” model. This means our APIs notify subscribers via Webhook any time there’s an update to your data within our platform. Your subscribers can then decide if you want to pull the updated resources into your system, from Welkin. This ensures your systems are kept up to date with the latest data changes in our platform, without needing to continuously poll our APIs.

The webhook notification includes which resources have changed, the time range of the changes, and a url to use in a `GET` request to fetch the changes (see *Find* endpoints for each resource).

Webhook notifications are delayed up to 60 seconds, from the time the resource is changed in Welkin.

**An example of Welkin’s data sync could look like the following:**

1. Alex, a worker, logs into Welkin and updates the phone number in the patient's (Allison) profile.
2. Welkin sends a notification to the customer’s 3rd party system, letting them know that the patient object for Allison has been changed.
3. In response, the 3rd party system requests the full patient object for Allison, which contains the new phone number.
4. The system processes the updated patient object and saves it.
5. Both Welkin and the customer’s integrated system are now in sync, both reflecting Allison’s updated phone number.

## Webhook body

Each notification contains all the updates for all the resource types since the last successful notification.

> Example notification request body (JSON)

```json
[ { "resource": "patients",
    "from": "2018-05-14T23:34:05.647496",
    "to": "2018-05-15T23:34:05.647496",
    "href": "https://api.welkinhealth.com/v1/patients?page[to]=2018-05-15T23:34:05.647496&page[from]=2018-05-14T23:34:05.647496"}]
```

#### Model notification webhook request body
field | type | description
- | - | -
_ | `list` | List of data_update_notification objects

#### Model data_update_notification
field | type | description
- | - | -
resource | `string` | Resource endpoint path name
from | `isodatetime` | Datetime of first update
to | `isodatetime` | Datetime of latest update
href | `string` | Link to GET all updates for this notification

## Webhook security
Welkin's APIs expect that the webhook destination is secured using [JWT Bearer Authorization](#authentication) in the same manor that our core API is secured. This ensures that patient data remains secure and protected at all times.

Welkin supports two authentication flows for the notifications. Both have the same level of security.

### JWT as Bearer Token (Recommended)

> Example Welkin side code (for illustration only)

```python
# Create the JWT
def create_jwt(client_id, client_secret, audience):
  claim = {
    'iss': client_id,
    'aud': audience,
    'exp': arrow.utcnow().replace(seconds=3600).timestamp,
    'scope': 'welkin',
  }
  assertion = jwt.encode(claim, client_secret, algorithm='HS256')
  return assertion

# The token to be used for making notification requests
token = create_jwt('<client_id>',
                '<client_secret>',
                '<client_audience_url>')

headers = {"Authorization": "Bearer { }".format(token)}

# Welkin sends the actual notification
requests.post('<client_notify_url>',
              headers=headers,
              data="the notification content")
```

A JWT is included as the Bearer Token on each notification request.

In this model the JWT is not exchanged for an access token but is used directly as the access token for the notification endpoint.

Expected scope for the notify endpoint: `welkin`

Hash algorithm used by Welkin in creating the JWT: `HS256`

**To be provided to Welkin:**

* `client_id` - identifies Welkin in the customer's system
* `client_secret` - must be transmitted securely to Welkin
* `notify_url` - url at which the customer will receive the webhooks
* `jwt_audience_url` - can be the same as the notify_url
* list of api resources for which notifications should be sent

> Example notification from Welkin to Customer (url truncated)

```shell
curl -X POST \
  'https://customer.com/notify' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT>' \
  -d '[ { "resource": "patients",
          "from": "2018-05-14T23:34:05.647496",
          "to": "2018-05-15T23:35:05.647496",
          "href": "https://api.welkinhealth.com/v1/patients ..." } ]'
```

### Token exchange

> Example Welkin side code (for illustration only)

```python
JWT_BEARER_URI = 'urn:ietf:params:oauth:grant-type:jwt-bearer'

# Welkin gets an access token from customer
def get_token(client_id, client_secret, audience, endpoint):
  claim = {
    'iss': client_id,
    'aud': audience,
    'exp': arrow.utcnow().replace(seconds=3600).timestamp,
    'scope': 'welkin',
  }
  assertion = jwt.encode(claim, client_secret, algorithm='HS256')
  params = {
    'assertion': assertion,
    'grant_type': JWT_BEARER_URI
  }
  resp = requests.post(endpoint, data=params)
  token = resp.json()['access_token']
  return token

# The token to be used for making notification requests
token = get_token('<client_id>',
                  '<client_secret>',
                  '<client_jwt_audience_url>',
                  '<client_token_endpoint_url>'
                  )

headers = {"Authorization": "Bearer { }".format(token)}

# Welkin sends the actual notification
requests.post('<client_notify_url>',
              headers=headers,
              data="the notification content")
```

A JWT sent as a Bearer Token to your Token endpoint is exchanged for an access token which is then used when sending the notifications.

In this model we send two requests, first to get an access token and then to send the notification. Having two round trip requests is not needed to secure the notifications endpoint.

Expected scope for the notify endpoint: `welkin`

Hash algorithm used by Welkin in creating the JWT: `HS256`

**To be provided to Welkin:**

* `client_id` - identifies Welkin in the customer's system
* `client_secret` - must be transmitted securely to Welkin
* `notify_url` - url at which the customer will receive the webhooks
* `token_endpoint_url` - url from which Welkin will request access tokens
* `jwt_audience_url` - can be the same as the notify_url
* list of api resources for which notifications should be sent

> Example request for access token from Welkin to Customer

```shell
curl -X POST \
  'https://customer.com/token' \
  -H 'Content-Type: application/json' \
  -d '{ "assertion": "<JWT>",
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer"
      }'
```

> Example token response from Customer

```python
{
  "access_token": "<token>"
}
```

> Example notification from Welkin to Customer (url truncated)

```shell
curl -X POST \
  'https://customer.com/notify' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '[ { "resource": "patients",
          "from": "2018-05-14T23:34:05.647496",
          "to": "2018-05-15T23:35:05.647496",
          "href": "https://api.welkinhealth.com/v1/patients ..." } ]'
```

## Find endpoints
> Example Request

```shell
curl -XGET /v1/patients?page[from]=2018-06-15T10:30:01&page[to]=2018-09-30T10:29:59&page[size]=10
```

You can pull large batches of data from Welkin at anytime using the *Find* endpoint for any API resource. These endpoints support filtering by time ranges. If your system misses notifications or needs data from a specific time range you should use the *Find* endpoints to pull data for the missing time range.

The example here pulls patients created or updated during the time range June 15th 2018 to September 30th 2018.

# API Reference


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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
worker_id <br /><code><a href='#guid'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#guid'>guid</a></code> | ID of the [conversation](#conversations) that this messages is contained in
direction <br /><code><a href='#enum'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#string'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#boolean'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
sent_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single app message.


#### Invocation

> Example Request

```shell
curl -XGET /v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26
```

`GET /v1/app_messages/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create


New messages can be created in a [Patient](#patients) Profile. Messages created in Welkin are recorded in the
[conversation](#conversations) view.

<aside>Creating a app message record does NOT cause that message to be sent to the <a href="#patients">patient</a>.</aside>




#### Invocation

> Example Request

```shell
curl -XPOST /v1/app_messages -d '{
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}'
```

`POST /v1/app_messages -d { }`


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

#### Params


param | description
- | -
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
worker_id <br /><code><a href='#guid'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#guid'>guid</a></code> | ID of the [conversation](#conversations) that this messages is contained in
direction <br /><code><a href='#enum'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#string'>string</a></code> | Text of the message
sent_at <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
  




### Update


Update the time at which the message was sent. This is to be used when an outside system sends the app messages on
behalf of Welkin to the patient.




#### Invocation

> Example Request

```shell
curl -XPUT /v1/app_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26 -d '{
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}'
```

`PUT /v1/app_messages/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
sent_at <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
  





### Find
Finds app messages, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/app_messages
```

`GET /v1/app_messages`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.523395+00:00",
        "page[to]": "2019-07-11T19:24:08.523427+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [patient](#patients) who sent or received this message.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4,
    "completed_at": "2018-08-12T10:20:15"
  },
  "updated_at": "2018-09-12T01:27:32.024836+00:00",
  "created_at": "2018-09-12T01:27:32.025031+00:00"
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
spec_id <br /><code><a href='#string'>string</a></code> | (Deprecated) ID of the assessment which this response corresponds to. This is only used for assessments created in code by Welkin engineers.
spec_name <br /><code><a href='#string'>string</a></code> | The ref_name for the assessment as it appears in [Workshop](https://workshop.welkinhealth.com).
spec_version <br /><code><a href='#string'>string</a></code> | Optionally, the version string of assessment spec. If not specified, the most recent spec version authored in [Workshop](https://workshop.welkinhealth.com) will be used.
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients)
model <br /><code><a href='#json'>json</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single assessment response.


#### Invocation

> Example Request

```shell
curl -XGET /v1/assessment_responses/20c04e56-69f0-4d13-b5c1-a1763abd1218
```

`GET /v1/assessment_responses/:id`


> Example Response

```json
{
  "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4,
    "completed_at": "2018-08-12T10:20:15"
  },
  "updated_at": "2018-09-12T01:27:32.024836+00:00",
  "created_at": "2018-09-12T01:27:32.025031+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create


Creates a new assessment response.





#### Invocation

> Example Request

```shell
curl -XPOST /v1/assessment_responses -d '{
  "spec_id": "some_string",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4,
    "completed_at": "2018-08-12T10:20:15"
  },
  "title": "some_string"
}'
```

`POST /v1/assessment_responses -d { }`


> Example Response

```json
{
  "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
  "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
  "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
  "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
  "model": {
    "insurance_provider": "Acme Insurance",
    "plan_type": "SILVER",
    "active": true,
    "years_active": 2,
    "last_hcp_visit": "2018-07-14",
    "pain_scale": 0.4,
    "completed_at": "2018-08-12T10:20:15"
  },
  "updated_at": "2018-09-12T01:27:32.024836+00:00",
  "created_at": "2018-09-12T01:27:32.025031+00:00"
}
```

#### Params


param | description
- | -
spec_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | (Deprecated) ID of the assessment which this response corresponds to. This is only used for assessments created in code by Welkin engineers.
spec_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The ref_name for the assessment as it appears in [Workshop](https://workshop.welkinhealth.com).
spec_version <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Optionally, the version string of assessment spec. If not specified, the most recent spec version authored in [Workshop](https://workshop.welkinhealth.com) will be used.
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients)
model <br /><code><a href='#anything'>anything</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
title <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The title of the assessment response to be displayed in the timeline.
  






### Find
Finds assessment responses, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/assessment_responses
```

`GET /v1/assessment_responses`


> Example Response

```json
[
  {
    "data": [
      {
        "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218",
        "spec_name": "formation_specs_d3da7fc6-77e3-4982-800a-bcaa6983a611",
        "spec_version": "a83acefd-b97c-4d05-99a8-003d443409dc",
        "patient_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6",
        "model": {
          "insurance_provider": "Acme Insurance",
          "plan_type": "SILVER",
          "active": true,
          "years_active": 2,
          "last_hcp_visit": "2018-07-14",
          "pain_scale": 0.4,
          "completed_at": "2018-08-12T10:20:15"
        },
        "updated_at": "2018-09-12T01:27:32.024836+00:00",
        "created_at": "2018-09-12T01:27:32.025031+00:00"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.535848+00:00",
        "page[to]": "2019-07-11T19:24:08.535878+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





## Calendar Events


Calendar events are appointments on worker [calendars](#calendars). They're in reference to a [patient](#patients). A
calendar event can be scheduled for a date and time or simply for a date.

<aside>All calendar events have an associated appointment prompt which will trigger at the time of the event. Valid
appointment prompts are specific to your implementation of Welkin. The
range of appointment prompts can be found in <a href="https://workshop.welkinhealth.com">Workshop</a>.</aside>

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
  "modality": "phone",
  "appointment_type": "intake_call",
  "updated_at": "2018-09-10T18:56:19.359240+00:00",
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
calendar_id <br /><code><a href='#guid'>guid</a></code> | ID of the [calendar](#calendars) on which this event resides
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients)
user_id <br /><code><a href='#guid'>guid</a></code> | (Deprecated) ID of the [patient](#patients)
is_all_day <br /><code><a href='#boolean'>boolean</a></code> | `true` if not scheduled for a specific time of day. `false` otherwise
start_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day
day <br /><code><a href='#date'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
outcome <br /><code><a href='#enum'>enum</a></code> | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no-show`)
modality <br /><code><a href='#enum'>enum</a></code> | Mode via which the event will take place (`call`, `visit`, `video`)
appointment_type <br /><code><a href='#string'>string</a></code> | Appointment prompt to be used for this event (see note for details)
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single calendar event.


#### Invocation

> Example Request

```shell
curl -XGET /v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297
```

`GET /v1/calendar_events/:id`


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
  "modality": "phone",
  "appointment_type": "intake_call",
  "updated_at": "2018-09-10T18:56:19.359240+00:00",
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create
Creates a new calendar event.


#### Invocation

> Example Request

```shell
curl -XPOST /v1/calendar_events -d '{
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d",
  "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180",
  "user_id": "c2f55e6d-f17d-4296-9892-090ce5d327dc",
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "modality": "phone",
  "appointment_type": "intake_call"
}'
```

`POST /v1/calendar_events -d { }`


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
  "modality": "phone",
  "appointment_type": "intake_call",
  "updated_at": "2018-09-10T18:56:19.359240+00:00",
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

#### Params


param | description
- | -
calendar_id <br /><code><a href='#guid'>guid</a></code> | ID of the [calendar](#calendars) on which this event resides
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [patient](#patients)
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) ID of the [patient](#patients)
start_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day
day <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
modality <br /><code><a href='#enum'>enum</a></code> | Mode via which the event will take place (`call`, `visit`, `video`)
appointment_type <br /><code><a href='#string'>string</a></code> | Appointment prompt to be used for this event (see note for details)
  




### Update
Updates an existing calendar event.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/calendar_events/f2baaf15-94d2-415d-b3e6-7409b643d297 -d '{
  "start_time": "2018-09-10T18:56:19.357228+00:00",
  "end_time": "2018-09-10T18:56:19.357540+00:00",
  "outcome": "completed"
}'
```

`PUT /v1/calendar_events/:id -d { }`


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
  "modality": "phone",
  "appointment_type": "intake_call",
  "updated_at": "2018-09-10T18:56:19.359240+00:00",
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
start_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day
day <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
outcome <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no-show`)
  





### Find
Finds calendar events, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/calendar_events
```

`GET /v1/calendar_events`


> Example Response

```json
[
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
        "modality": "phone",
        "appointment_type": "intake_call",
        "updated_at": "2018-09-10T18:56:19.359240+00:00",
        "created_at": "2018-09-10T18:56:19.359873+00:00"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.556959+00:00",
        "page[to]": "2019-07-11T19:24:08.556986+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
worker_id <br /><code><a href='#guid'>guid</a></code> | The ID of the worker who's calendar this is
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on the associated calendar)
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single calendar.


#### Invocation

> Example Request

```shell
curl -XGET /v1/calendars/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f
```

`GET /v1/calendars/:id`


> Example Response

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
  "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5",
  "updated_at": "2018-09-12T01:27:32.028059+00:00",
  "created_at": "2018-09-12T01:27:32.028187+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  







### Find
Finds calendars, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/calendars
```

`GET /v1/calendars`


> Example Response

```json
[
  {
    "data": [
      {
        "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f",
        "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5",
        "updated_at": "2018-09-12T01:27:32.028059+00:00",
        "created_at": "2018-09-12T01:27:32.028187+00:00"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.563245+00:00",
        "page[to]": "2019-07-11T19:24:08.563273+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





## Care Flows



Care Flows lay out a set of tasks, or multiple sets of tasks, to help the patient achieve 1 or more Goals.

<aside>Care Flows can be created in the Coach Portal using a Care Flow template (designed in
<a href="https://workshop.welkinhealth.com">Workshop</a>), or they may be automatically created as the end result of a Process
(also designed in <a href="https://workshop.welkinhealth.com">Workshop</a>). When using a template to make a new Care Flow,
changes made to the Care Flow will not be reflected in the template it originated from.</aside>









### Model care_flow
field | type | description
- | - | -
title | `string` | Title of the overall Care Flow
description | `string` | Description of the overall Care Flow
goals | `list` | List of [goal objects](#model-goal)

### Model Goal
field | type | description
- | - | -
title | `string` | Title of the Care Flow goal
tasks | `list` | List of [goal intervention objects](#model-intervention)

### Model Intervention
field | type | description | optional
- | - | - | -
description | `string` | Title of the Care Flow intervention | required
reminder_date | `isodatetime` | Due date for the intervention | optional
completed_at | `isodatetime` | Date the intervention was marked completed | optional
completed_by_worker_id | `guid` | ID of the [worker](#workers) who completed this intervention | optional
worker_id | `guid` | ID of the [worker](#workers) who this intervention is assigned to | optional


### Get
Retrieves a single care flow.


#### Invocation

> Example Request

```shell
curl -XGET /v1/care_flows/c68a80d4-95ea-4f61-bf90-615d70bea591
```

`GET /v1/care_flows/:id`


> Example Response

```json
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
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  







### Find
Finds care flows, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/care_flows
```

`GET /v1/care_flows`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.569054+00:00",
        "page[to]": "2019-07-11T19:24:08.569085+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





## Conversations


Conversations track the text-based conversations between [workers](#workers) and [patients](#patients).

Text-based communication methods supported by Welkin are: SMS, email, and in-app messaging.

<aside>Only 3rd party app conversations can be created via this API. There is only one SMS conversation per
<a href="#patients">patient</a> <a href="#phone-numbers">phone number</a> and that conversation is automatically created when the
phone number is added to the patient.</aside>

<aside>Emails are not currently exposed in Welkin's APIs.</aside>








### Model

> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App",
  "phone_number_id": null,
  "updated_at": "2018-09-12T01:27:32.031245+00:00",
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) participant in this conversation. Only one patient can participate in any single conversation.
conversation_type <br /><code><a href='#enum'>enum</a></code> | `sms`, `email`, `app` (In app messages to non-Welkin apps), `welkin_app` (Welkin's 1st party in app messages)
title <br /><code><a href='#string'>string</a></code> | The title string to be displayed in the conversation view for 3rd party app conversations
phone_number_id <br /><code><a href='#guid'>guid</a></code> | The ID of the [patient's](#patients) phone number which will be included in this conversation. This ID will be `null` for email and in-app message conversations.
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single conversation.


#### Invocation

> Example Request

```shell
curl -XGET /v1/conversations/bfa29e70-e328-4c3b-a3d1-7c2d959735ca
```

`GET /v1/conversations/:id`


> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App",
  "phone_number_id": null,
  "updated_at": "2018-09-12T01:27:32.031245+00:00",
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create


Create a 3rd party app conversation for a [patient](#patients)





#### Invocation

> Example Request

```shell
curl -XPOST /v1/conversations -d '{
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App"
}'
```

`POST /v1/conversations -d { }`


> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
  "conversation_type": "app",
  "title": "App",
  "phone_number_id": null,
  "updated_at": "2018-09-12T01:27:32.031245+00:00",
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) participant in this conversation. Only one patient can participate in any single conversation.
conversation_type <br /><code><a href='#enum'>enum</a></code> | `sms`, `email`, `app` (In app messages to non-Welkin apps), `welkin_app` (Welkin's 1st party in app messages)
title <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The title string to be displayed in the conversation view for 3rd party app conversations
  






### Find
Finds conversations, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/conversations
```

`GET /v1/conversations`


> Example Response

```json
[
  {
    "data": [
      {
        "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca",
        "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88",
        "conversation_type": "app",
        "title": "App",
        "phone_number_id": null,
        "updated_at": "2018-09-12T01:27:32.031245+00:00",
        "created_at": "2018-09-12T01:27:32.031362+00:00"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.578056+00:00",
        "page[to]": "2019-07-11T19:24:08.578079+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [patient](#patients) participant in this conversation. Only one patient can participate in any single conversation.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
body <br /><code><a href='#json'>json</a></code> | The content of the custom date type record
patient_id <br /><code><a href='#guid'>guid</a></code> | The ID of the [patient](#patients)
type_name <br /><code><a href='#string'>string</a></code> | ID of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single custom data type record.


#### Invocation

> Example Request

```shell
curl -XGET /v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7
```

`GET /v1/custom_data_type_records/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create
Creates a new custom data type record.


#### Invocation

> Example Request

```shell
curl -XPOST /v1/custom_data_type_records -d '{
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  },
  "patient_id": "a162d51e-7791-476a-bf9c-c631e178e3c4",
  "type_name": "hcp"
}'
```

`POST /v1/custom_data_type_records -d { }`


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

#### Params


param | description
- | -
body <br /><code><a href='#anything'>anything</a></code> | The content of the custom date type record
patient_id <br /><code><a href='#guid'>guid</a></code> | The ID of the [patient](#patients)
type_name <br /><code><a href='#string'>string</a></code> | ID of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
  




### Update
Updates an existing custom data type record.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/custom_data_type_records/07ae21f7-c60e-42cb-ab7a-c80a3c445cc7 -d '{
  "body": {
    "name": "Frank Smith",
    "suffix": "MD",
    "practice_name": "Boston Medical Group",
    "office_id": "e32ac52",
    "specialty": "internal medicine"
  }
}'
```

`PUT /v1/custom_data_type_records/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
body <br /><code><a href='#anything'>anything</a></code> | The content of the custom date type record
  





### Find
Finds custom data type records, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/custom_data_type_records
```

`GET /v1/custom_data_type_records`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.588405+00:00",
        "page[to]": "2019-07-11T19:24:08.588434+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
type_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#email'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#string'>string</a></code> | The display name for a [patient](#patients) email address, visible to [workers](#workers)
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) which this email address is associated with.
user_id <br /><code><a href='#guid'>guid</a></code> | (Deprecated) ID of the [patient](#patients) which this email address is associated with.
verified <br /><code><a href='#boolean'>boolean</a></code> | `true` only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verification email. This does not guarantee that the email address is owned by the [patient](#patients). Default `false`
opted_in_to_email <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address. Default `false`
automatic_recipient <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive automated emails at this email address. Default `false`
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single email address.


#### Invocation

> Example Request

```shell
curl -XGET /v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd
```

`GET /v1/email_addresses/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create






#### Invocation

> Example Request

```shell
curl -XPOST /v1/email_addresses -d '{
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "patient_id": "14492e35-c4e4-4235-8175-aa874321144e",
  "user_id": "44d69371-6234-412b-aee8-4f1754950455",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
}'
```

`POST /v1/email_addresses -d { }`


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

#### Params


param | description
- | -
email <br /><code><a href='#email'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The display name for a [patient](#patients) email address, visible to [workers](#workers)
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) which this email address is associated with.
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) ID of the [patient](#patients) which this email address is associated with.
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verification email. This does not guarantee that the email address is owned by the [patient](#patients). Default `false`
opted_in_to_email <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address. Default `false`
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive automated emails at this email address. Default `false`
  




### Update
Updates an existing email address.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/email_addresses/0546cc93-7695-49c1-ab5e-3daf3fde12bd -d '{
  "email": "developer@welkinhealth.com",
  "friendly_name": "developer contact",
  "verified": false,
  "opted_in_to_email": true,
  "automatic_recipient": false
}'
```

`PUT /v1/email_addresses/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#optional'>optional</a> <a href='#email'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The display name for a [patient](#patients) email address, visible to [workers](#workers)
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verification email. This does not guarantee that the email address is owned by the [patient](#patients). Default `false`
opted_in_to_email <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address. Default `false`
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) as consented to receive automated emails at this email address. Default `false`
  





### Find
Finds email addresses, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/email_addresses
```

`GET /v1/email_addresses`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.602667+00:00",
        "page[to]": "2019-07-11T19:24:08.602694+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [patient](#patients) which this email address is associated with.
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) ID of the [patient](#patients) which this email address is associated with.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





## External Ids (provisional)



Welkin APIs and systems communicate via GUIDs. All communications with Welkin's standard API must be made using
Welkin's GUIDs. In rare cases, custom integrations are supported by mapping Welkin IDs to a set of external IDs.
To learn more about custom integrations, [drop us a line](https://welkinhealth.com/contact-us/).

<aside>Duplicate entries for the same Welkin ID within a single namespace will be rejected.</aside>









### Model

> Example Response

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
  "resource": "patient",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
resource <br /><code><a href='#string'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#string'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#string'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#guid'>guid</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.
  




### Update
Updates an existing external id.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/external_ids/76c5662c-1e16-4cfa-bbad-900e721a290b -d '{
  "resource": "patient",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}'
```

`PUT /v1/external_ids/:id -d { }`


> Example Response

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
  "resource": "patient",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
resource <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.
  




### Create
Creates a new external id.


#### Invocation

> Example Request

```shell
curl -XPOST /v1/external_ids -d '{
  "resource": "patient",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}'
```

`POST /v1/external_ids -d { }`


> Example Response

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
  "resource": "patient",
  "namespace": "ehr",
  "external_id": "abc-123",
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```

#### Params


param | description
- | -
resource <br /><code><a href='#string'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#string'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#string'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#guid'>guid</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.
  





### Find
Finds external ids, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/external_ids
```

`GET /v1/external_ids`


> Example Response

```json
[
  {
    "data": [
      {
        "id": "76c5662c-1e16-4cfa-bbad-900e721a290b",
        "resource": "patient",
        "namespace": "ehr",
        "external_id": "abc-123",
        "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.612544+00:00",
        "page[to]": "2019-07-11T19:24:08.612572+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
resource <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | String name of the resource collection that this ID is associated with. For example `workers`
namespace <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Snake cased string separating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
  ]
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) profile onto which the file will be attached
worker_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the worker who is attaching the file
attachment_type <br /><code><a href='#string'>string</a></code> | A label attached to the file. Note, for your implementation of Welkin there may be a predefined set of possible labels.
description <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Text description or notes about the file being attached
file_upload_ids <br /><code><a href='#list(guid)'>list(guid)</a></code> | List of [file upload IDs](#file-uploads) to attach to the [patient](#patients)
  



### Get
Retrieves a single file attachment.


#### Invocation

> Example Request

```shell
curl -XGET /v1/file_attachments/b43694f1-ed2d-4e0d-a9ee-65a7e093efee
```

`GET /v1/file_attachments/:id`


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
  ]
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create
Creates a new file attachment.


#### Invocation

> Example Request

```shell
curl -XPOST /v1/file_attachments -d '{
  "patient_id": "45534dcb-daab-45fe-adbc-c0408664ca14",
  "worker_id": "8004dca9-391c-422f-b8b3-1997b4747dac",
  "attachment_type": "x-ray",
  "description": "Right leg",
  "file_upload_ids": [
    "efbcc819-f25f-4bf4-afd4-198a035d5340"
  ]
}'
```

`POST /v1/file_attachments -d { }`


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
  ]
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) profile onto which the file will be attached
worker_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the worker who is attaching the file
attachment_type <br /><code><a href='#string'>string</a></code> | A label attached to the file. Note, for your implementation of Welkin there may be a predefined set of possible labels.
description <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Text description or notes about the file being attached
file_upload_ids <br /><code><a href='#list(guid)'>list(guid)</a></code> | List of [file upload IDs](#file-uploads) to attach to the [patient](#patients)
  






### Find
Finds file attachments, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/file_attachments
```

`GET /v1/file_attachments`


> Example Response

```json
[
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
        ]
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.621414+00:00",
        "page[to]": "2019-07-11T19:24:08.621440+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  




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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
mime_type <br /><code><a href='#enum'>enum</a></code> | MIME type of the file being uploaded. Accepted MINE types: `image/tiff`, `image/jpeg`, `image/png`, `application/pdf`
url <br /><code><a href='#string'>string</a></code> | URL of the file, including access tokens, of the file on Amazon S3. Note, the example URL has been truncated for display purposes.
  



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

#### Params

param | description
- | -
Content-Type<br /><code><a href='#string'>string</a></code> | MIME type of the file being uploaded. Accepted MINE types: `image/tiff`, `image/jpeg`, `image/png`, `application/pdf`. Must be included as a header.
data<br /><code><a href='#binary'>binary</a></code> | The binary data of the file.


### Get
Retrieves a single file upload.


#### Invocation

> Example Request

```shell
curl -XGET /v1/file_uploads/efbcc819-f25f-4bf4-afd4-198a035d5340
```

`GET /v1/file_uploads/:id`


> Example Response

```json
{
  "id": "efbcc819-f25f-4bf4-afd4-198a035d5340",
  "mime_type": "image/png",
  "url": "https://welkin-photos-prod-bdb45be0-464e.s3.amazonaws.com/2ab9791d-86f1-e50?AWSAccessKeyId=ASIA&Expires=153924&x-amz-security-token=FQoGZXdz&Signature=FjSiY"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Find
Finds file uploads, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/file_uploads
```

`GET /v1/file_uploads`


> Example Response

```json
[
  {
    "data": [
      {
        "id": "efbcc819-f25f-4bf4-afd4-198a035d5340",
        "mime_type": "image/png",
        "url": "https://welkin-photos-prod-bdb45be0-464e.s3.amazonaws.com/2ab9791d-86f1-e50?AWSAccessKeyId=ASIA&Expires=153924&x-amz-security-token=FQoGZXdz&Signature=FjSiY"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.627501+00:00",
        "page[to]": "2019-07-11T19:24:08.627530+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  




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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
status <br /><code><a href='#enum'>enum</a></code> | Status of the task. Possible options are, `unattempted`, `running`, `failed`, or `succeeded`
patient_id <br /><code><a href='#guid'>guid</a></code> | The ID of the [patient](#patients)
ref_ids <br /><code><a href='#array'>array</a> <a href='#string'>string</a></code> | Array of external IDs associated with the tasks, linking the task to the resource in external systems.
job_id <br /><code><a href='#string'>string</a></code> | Groups related tasks together
task_name <br /><code><a href='#string'>string</a></code> | The name of the task prefixed by the name of the job
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
errors <br /><code><a href='#array'>array</a> <a href='#integration-errors'>integration-errors</a></code> | Array of all the errors that resulted from this specific task. Note, these errors do not roll up to parent tasks.
  



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
Retrieves a single integration task.


#### Invocation

> Example Request

```shell
curl -XGET /v1/integration_tasks/9bf1e295-47f5-4027-a382-008c860694c2
```

`GET /v1/integration_tasks/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  







### Find
Finds integration tasks, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/integration_tasks
```

`GET /v1/integration_tasks`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.635926+00:00",
        "page[to]": "2019-07-11T19:24:08.635948+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
job_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Groups related tasks together
task_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The name of the task prefixed by the name of the job
ref_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | 
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





## Patients


Patients are the primary data object within Welkin. Almost all other data is attached to a patient.
[Emails](#email-addresses), [assessment responses](#assessment-responses), [care flows](#care-flows), and many more
resources are mapped directly to a specific patient.

There are no restrictions on patient data, so it's possible for duplicates to be created-on purpose or by accident.
Take care to ensure you are not duplicating a patient when creating a new one.

When using the Welkin API it's best to designate one system as the master system, and have the other systems be
followers. In this model, patients are created in only one source, limiting the possibility of duplicate patient
generation.


























### Model

> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
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
  "updated_at": "2018-09-12T01:27:32.108773+00:00",
  "created_at": "2018-09-12T01:27:32.109872+00:00"
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
phase <br /><code><a href='#enum'>enum</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
primary_worker_id <br /><code><a href='#guid'>guid</a></code> | ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
coach_id <br /><code><a href='#guid'>guid</a></code> | (Deprecated) ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
timezone <br /><code><a href='#timezone'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#string'>string</a></code> | First name of this patient
last_name <br /><code><a href='#string'>string</a></code> | Last name of this patient
birthday <br /><code><a href='#isodate'>isodate</a></code> | Date of birth of this patient
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
street <br /><code><a href='#string'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#string'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#string'>string</a></code> | City of this patient's address
county <br /><code><a href='#string'>string</a></code> | County in which this patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#zip_code'>zip_code</a></code> | Zip code of this patient's address in five digit form
state <br /><code><a href='#state'>state</a></code> | Two character abbreviation of the state in which this patient resides
country <br /><code><a href='#country'>country</a></code> | Country in which this patient lives
primary_language <br /><code><a href='#language'>language</a></code> | This patient's primary language. Available options are ["english", "spanish", "vietnamese", "tagalog", "chinese", "arabic", "korean", "punjabi", "russian", "other"]
gender <br /><code><a href='#string'>string</a></code> | Gender of this patient
height <br /><code><a href='#string'>string</a></code> | The two digit height of this patient in inches.
weight <br /><code><a href='#string'>string</a></code> | The weight of this patient in pounds.
smokes <br /><code><a href='#boolean'>boolean</a></code> | `true` or `false` for whether this patient smokes.
  




### Create


Creates a new patient.





#### Invocation

> Example Request

```shell
curl -XPOST /v1/patients -d '{
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
  "external_ids": [
    {
      "external_id": "abc-123",
      "namespace": "ehr"
    }
  ]
}'
```

`POST /v1/patients -d { }`


> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
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
  "updated_at": "2018-09-12T01:27:32.108773+00:00",
  "created_at": "2018-09-12T01:27:32.109872+00:00"
}
```

#### Params


param | description
- | -
phase <br /><code><a href='#provider_code'>provider_code</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
primary_worker_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
coach_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
timezone <br /><code><a href='#timezone'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#name'>name</a></code> | First name of this patient
last_name <br /><code><a href='#name'>name</a></code> | Last name of this patient
birthday <br /><code><a href='#birthday'>birthday</a></code> | Date of birth of this patient
street <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | City of this patient's address
county <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | County in which this patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Zip code of this patient's address in five digit form
state <br /><code><a href='#optional'>optional</a> <a href='#address_state'>address_state</a></code> | Two character abbreviation of the state in which this patient resides
country <br /><code><a href='#optional'>optional</a> <a href='#country'>country</a></code> | Country in which this patient lives
primary_language <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | This patient's primary language. Available options are ["english", "spanish", "vietnamese", "tagalog", "chinese", "arabic", "korean", "punjabi", "russian", "other"]
gender <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Gender of this patient
height <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The two digit height of this patient in inches.
weight <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The weight of this patient in pounds.
smokes <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` or `false` for whether this patient smokes.
email <br /><code><a href='#optional'>optional</a> <a href='#email'>email</a></code> | (Deprecated) Email addresses should be created via the [email address](#email-addresses) endpoint.
external_ids <br /><code><a href='#optional'>optional</a> <a href='#list(object)'>list(object)</a></code> | (Provisional) A convenience field which creates a patient and an [external id mapping](#external-ids-provisional) at the same time. The ID of this mapping can be fetched from the [external ids](#external-ids-provisional) endpoint.
phone <br /><code><a href='#optional'>optional</a> <a href='#e164_phone'>e164_phone</a></code> | (Deprecated) Phone numbers should be created via the [phone number](#phone-numbers) endpoint.
  




### Update
Updates an existing patient.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/patients/45ceeba9-4944-43d1-b34d-0c36846acd4c -d '{
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
  "smokes": "false"
}'
```

`PUT /v1/patients/:id -d { }`


> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
  "phase": "intake",
  "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
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
  "updated_at": "2018-09-12T01:27:32.108773+00:00",
  "created_at": "2018-09-12T01:27:32.109872+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
phase <br /><code><a href='#optional'>optional</a> <a href='#provider_code'>provider_code</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
primary_worker_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
coach_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) ID of the [worker](#workers) who is the primary [worker](#workers) for this [patient](#patients).
timezone <br /><code><a href='#optional'>optional</a> <a href='#timezone'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#optional'>optional</a> <a href='#name'>name</a></code> | First name of this patient
last_name <br /><code><a href='#optional'>optional</a> <a href='#name'>name</a></code> | Last name of this patient
birthday <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date of birth of this patient
street <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | City of this patient's address
county <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | County in which this patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Zip code of this patient's address in five digit form
state <br /><code><a href='#optional'>optional</a> <a href='#address_state'>address_state</a></code> | Two character abbreviation of the state in which this patient resides
country <br /><code><a href='#optional'>optional</a> <a href='#country'>country</a></code> | Country in which this patient lives
primary_language <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | This patient's primary language. Available options are ["english", "spanish", "vietnamese", "tagalog", "chinese", "arabic", "korean", "punjabi", "russian", "other"]
gender <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Gender of this patient
height <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The two digit height of this patient in inches.
weight <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The weight of this patient in pounds.
smokes <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` or `false` for whether this patient smokes.
  





### Find
Finds patients, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/patients
```

`GET /v1/patients`


> Example Response

```json
[
  {
    "data": [
      {
        "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c",
        "phase": "intake",
        "primary_worker_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054",
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
        "updated_at": "2018-09-12T01:27:32.108773+00:00",
        "created_at": "2018-09-12T01:27:32.109872+00:00"
      }
    ],
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.687776+00:00",
        "page[to]": "2019-07-11T19:24:08.687804+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
patient_id <br /><code><a href='#guid'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#guid'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#e164_phone'>e164_phone</a></code> | The phone number to be associated with the patient. Must be in international, E.164 format. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#boolean'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single phone number.


#### Invocation

> Example Request

```shell
curl -XGET /v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f
```

`GET /v1/phone_numbers/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create






#### Invocation

> Example Request

```shell
curl -XPOST /v1/phone_numbers -d '{
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f",
  "user_id": "25697132-2736-4bf4-a2bc-b07cced5deb3",
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}'
```

`POST /v1/phone_numbers -d { }`


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

#### Params


param | description
- | -
patient_id <br /><code><a href='#guid'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#e164_phone'>e164_phone</a></code> | The phone number to be associated with the patient. Must be in international, E.164 format. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
  




### Update
Updates an existing phone number.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -d '{
  "phone_number": "+15555555555",
  "phone_number_type": "landline",
  "friendly_name": "main number",
  "verified": false,
  "opted_in_to_sms": true,
  "opted_in_to_call_recording": false,
  "opted_in_to_voicemail": false,
  "opted_in_to_phone": true,
  "automatic_recipient": false
}'
```

`PUT /v1/phone_numbers/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
phone_number <br /><code><a href='#optional'>optional</a> <a href='#e164_phone'>e164_phone</a></code> | The phone number to be associated with the patient. Must be in international, E.164 format. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) identity details. Default `false`
opted_in_to_sms <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
  




### Delete






#### Invocation

> Example Request

```shell
curl -XDELETE /v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f
```

`DELETE /v1/phone_numbers/:id`


> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Find
Finds phone numbers, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/phone_numbers
```

`GET /v1/phone_numbers`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.709999+00:00",
        "page[to]": "2019-07-11T19:24:08.710026+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | (Deprecated) The identifier of the [patient](#patients) which this phone number is associated.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
start_date <br /><code><a href='#date'>date</a></code> | The date on which the relationship began between entity 1 and entity 2. This date must be in the past relative to current time.
end_date <br /><code><a href='#date'>date</a></code> | The date on which the relationship ended between entity 1 and entity 2. This date must be in the past relative to current time and must be after `start_date`.
archived_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | The date when the relationship was archived (hidden from [workers](#workers) in Welkin).
entity_1_id <br /><code><a href='#guid'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 1 as defined in [Workshop](https://workshop.welkinhealth.com).
entity_2_id <br /><code><a href='#guid'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 2 as defined in [Workshop](https://workshop.welkinhealth.com).
relationship_type_id <br /><code><a href='#string'>string</a></code> | The ID of the relationship type as defined in [Workshop](https://workshop.welkinhealth.com). This relationship type defines the roles that entity 1 and entity 2 fulfill in the relationship.
  



### Get
Retrieves a single relationship record.


#### Invocation

> Example Request

```shell
curl -XGET /v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c
```

`GET /v1/relationship_records/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create
Creates a new relationship record.


#### Invocation

> Example Request

```shell
curl -XPOST /v1/relationship_records -d '{
  "start_date": "2018-02-02",
  "end_date": "2018-12-17",
  "entity_1_id": "35ceeba9-5944-46d1-e34d-1c36846eee3b",
  "entity_2_id": "12cedba8-4344-22d2-e14d-2c23666edc12",
  "relationship_type_id": "family_member"
}'
```

`POST /v1/relationship_records -d { }`


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

#### Params


param | description
- | -
start_date <br /><code><a href='#date'>date</a></code> | The date on which the relationship began between entity 1 and entity 2. This date must be in the past relative to current time.
end_date <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | The date on which the relationship ended between entity 1 and entity 2. This date must be in the past relative to current time and must be after `start_date`.
entity_1_id <br /><code><a href='#guid'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 1 as defined in [Workshop](https://workshop.welkinhealth.com).
entity_2_id <br /><code><a href='#guid'>guid</a></code> | The ID of the entity ([patient](#patients), [worker](#workers), or profile) filling the role of entity 2 as defined in [Workshop](https://workshop.welkinhealth.com).
relationship_type_id <br /><code><a href='#string'>string</a></code> | The ID of the relationship type as defined in [Workshop](https://workshop.welkinhealth.com). This relationship type defines the roles that entity 1 and entity 2 fulfill in the relationship.
  




### Update
Updates an existing relationship record.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c -d '{
  "start_date": "2018-02-02",
  "end_date": "2018-12-17"
}'
```

`PUT /v1/relationship_records/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
start_date <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | The date on which the relationship began between entity 1 and entity 2. This date must be in the past relative to current time.
end_date <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | The date on which the relationship ended between entity 1 and entity 2. This date must be in the past relative to current time and must be after `start_date`.
  




### Delete


Archive a specific relationship. Archived relationships no longer show up in the coach portal but do still exist in
the data.




#### Invocation

> Example Request

```shell
curl -XDELETE /v1/relationship_records/45ceeba9-4944-43d1-b34d-0c36846acd4c
```

`DELETE /v1/relationship_records/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Find
Finds relationship records, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/relationship_records
```

`GET /v1/relationship_records`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.724203+00:00",
        "page[to]": "2019-07-11T19:24:08.724232+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
relationship_type_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The ID of the relationship type as defined in [Workshop](https://workshop.welkinhealth.com). This relationship type defines the roles that entity 1 and entity 2 fulfill in the relationship.
entity_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | The ID of an entity to find relationships for. This entity can fulfill entity 1 or entity 2 in the relationship.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) who sent or received this message. Must match the [patient](#patients) participant of the [conversation](#conversations).
worker_id <br /><code><a href='#guid'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#guid'>guid</a></code> | ID of the [conversation](#conversations) that contains this message
direction <br /><code><a href='#enum'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#string'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#boolean'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
sent_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single sms message.


#### Invocation

> Example Request

```shell
curl -XGET /v1/sms_messages/0adfd8b0-3497-48fc-8ffa-eb2add2cde26
```

`GET /v1/sms_messages/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create


Create a new message which will be visible in the [conversation](#conversations) view of the [Patient](#patients)
profile.

<aside>Creating an SMS Message will send that message to the <a href="#patients">patient</a> only if the
<code>welkin_send</code> parameter is <code>true</code>. Creating the message resource via this api without setting <code>welkin_send</code> to
<code>true</code> only records that the message was sent to the <a href="#patients">patient</a>.</aside>




#### Invocation

> Example Request

```shell
curl -XPOST /v1/sms_messages -d '{
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f",
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0",
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31",
  "direction": "inbound",
  "contents": "Hi Developer, Welcome to Welkin Health.",
  "automatically_sent": false,
  "sent_at": "2018-09-12T01:27:32.045046+00:00"
}'
```

`POST /v1/sms_messages -d { }`


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

#### Params


param | description
- | -
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) who sent or received this message. Must match the [patient](#patients) participant of the [conversation](#conversations).
worker_id <br /><code><a href='#guid'>guid</a></code> | ID of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#guid'>guid</a></code> | ID of the [conversation](#conversations) that contains this message
direction <br /><code><a href='#enum'>enum</a></code> | Direction of the message from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#string'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#boolean'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
sent_at <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
welkin_send <br /><code><a href='#boolean'>boolean</a></code> | Indicates if Welkin should send the message for outbound SMS messages
  






### Find
Finds sms messages, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/sms_messages
```

`GET /v1/sms_messages`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.739952+00:00",
        "page[to]": "2019-07-11T19:24:08.739979+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [patient](#patients) who sent or received this message. Must match the [patient](#patients) participant of the [conversation](#conversations).
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
date <br /><code><a href='#string'>string</a></code> | The initial date of this unavailability, in the format `YYYY-MM-DD` in the worker's local timezone.
all_day <br /><code><a href='#boolean'>boolean</a></code> | `true` if this unavailability will last the whole day
start_time <br /><code><a href='#string'>string</a></code> | The start time of a worker's unavailability in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#string'>string</a></code> | The ending time of a worker's unavailability (inclusive) in their local timezone. Uses 24-hour time notation
recurrence <br /><code><a href='#enum'>enum</a></code> | The frequency at which this block of unavailable time repeats. If specified, this unavailable time block will repeat at this interval until the unavailable time block is deleted. Possible values `none`, `daily`, or `weekly`
calendar_id <br /><code><a href='#guid'>guid</a></code> | The ID of the calendar this day belongs to
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on the associated calendar)
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single unavailable time.


#### Invocation

> Example Request

```shell
curl -XGET /v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f
```

`GET /v1/unavailable_times/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create






#### Invocation

> Example Request

```shell
curl -XPOST /v1/unavailable_times -d '{
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly",
  "calendar_id": "4d9a06b3-4568-488e-820c-217f628b0ea4"
}'
```

`POST /v1/unavailable_times -d { }`


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

#### Params


param | description
- | -
date <br /><code><a href='#date'>date</a></code> | The initial date of this unavailability, in the format `YYYY-MM-DD` in the worker's local timezone.
all_day <br /><code><a href='#boolean'>boolean</a></code> | `true` if this unavailability will last the whole day
start_time <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The start time of a worker's unavailability in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The ending time of a worker's unavailability (inclusive) in their local timezone. Uses 24-hour time notation
recurrence <br /><code><a href='#enum'>enum</a></code> | The frequency at which this block of unavailable time repeats. If specified, this unavailable time block will repeat at this interval until the unavailable time block is deleted. Possible values `none`, `daily`, or `weekly`
calendar_id <br /><code><a href='#guid'>guid</a></code> | The ID of the calendar this day belongs to
  




### Update
Updates an existing unavailable time.


#### Invocation

> Example Request

```shell
curl -XPUT /v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f -d '{
  "date": "2019-01-02",
  "all_day": false,
  "start_time": "12:00:00",
  "end_time": "14:30:00",
  "recurrence": "weekly"
}'
```

`PUT /v1/unavailable_times/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
date <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | The initial date of this unavailability, in the format `YYYY-MM-DD` in the worker's local timezone.
all_day <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` if this unavailability will last the whole day
start_time <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The start time of a worker's unavailability in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The ending time of a worker's unavailability (inclusive) in their local timezone. Uses 24-hour time notation
recurrence <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | The frequency at which this block of unavailable time repeats. If specified, this unavailable time block will repeat at this interval until the unavailable time block is deleted. Possible values `none`, `daily`, or `weekly`
  




### Delete






#### Invocation

> Example Request

```shell
curl -XDELETE /v1/unavailable_times/7bbe0d77-9deb-4e81-8aff-6fb5d112e85f
```

`DELETE /v1/unavailable_times/:id`


> Example Response

```json
{
  "data": null
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Find
Finds unavailable times, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/unavailable_times
```

`GET /v1/unavailable_times`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.754984+00:00",
        "page[to]": "2019-07-11T19:24:08.755012+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#string'>string</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
first_name <br /><code><a href='#string'>string</a></code> | Worker's first name
last_name <br /><code><a href='#string'>string</a></code> | Worker's last name
phone_number <br /><code><a href='#string'>string</a></code> | Direct line phone number of the worker in international, E.164 format.
timezone <br /><code><a href='#string'>string</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#string'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
role_ids <br /><code><a href='#list(string)'>list(string)</a></code> | The human readable and chosen IDs of the roles of this worker. The set of possible roles for your program are defined in [Workshop](https://workshop.welkinhealth.com)
roles <br /><code><a href='#list(string)'>list(string)</a></code> | (Deprecated) The database/code ID of the roles that a worker has. This is deprecated due to the fact that these IDs are not exposed or controllable in workshop.
active <br /><code><a href='#boolean'>boolean</a></code> | The worker account is in an active state and can be used to log in. Default is False.
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single worker.


#### Invocation

> Example Request

```shell
curl -XGET /v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f
```

`GET /v1/workers/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  




### Create


Creates a new worker. The new worker will have no password and the worker must go through the password reset flow
before they can log in.

In order to create workers you must have this functionality enabled by Welkin. Please contact
your implementation manager or customer success manager to have this functionality enabled for your program.




#### Invocation

> Example Request

```shell
curl -XPOST /v1/workers -d '{
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
}'
```

`POST /v1/workers -d { }`


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

#### Params


param | description
- | -
email <br /><code><a href='#email'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
first_name <br /><code><a href='#name'>name</a></code> | Worker's first name
last_name <br /><code><a href='#name'>name</a></code> | Worker's last name
phone_number <br /><code><a href='#optional'>optional</a> <a href='#phone'>phone</a></code> | Direct line phone number of the worker in international, E.164 format.
timezone <br /><code><a href='#timezone'>timezone</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
role_ids <br /><code><a href='#list(string)'>list(string)</a></code> | The human readable and chosen IDs of the roles of this worker. The set of possible roles for your program are defined in [Workshop](https://workshop.welkinhealth.com)
active <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | The worker account is in an active state and can be used to log in. Default is False.
  




### Update


Updates an existing worker.

In order to update workers you must have this functionality enabled by Welkin. Please contact
your implementation manager or customer success manager to have this functionality enabled for your program.




#### Invocation

> Example Request

```shell
curl -XPUT /v1/workers/0d5de756-cdda-4cc0-9cca-bcdc36b1a92f -d '{
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
}'
```

`PUT /v1/workers/:id -d { }`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#optional'>optional</a> <a href='#email'>email</a></code> | Email address of the worker. This is also used as the username of the worker when logging into the Welkin Portal.
first_name <br /><code><a href='#optional'>optional</a> <a href='#name'>name</a></code> | Worker's first name
last_name <br /><code><a href='#optional'>optional</a> <a href='#name'>name</a></code> | Worker's last name
phone_number <br /><code><a href='#optional'>optional</a> <a href='#phone'>phone</a></code> | Direct line phone number of the worker in international, E.164 format.
timezone <br /><code><a href='#optional'>optional</a> <a href='#timezone'>timezone</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
role_ids <br /><code><a href='#optional'>optional</a> <a href='#list(string)'>list(string)</a></code> | The human readable and chosen IDs of the roles of this worker. The set of possible roles for your program are defined in [Workshop](https://workshop.welkinhealth.com)
active <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | The worker account is in an active state and can be used to log in. Default is False.
  





### Find
Finds workers, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/workers
```

`GET /v1/workers`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.775011+00:00",
        "page[to]": "2019-07-11T19:24:08.775041+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  





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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
day <br /><code><a href='#enum'>enum</a></code> | The day of the week that these working hours apply to. Possible options are `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, or `Sunday`
day_off <br /><code><a href='#boolean'>boolean</a></code> | `true` if a worker has designated this as a non-working day
start_time <br /><code><a href='#string'>string</a></code> | The start time of a worker's work day in their local timezone. Uses 24-hour time notation
end_time <br /><code><a href='#string'>string</a></code> | The ending time of a worker's work day (inclusive) in their local timezone. Uses 24-hour time notation
calendar_id <br /><code><a href='#guid'>guid</a></code> | The ID of the calendar this day belongs to
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on the associated calendar)
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  



### Get
Retrieves a single working hour.


#### Invocation

> Example Request

```shell
curl -XGET /v1/working_hours/fd6eb4a3-fa06-4b95-91f2-eea0e050da79
```

`GET /v1/working_hours/:id`


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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  







### Find
Finds working hours, using param filters.


#### Invocation

> Example Request

```shell
curl -XGET /v1/working_hours
```

`GET /v1/working_hours`


> Example Response

```json
[
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
    "meta": {
      "current": {
        "page[from]": "2019-07-11T19:24:08.783174+00:00",
        "page[to]": "2019-07-11T19:24:08.783202+00:00",
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  






# Additional Information

## Types

type | definition | example
- | - | -
boolean | JSON style boolean | `true`
email | `string` representing an email address | `"support@welkinhealth.com"`
enum | `string` with predefined set of values (also known as an enumeration) | `"Female"`
guid | `string` with 36 characters separated into groups by dashes 8-4-4-4-12. | `"45ceeba9-4944-43d1-b34d-0c36846acd4c"`
integer | Counting numbers with no decimal place including zero and negative numbers | `42`
isodatetime | `string` following [isodatetime format](https://en.wikipedia.org/wiki/ISO_8601) representing a date and time in UTC | `"2018-09-15T15:20:01"`
isodate | `string` following the [isodatetime format](https://en.wikipedia.org/wiki/ISO_8601) representing a day in the local timezone of the [worker](#workers) or [patient](#patients) | `"2018-09-15"`
json | `string` following [JSON format](https://en.wikipedia.org/wiki/JSON). Welkin may require the `json` to have a specific format depending on API endpoint. | `"{"foo": "bar"}"`
list(x) | JSON list of objects of type `x` | `["a", "b", "c"]`
e164_phone | `string` representing an international, E.164 formatted phone number without extensions or other dialing information. Country code must be included. | `"+15555551234"`
state | `string` of the capitalized two character United States state abbreviation | `"CA"`
string | Any quoted set of ASCII characters with no length restriction | `"Welcome to Welkin's APIs"`
timezone | `string` following [iana tz format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) | `"US/Pacific"`
zip_code | `string` of a five digit United States zip code | `"94110"`

<aside>GUIDs are global unique identifiers for objects within Welkin. These IDs are long lived for resources and are unique within and across resources.</aside>

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
[patient](#patients) | [email addresses](#email-addresses) | `email_addresses` | one to many
[patient](#patients) | [external ids](#external-ids) | `external_ids` | one to many
[patient](#patients) | [phone numbers](#phone-numbers) | `phone_numbers` | one to many
[patient](#patients) | [custom data type records](#custom-data-type-records) | `custom_date_type_records` | one to many
[email addresses](#email-addresses) | [patient](#patients) | `patient` | one to one
[phone numbers](#phone-numbers) | [patient](#patients) | `patient` | one to one

<aside>If creation of one of the resources fails then the entire transaction fails and none of the resources are created in Welkin.</aside>


