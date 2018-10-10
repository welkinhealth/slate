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

For testing purposes, Welkin provides a long-lived access token but the use of 2-legged OAuth is still required for production.

Once you obtain an access token, the token can be passed as an Authorization header along with the keyword `Bearer`.

More information on the JWT protocol can be found at [jwt.io](https://jwt.io/).

A simple guide to understanding JWT can befound in this [Medium article](https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec).

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

### Webhook body

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

### Webhook security
Welkin's APIs expect that the webhook destination is secured using [JWT Bearer Authorization](#authentication) in the same manor that our core API is secured. This ensures that patient data remains secure and protected at all times.

### Find endpoints
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
  "send_time": "2018-09-12T01:27:32.045046+00:00", 
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
direction <br /><code><a href='#enum'>enum</a></code> | Direction of the messsage from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#string'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#boolean'>boolean</a></code> | Denotes whether the message was created and sent from Welkin by a [worker](#workers), or via automated process
send_time <br /><code><a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
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
  "send_time": "2018-09-12T01:27:32.045046+00:00", 
  "updated_at": "2018-09-12T01:27:32.045196+00:00", 
  "created_at": "2018-09-12T01:27:32.045336+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  


### Create


New messages can be created in a [Patient](#patients)  Profile. Messages created in Welkin are recorded in the
[conversation](#conversations) view.

<aside>Creating a message record does NOT cause that message to be sent to the <a href="#patients">patient</a>.</aside>





#### Invocation

> Example Request

```shell
curl -XPOST /v1/app_messages -d '{
  "patient_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f", 
  "worker_id": "a1fa82d9-19e0-4114-a6d1-6745f8eaeff0", 
  "conversation_id": "2e045bdd-0083-4341-bc37-9a81d990da31", 
  "direction": "inbound", 
  "contents": "Hi Developer, Welcome to Welkin Health.", 
  "send_time": "2018-09-12T01:27:32.045046+00:00"
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
  "send_time": "2018-09-12T01:27:32.045046+00:00", 
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
direction <br /><code><a href='#enum'>enum</a></code> | Direction of the messsage from the perspective of the [worker](#workers)  (`inbound` or `outbound`)
contents <br /><code><a href='#string'>string</a></code> | Text of the message
send_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent
  

  
  


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
        "send_time": "2018-09-12T01:27:32.045046+00:00", 
        "updated_at": "2018-09-12T01:27:32.045196+00:00", 
        "created_at": "2018-09-12T01:27:32.045336+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-10-10T22:26:26.964899+00:00", 
        "page[to]": "2018-10-10T22:26:26.964925+00:00", 
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
  "spec_id": "intake_assessment", 
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
spec_id <br /><code><a href='#string'>string</a></code> | (Deprecated) ID of the assessment which this response corresponds to.
spec_name <br /><code><a href='#string'>string</a></code> | The ref_name for the assessment as it appears in workshop.
spec_version <br /><code><a href='#string'>string</a></code> | Optionally, the version string of assessment spec. If not specified, the assessment spec most recently authored in Workshop will be used.
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
  "spec_id": "intake_assessment", 
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
  "spec_id": "intake_assessment", 
  "spec_name": "some_string", 
  "spec_version": "some_string", 
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
  "spec_id": "intake_assessment", 
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
spec_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | (Deprecated) ID of the assessment which this response corresponds to.
spec_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The ref_name for the assessment as it appears in workshop.
spec_version <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Optionally, the version string of assessment spec. If not specified, the assessment spec most recently authored in Workshop will be used.
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients)
model <br /><code><a href='#anything'>anything</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
title <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The title for the assessment. If not specified, the default title (configured in Workshop) will be used.
  

  
  


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
        "spec_id": "intake_assessment", 
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
        "page[from]": "2018-10-10T22:26:26.973253+00:00", 
        "page[to]": "2018-10-10T22:26:26.973270+00:00", 
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


Calendar events are appointments on worker [calenders](#calendars). They're in reference to a [patient](#patients). A
calendar event can be scheduled for a date and time or simply for a date.

<aside>All calendar events have an associated appointment prompt which will trigger at the time of the event. Valid
appointment prompts are specific to your implementation of Welkin. The
range of appointment prompts can be found in <a href="https://workshop.welkinhealth.com">Workshop</a>.</aside>














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
start_time <br /><code><a href='#isodatetime'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time <br /><code><a href='#isodatetime'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day
day <br /><code><a href='#optional'>optional</a> <a href='#isodate'>isodate</a></code> | Date of the calendar event if not scheduled for a specific time of day
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
  

  
  

### Create
Creates a new calendar event.



#### Invocation

> Example Request

```shell
curl -XPOST /v1/calendar_events -d '{
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d", 
  "patient_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "user_id": "aaa312cf-86ff-4629-b3fd-a1a9c6d1f7fd", 
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
        "page[from]": "2018-10-10T22:26:26.985210+00:00", 
        "page[to]": "2018-10-10T22:26:26.985228+00:00", 
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


Calendars link [Calendar Events](#calendar-events) to [Workers](#workers).

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
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on this calendar)
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
        "page[from]": "2018-10-10T22:26:26.989340+00:00", 
        "page[to]": "2018-10-10T22:26:26.989358+00:00", 
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
description | `string` | Description of the overall Care Flow
diagnosis | `string` |
goals | `list` | List of [goal objects](#model-goal)

### Model Goal
field | type | description
- | - | -
title | `string` | Title of the Care Flow goal
interventions | `list` | List of [goal intervention objects](#model-intervention)

### Model Intervention
field | type | description | optional
- | - | - | -
title | `string` | Title of the Care Flow intervention
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
        "page[from]": "2018-10-10T22:26:26.992560+00:00", 
        "page[to]": "2018-10-10T22:26:26.992573+00:00", 
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


Conversations track the text-based conversations between [worker](#workers) and [patient](#patients).

Text-based communications supported by Welkin include, SMS, email, and in-app messaging.

<aside>There may be multiple conversations of each conversation type with a single patient.</aside>






### Model

> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca", 
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88", 
  "conversation_type": "app", 
  "updated_at": "2018-09-12T01:27:32.031245+00:00", 
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) which this conversation is with
conversation_type <br /><code><a href='#enum'>enum</a></code> | `app` (Welkin 1st party in app notification), `third_party_app` (In app and push notifications to 3rd party apps), `phone` (SMS messages), `email`
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
Creates a new conversation.



#### Invocation

> Example Request

```shell
curl -XPOST /v1/conversations -d '{
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88"
}'
```

`POST /v1/conversations -d { }`
  

> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca", 
  "patient_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88", 
  "conversation_type": "app", 
  "updated_at": "2018-09-12T01:27:32.031245+00:00", 
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#guid'>guid</a></code> | ID of the [patient](#patients) which this conversation is with
  

  
  


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
        "updated_at": "2018-09-12T01:27:32.031245+00:00", 
        "created_at": "2018-09-12T01:27:32.031362+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-10-10T22:26:26.996915+00:00", 
        "page[to]": "2018-10-10T22:26:26.996926+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
patient_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | ID of the [patient](#patients) which this conversation is with
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
type_name <br /><code><a href='#string'>string</a></code> | Name of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
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
type_name <br /><code><a href='#string'>string</a></code> | Name of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
  

  
  


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
        "page[from]": "2018-10-10T22:26:27.003331+00:00", 
        "page[to]": "2018-10-10T22:26:27.003344+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
type_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The earliest timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The latest timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Email Addresses


Manage [patient](#patients) email addresses based on [patient](#patients) consent.

Each [patient](#patients) email address has it's own consents and opt-in status. When setting the consent flags on
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
  

  
  

### Create







#### Invocation

> Example Request

```shell
curl -XPOST /v1/email_addresses -d '{
  "email": "developer@welkinhealth.com", 
  "friendly_name": "developer contact", 
  "patient_id": "14492e35-c4e4-4235-8175-aa874321144e", 
  "user_id": "fe388336-9864-4e82-85c4-59b2f6dba995", 
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
        "page[from]": "2018-10-10T22:26:27.012165+00:00", 
        "page[to]": "2018-10-10T22:26:27.012181+00:00", 
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

<aside>Duplicate values within the same namespace will be rejected.</aside>









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
namespace <br /><code><a href='#string'>string</a></code> | Snake cased string seperating mappings of the same Welkin ID to multiple external IDs
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
namespace <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Snake cased string seperating mappings of the same Welkin ID to multiple external IDs
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
namespace <br /><code><a href='#string'>string</a></code> | Snake cased string seperating mappings of the same Welkin ID to multiple external IDs
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
        "page[from]": "2018-10-10T22:26:27.017838+00:00", 
        "page[to]": "2018-10-10T22:26:27.017851+00:00", 
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
namespace <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Snake cased string seperating mappings of the same Welkin ID to multiple external IDs
external_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the resource in 3rd party system. Can be any string format
welkin_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | ID of the resource within Welkin. Must be a valid existing Welkin GUID.
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
        "page[from]": "2018-10-10T22:26:27.022910+00:00", 
        "page[to]": "2018-10-10T22:26:27.022922+00:00", 
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
  "updated_at": "2018-09-12T01:27:32.108773+00:00", 
  "created_at": "2018-09-12T01:27:32.109872+00:00", 
  "street": "3265 17th St", 
  "street_line_two": "#304", 
  "city": "San Francisco", 
  "county": "San Francisco County", 
  "zip_code": "94110", 
  "state": "CA", 
  "country": "USA"
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
county <br /><code><a href='#string'>string</a></code> | County in which the patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#zip_code'>zip_code</a></code> | Zip code of this patient's address in five digit form
state <br /><code><a href='#state'>state</a></code> | Two character abbreviation of the state in which the patient resides
country <br /><code><a href='#string'>string</a></code> | Country in which the [patient](#patients) lives
  
  
  


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
  "birthday": "1906-12-09"
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
  "updated_at": "2018-09-12T01:27:32.108773+00:00", 
  "created_at": "2018-09-12T01:27:32.109872+00:00", 
  "street": "3265 17th St", 
  "street_line_two": "#304", 
  "city": "San Francisco", 
  "county": "San Francisco County", 
  "zip_code": "94110", 
  "state": "CA", 
  "country": "USA"
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
  "country": "USA", 
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
  "updated_at": "2018-09-12T01:27:32.108773+00:00", 
  "created_at": "2018-09-12T01:27:32.109872+00:00", 
  "street": "3265 17th St", 
  "street_line_two": "#304", 
  "city": "San Francisco", 
  "county": "San Francisco County", 
  "zip_code": "94110", 
  "state": "CA", 
  "country": "USA"
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
county <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | County in which the patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Zip code of this patient's address in five digit form
state <br /><code><a href='#optional'>optional</a> <a href='#address_state'>address_state</a></code> | Two character abbreviation of the state in which the patient resides
country <br /><code><a href='#optional'>optional</a> <a href='#country'>country</a></code> | Country in which the [patient](#patients) lives
email <br /><code><a href='#optional'>optional</a> <a href='#email'>email</a></code> | (Deprecated) Email addresses should be created via the [email address](#email-addresses) endpoint.
external_ids <br /><code><a href='#optional'>optional</a> <a href='#list(object)'>list(object)</a></code> | (Provisional) A convenience field which creates a patient and an [external id mapping](#external-ids-provisional) at the same time. The ID of this mapping can be fetched from the [external ids](#external-ids-provisional) endpoint.
phone <br /><code><a href='#optional'>optional</a> <a href='#phone'>phone</a></code> | (Deprecated) Phone numbers should be created via the [phone number](#phone-numbers) endpoint.
  

  
  


  

## Phone Numbers


Manage the availible phone based contact methods for a [patient](#patients). Phone based contact methods are
call and sms.

Each patient phone number has it's own consents and opt in status. When setting the consent flags on a phone number
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
  "phone_number": "555-555-5555", 
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
phone_number <br /><code><a href='#phone'>phone</a></code> | The phone number to be associated with the patient. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#boolean'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) indentity details. Default `false`
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
  "phone_number": "555-555-5555", 
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
  

  
  

### Update
Updates an existing phone number.



#### Invocation

> Example Request

```shell
curl -XPUT /v1/phone_numbers/c9a72425-f433-4c6c-9d95-4057b25acc2f -d '{
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
  "phone_number": "555-555-5555", 
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
phone_number_type <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) indentity details. Default `false`
opted_in_to_sms <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
  

  
  

### Create







#### Invocation

> Example Request

```shell
curl -XPOST /v1/phone_numbers -d '{
  "patient_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f", 
  "user_id": "b0ec9ded-9df8-4094-9e34-32266232637d", 
  "phone_number": "555-555-5555", 
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
  "phone_number": "555-555-5555", 
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
phone_number <br /><code><a href='#phone'>phone</a></code> | The phone number to be associated with the patient. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) indentity details. Default `false`
opted_in_to_sms <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving SMS at this number. Default `false`
opted_in_to_call_recording <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to calls at this number being recorded. Default `false`
opted_in_to_voicemail <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving voicemail at this number. Default `false`
opted_in_to_phone <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving calls at this number. Default `false`
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | `true` only if the [patient](#patients) has consented verbally, digitally, or in writing to receiving automated SMS messages at this number. Default `false`
  

  
  


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
        "phone_number": "555-555-5555", 
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
        "page[from]": "2018-10-10T22:26:27.056589+00:00", 
        "page[to]": "2018-10-10T22:26:27.056607+00:00", 
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
  

  
  
  

## Workers


Workers have access to the Welkin Portal and provide care to [patients](#patients).

Workers are assigned to [patients](#patients) as the patient's primary worker via <br />`patient.worker_id`











### Model

> Example Response

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
  "email": "developer@welkinhealth.com", 
  "first_name": "Emily", 
  "last_name": "Smith", 
  "phone_number": "555-555-5555", 
  "timezone": "US/Eastern", 
  "gender": "Transgender", 
  "roles": "CDE", 
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
phone_number <br /><code><a href='#string'>string</a></code> | Direct line phone number of the worker
timezone <br /><code><a href='#string'>string</a></code> | Timezone in which the worker's working hours should be represented
gender <br /><code><a href='#string'>string</a></code> | Gender of the worker. Possible values are, `Male`, `Female`, `Unknown`, `Other`, `Transgender`, and `Decline`
roles <br /><code><a href='#enum'>enum</a></code> | The roles of this worker. Possible roles are defined in [Workshop](https://workshop.welkinhealth.com).
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
  "phone_number": "555-555-5555", 
  "timezone": "US/Eastern", 
  "gender": "Transgender", 
  "roles": "CDE", 
  "updated_at": "2018-09-12T01:27:32.125123+00:00", 
  "created_at": "2018-09-12T01:27:32.125229+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  




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
        "phone_number": "555-555-5555", 
        "timezone": "US/Eastern", 
        "gender": "Transgender", 
        "roles": "CDE", 
        "updated_at": "2018-09-12T01:27:32.125123+00:00", 
        "created_at": "2018-09-12T01:27:32.125229+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-10-10T22:26:27.061732+00:00", 
        "page[to]": "2018-10-10T22:26:27.061745+00:00", 
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
phone | `string` representing a 10 digit phone number without extensions or other dialing information. Country code should not be included as Welkin only supports numbers with country code `+1`. | `"555-555-1234"`
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


