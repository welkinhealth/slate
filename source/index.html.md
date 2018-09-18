# Welkin API documentation
This documentation outlines the datatypes available via Welkin’s APIs and the usage of these APIs. APIs exist for all of the core datatypes managed within Welkin.

**Base URL:** https://api.welkinhealth.com

# Authentication
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
headers = 

resp = requests.post('https://api.welkinhealth.com/v1/patients', headers=headers).json()
```

Use of Welkin APIs requires the use of 2-legged OAuth using the JWT-Bearer flow. For testing purposes, Welkin will provide a long-lived access token but will require the use of 2-legged OAuth for production.

Once you obtain an access token, the token can should be passed as an Authorization header along with the keyword “Bearer”.

# Notification Job
Welkin sends a webhook notification to API consumer's servers when the state of any resource changes. The webhook includes which resources have changed, the time range of the changes, and a url to GET the deltas.

Change notification webhooks are delayed up to 60 seconds from the time of update.

<talk about what the expected flow is for using the API in conjunction with notifications>

<retry logic>

Webhook body
Each notification contains all the updates for all the resource types since the last successful notification.

> Example notification request body (JSON)

```json
[ { "resource": "patients",
    "from": "2018-05-14T23:34:05.647496",
    "to": "2018-05-15T23:34:05.647496",
    "href": "https://api.welkinhealth.com/v1/patients?page[to]=2018-05-15T23:34:05.647496&page[from]=2018-05-14T23:34:05.647496"}]
```

### Webhook request body model
field | type | description
- | - | -
- | list | List of data_update_notification objects

### data_update_notification model
field | type | description
- | - | -
resource | string | resource endpoint path name
from | isodatetime | date of first update
to | isodatetime | date of latest update
href | string | link to GET all updates for this notification

## Webhook security
<how do we authorize into the endpoint at the client>



# Assessment Responses






> Example Response

```json
{
  "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218", 
  "spec_id": "intake_assessment", 
  "user_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6", 
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

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
spec_id | `string` | Id of the assessment which this response corresponds to. This Id can be found in [Workshop](https://workshop.welkinhealth.com).
user_id | `guid` | Id of the [patient](#patients)
model | `anything` | Response data for assessment fields
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single assessment response.

### Invocation

```shell
curl -XGET /v1/assessment_responses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/assessment_responses/:id`
  

> Returns

```json
{
  "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218", 
  "spec_id": "intake_assessment", 
  "user_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6", 
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

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
  

  
  


## Create
Creates a new assessment response.

### Invocation

```shell
curl -XPOST /v1/assessment_responses -d 
```

`POST /v1/assessment_responses -d `
  

> Returns

```json
{
  "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218", 
  "spec_id": "intake_assessment", 
  "user_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6", 
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

###Params


param | type | description
- | - | -
spec_id | `string` | Id of the assessment which this response corresponds to. This Id can be found in [Workshop](https://workshop.welkinhealth.com).
user_id | `guid` | Id of the [patient](#patients)
model | `anything` | Response data for assessment fields
spec_name | `string` | 
spec_version | `string` | 
title | `string` | 
  

  
  


## Find
Finds  assessment responses, subject to filters.

### Invocation

```shell
curl -XGET /v1/assessment_responses
```

`GET /v1/assessment_responses`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "20c04e56-69f0-4d13-b5c1-a1763abd1218", 
        "spec_id": "intake_assessment", 
        "user_id": "81cea8e6-0d47-4af1-8c18-d4019208a8d6", 
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
        "page[from]": "2018-09-17T20:03:21.173481+00:00", 
        "page[to]": "2018-09-17T20:03:21.173505+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Calendar Events


Calendar events belong to a [worker calender](#calendars), and reference a [patient](#patients).
They can be scheduled for a time of day, or simply for a date.

<aside>All calendar events have an appointment type. Valid types are specific to your implementation of Welkin. The
range of appointment types can be found in [Workshop](https://workshop.welkinhealth.com).</aside>





> Example Response

```json
{
  "id": "f2baaf15-94d2-415d-b3e6-7409b643d297", 
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "is_all_day": false, 
  "start_time": "2018-09-10T18:56:19.357228+00:00", 
  "end_time": "2018-09-10T18:56:19.357540+00:00", 
  "day": null, 
  "outcome": "completed", 
  "modality": "phone", 
  "appointment_type": "intake_call", 
  "updated_at": "2018-09-10T18:56:19.359240+00:00", 
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
calendar_id | `guid` | Id of the [calendar](#calendars) on which this event resides
user_id | `guid` | Id of the [patient](#patients)
is_all_day | `boolean` | `true` if not scheduled for a specific time of day. `false` otherwise.
start_time | `isodatetime` | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time | `isodatetime` | Scheduled end time of the calendar event if scheduled for a specific time of day
day | `date` | Date of the calendar event if not scheduled for a specific time of day
outcome | `enum` | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no-show`)
modality | `enum` | Mode via which the event will take place (`call`, `visit`, `video`)
appointment_type | `string` | Type of appointment (see note for details)
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single calendar event.

### Invocation

```shell
curl -XGET /v1/calendar_events/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/calendar_events/:id`
  

> Returns

```json
{
  "id": "f2baaf15-94d2-415d-b3e6-7409b643d297", 
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "is_all_day": false, 
  "start_time": "2018-09-10T18:56:19.357228+00:00", 
  "end_time": "2018-09-10T18:56:19.357540+00:00", 
  "day": null, 
  "outcome": "completed", 
  "modality": "phone", 
  "appointment_type": "intake_call", 
  "updated_at": "2018-09-10T18:56:19.359240+00:00", 
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
  

  
  

## Update
Updates an existing calendar event.

### Invocation

```shell
curl -XPUT /v1/calendar_events/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/calendar_events/:id -d `
  

> Returns

```json
{
  "id": "f2baaf15-94d2-415d-b3e6-7409b643d297", 
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "is_all_day": false, 
  "start_time": "2018-09-10T18:56:19.357228+00:00", 
  "end_time": "2018-09-10T18:56:19.357540+00:00", 
  "day": null, 
  "outcome": "completed", 
  "modality": "phone", 
  "appointment_type": "intake_call", 
  "updated_at": "2018-09-10T18:56:19.359240+00:00", 
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
start_time | `isodatetime` | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time | `isodatetime` | Scheduled end time of the calendar event if scheduled for a specific time of day
day | `date` | Date of the calendar event if not scheduled for a specific time of day
outcome | `enum` | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no-show`)
  

  
  

## Create
Creates a new calendar event.

### Invocation

```shell
curl -XPOST /v1/calendar_events -d 
```

`POST /v1/calendar_events -d `
  

> Returns

```json
{
  "id": "f2baaf15-94d2-415d-b3e6-7409b643d297", 
  "calendar_id": "598de18b-b203-4947-be34-6871188cd81d", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "is_all_day": false, 
  "start_time": "2018-09-10T18:56:19.357228+00:00", 
  "end_time": "2018-09-10T18:56:19.357540+00:00", 
  "day": null, 
  "outcome": "completed", 
  "modality": "phone", 
  "appointment_type": "intake_call", 
  "updated_at": "2018-09-10T18:56:19.359240+00:00", 
  "created_at": "2018-09-10T18:56:19.359873+00:00"
}
```

###Params


param | type | description
- | - | -
calendar_id | `guid` | Id of the [calendar](#calendars) on which this event resides
user_id | `guid` | Id of the [patient](#patients)
start_time | `isodatetime` | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time | `isodatetime` | Scheduled end time of the calendar event if scheduled for a specific time of day
day | `date` | Date of the calendar event if not scheduled for a specific time of day
modality | `enum` | Mode via which the event will take place (`call`, `visit`, `video`)
appointment_type | `string` | Type of appointment (see note for details)
  

  
  


## Find
Finds  calendar events, subject to filters.

### Invocation

```shell
curl -XGET /v1/calendar_events
```

`GET /v1/calendar_events`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "f2baaf15-94d2-415d-b3e6-7409b643d297", 
        "calendar_id": "598de18b-b203-4947-be34-6871188cd81d", 
        "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
        "is_all_day": false, 
        "start_time": "2018-09-10T18:56:19.357228+00:00", 
        "end_time": "2018-09-10T18:56:19.357540+00:00", 
        "day": null, 
        "outcome": "completed", 
        "modality": "phone", 
        "appointment_type": "intake_call", 
        "updated_at": "2018-09-10T18:56:19.359240+00:00", 
        "created_at": "2018-09-10T18:56:19.359873+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.182092+00:00", 
        "page[to]": "2018-09-17T20:03:21.182113+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Calendars


Calendars link [Calendar Events](#calendar-events) to [Workers](#workers).

<aside>Each worker has one and only one calendar.</aside>





> Example Response

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
  "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5", 
  "updated_at": "2018-09-12T01:27:32.028059+00:00", 
  "created_at": "2018-09-12T01:27:32.028187+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
worker_id | `guid` | The ID of the worker who's calendar this is
updated_at | `isodatetime` | Datetime the resource was created (excluding updates to events on this calendar)
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single calendar.

### Invocation

```shell
curl -XGET /v1/calendars/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/calendars/:id`
  

> Returns

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
  "worker_id": "f9850af8-2ab0-4542-b281-cf4d5442bbd5", 
  "updated_at": "2018-09-12T01:27:32.028059+00:00", 
  "created_at": "2018-09-12T01:27:32.028187+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
  

  
  




## Find
Finds  calendars, subject to filters.

### Invocation

```shell
curl -XGET /v1/calendars
```

`GET /v1/calendars`
  

> Returns

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
        "page[from]": "2018-09-17T20:03:21.184115+00:00", 
        "page[to]": "2018-09-17T20:03:21.184130+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Care Flows



Care Flows represent a set of actions or tasks to be completed for a specific patient.

<aside>Care flows can be created from templates but are stored per patient and do not have a
connection back to the template from which they were been generated.</aside>





> Example Response

```json
{
  "id": "c68a80d4-95ea-4f61-bf90-615d70bea591", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "care_flow": null, 
  "updated_at": "2018-09-12T01:27:32.029691+00:00", 
  "created_at": "2018-09-12T01:27:32.029817+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
user_id | `guid` | The id of the [patient](#patients)
care_flow | `[care_flow object](#model-care_flow)` | List of [care_flow objects](#model-care_flow)
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

### Model care_flow
field | type | description
- | - | -
description | string | Description of the overall Care Flow
diagnosis | string |
goals | list | List of [goal objects](#model-goal)

### Model goal
field | type | description
- | - | -
title | string | Title of the Care Flow goal
interventions | list | List of [goal intervention objects](#model-intervention)

### Model intervention
field | type | description | optional
- | - | - | -
title | string | Title of the Care Flow intervention
reminder_date | isodatetime | Due date of the intervention | optional
completed_at | isodatetime | Date the intervention was marked completed | optional
completed_by_worker_id | guid | ID of the worker who completed this intervention | optional
worker_id | guid | ID of the worker who this intervention is assigned to | optional


## Get
Gets a single care flow.

### Invocation

```shell
curl -XGET /v1/care_flows/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/care_flows/:id`
  

> Returns

```json
{
  "id": "c68a80d4-95ea-4f61-bf90-615d70bea591", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "care_flow": null, 
  "updated_at": "2018-09-12T01:27:32.029691+00:00", 
  "created_at": "2018-09-12T01:27:32.029817+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
  

  
  




## Find
Finds  care flows, subject to filters.

### Invocation

```shell
curl -XGET /v1/care_flows
```

`GET /v1/care_flows`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "c68a80d4-95ea-4f61-bf90-615d70bea591", 
        "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
        "care_flow": null, 
        "updated_at": "2018-09-12T01:27:32.029691+00:00", 
        "created_at": "2018-09-12T01:27:32.029817+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.185985+00:00", 
        "page[to]": "2018-09-17T20:03:21.185996+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  


# Conversations


Text based conversations which [worker](#workers) have with [patient](#patients).

<aside>There may be multiple conversations of each conversation type with a single patient.</aside>





> Example Response

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca", 
  "user_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88", 
  "conversation_type": null, 
  "updated_at": "2018-09-12T01:27:32.031245+00:00", 
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
user_id | `guid` | Id of the [patient](#patients) which this conversation is with
conversation_type | `enum` | `app` (Welkin 1st party in app notification), `third_party_app` (In app and push notifications to 3rd party apps), `phone` (SMS messages), `email`
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single conversation.

### Invocation

```shell
curl -XGET /v1/conversations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/conversations/:id`
  

> Returns

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca", 
  "user_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88", 
  "conversation_type": null, 
  "updated_at": "2018-09-12T01:27:32.031245+00:00", 
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  


## Create
Creates a new conversation.

### Invocation

```shell
curl -XPOST /v1/conversations -d 
```

`POST /v1/conversations -d `
  

> Returns

```json
{
  "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca", 
  "user_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88", 
  "conversation_type": null, 
  "updated_at": "2018-09-12T01:27:32.031245+00:00", 
  "created_at": "2018-09-12T01:27:32.031362+00:00"
}
```

###Params


param | type | description
- | - | -
user_id | `guid` | Id of the [patient](#patients) which this conversation is with
  

  
  


## Find
Finds  conversations, subject to filters.

### Invocation

```shell
curl -XGET /v1/conversations
```

`GET /v1/conversations`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "bfa29e70-e328-4c3b-a3d1-7c2d959735ca", 
        "user_id": "0de64b35-2d04-40b6-b7a7-ba3d7eb50e88", 
        "conversation_type": null, 
        "updated_at": "2018-09-12T01:27:32.031245+00:00", 
        "created_at": "2018-09-12T01:27:32.031362+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.188348+00:00", 
        "page[to]": "2018-09-17T20:03:21.188363+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Custom Data Type Records





> Example Response

```json
{
  "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7", 
  "body": null, 
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
body | `anything` | 
user_id | `guid` | 
type_name | `string` | 
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single custom data type record.

### Invocation

```shell
curl -XGET /v1/custom_data_type_records/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/custom_data_type_records/:id`
  

> Returns

```json
{
  "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7", 
  "body": null, 
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  

## Update
Updates an existing custom data type record.

### Invocation

```shell
curl -XPUT /v1/custom_data_type_records/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/custom_data_type_records/:id -d `
  

> Returns

```json
{
  "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7", 
  "body": null, 
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
body | `anything` | 
  

  
  

## Create
Creates a new custom data type record.

### Invocation

```shell
curl -XPOST /v1/custom_data_type_records -d 
```

`POST /v1/custom_data_type_records -d `
  

> Returns

```json
{
  "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7", 
  "body": null, 
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

###Params


param | type | description
- | - | -
body | `anything` | 
user_id | `guid` | 
type_name | `string` | 
  

  
  


## Find
Finds  custom data type records, subject to filters.

### Invocation

```shell
curl -XGET /v1/custom_data_type_records
```

`GET /v1/custom_data_type_records`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "07ae21f7-c60e-42cb-ab7a-c80a3c445cc7", 
        "body": null, 
        "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
        "type_name": "hcp", 
        "updated_at": "2018-09-12T01:27:32.033666+00:00", 
        "created_at": "2018-09-12T01:27:32.033816+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.191702+00:00", 
        "page[to]": "2018-09-17T20:03:21.191722+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
type_name | `optional string` | 
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Email Addresses


Manage the availible email addresses at which coaches can contact the [patient](#patients).

Each [patient](#patients) email address has it's own consents and opt in status. When setting the consent flags on
a email address make sure that you have a record of how and when consent was received from the [patient](#patients).

<aside>There are no uniqueness constraints on email addresses. Unlike [phone numbers](#phone-numbers), emails back to
coaches will always be routed to the right patient even if two [patients](#patients) share the same email address.</aside>





> Example Response

```json
{
  "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd", 
  "email": "developer@welkinhealth.com", 
  "friendly_name": "developer contact", 
  "user_id": "14492e35-c4e4-4235-8175-aa874321144e", 
  "verified": false, 
  "opted_in_to_email": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.035940+00:00", 
  "created_at": "2018-09-12T01:27:32.036062+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
email | `email` | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name | `string` | Provides a name visible to [workers](#workers) to identify which address for the [patient](#patients) they are using.
user_id | `guid` | Id of the [patient](#patients) which this email address is associated with.
verified | `boolean` | True if and only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verify email. This does not guarantee that the email address is owned by the [patient](#patients). Note: this verification is not done by Welkin.
opted_in_to_email | `boolean` | True if and only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address.
automatic_recipient | `boolean` | True if and only if the [patient](#patients) as consented to receive automated emails at this email address.
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single email addresse.

### Invocation

```shell
curl -XGET /v1/email_addresses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/email_addresses/:id`
  

> Returns

```json
{
  "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd", 
  "email": "developer@welkinhealth.com", 
  "friendly_name": "developer contact", 
  "user_id": "14492e35-c4e4-4235-8175-aa874321144e", 
  "verified": false, 
  "opted_in_to_email": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.035940+00:00", 
  "created_at": "2018-09-12T01:27:32.036062+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  

## Update
Updates an existing email addresse.

### Invocation

```shell
curl -XPUT /v1/email_addresses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/email_addresses/:id -d `
  

> Returns

```json
{
  "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd", 
  "email": "developer@welkinhealth.com", 
  "friendly_name": "developer contact", 
  "user_id": "14492e35-c4e4-4235-8175-aa874321144e", 
  "verified": false, 
  "opted_in_to_email": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.035940+00:00", 
  "created_at": "2018-09-12T01:27:32.036062+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
email | `email` | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name | `string` | Provides a name visible to [workers](#workers) to identify which address for the [patient](#patients) they are using.
verified | `boolean` | True if and only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verify email. This does not guarantee that the email address is owned by the [patient](#patients). Note: this verification is not done by Welkin.
opted_in_to_email | `boolean` | True if and only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address.
automatic_recipient | `boolean` | True if and only if the [patient](#patients) as consented to receive automated emails at this email address.
  

  
  

## Create
Creates a new email addresse.

### Invocation

```shell
curl -XPOST /v1/email_addresses -d 
```

`POST /v1/email_addresses -d `
  

> Returns

```json
{
  "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd", 
  "email": "developer@welkinhealth.com", 
  "friendly_name": "developer contact", 
  "user_id": "14492e35-c4e4-4235-8175-aa874321144e", 
  "verified": false, 
  "opted_in_to_email": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.035940+00:00", 
  "created_at": "2018-09-12T01:27:32.036062+00:00"
}
```

###Params


param | type | description
- | - | -
email | `email` | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name | `string` | Provides a name visible to [workers](#workers) to identify which address for the [patient](#patients) they are using.
user_id | `guid` | Id of the [patient](#patients) which this email address is associated with.
verified | `boolean` | True if and only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verify email. This does not guarantee that the email address is owned by the [patient](#patients). Note: this verification is not done by Welkin.
opted_in_to_email | `boolean` | True if and only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address.
automatic_recipient | `boolean` | True if and only if the [patient](#patients) as consented to receive automated emails at this email address.
  

  
  


## Find
Finds  email addresses, subject to filters.

### Invocation

```shell
curl -XGET /v1/email_addresses
```

`GET /v1/email_addresses`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "0546cc93-7695-49c1-ab5e-3daf3fde12bd", 
        "email": "developer@welkinhealth.com", 
        "friendly_name": "developer contact", 
        "user_id": "14492e35-c4e4-4235-8175-aa874321144e", 
        "verified": false, 
        "opted_in_to_email": true, 
        "automatic_recipient": false, 
        "updated_at": "2018-09-12T01:27:32.035940+00:00", 
        "created_at": "2018-09-12T01:27:32.036062+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.197039+00:00", 
        "page[to]": "2018-09-17T20:03:21.197059+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
user_id | `optional guid` | Id of the [patient](#patients) which this email address is associated with.
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# External Ids (provisional)



ID sets must be unique
name can be anything but ...





> Example Response

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b", 
  "resource": "some_string", 
  "namespace": "some_string", 
  "external_id": "some_string", 
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
resource | `string` | String name of the resource collection that this Id is associated with. For example `workers`. :param namespace:
namespace | `string` | 
external_id | `string` | Id of the resource in 3rd party system. Can be any string format.
welkin_id | `guid` | 
  

  


## Update
Updates an existing external id.

### Invocation

```shell
curl -XPUT /v1/external_ids/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/external_ids/:id -d `
  

> Returns

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b", 
  "resource": "some_string", 
  "namespace": "some_string", 
  "external_id": "some_string", 
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
resource | `string` | String name of the resource collection that this Id is associated with. For example `workers`. :param namespace:
namespace | `string` | 
external_id | `string` | Id of the resource in 3rd party system. Can be any string format.
welkin_id | `guid` | 
  

  
  

## Create
Creates a new external id.

### Invocation

```shell
curl -XPOST /v1/external_ids -d 
```

`POST /v1/external_ids -d `
  

> Returns

```json
{
  "id": "76c5662c-1e16-4cfa-bbad-900e721a290b", 
  "resource": "some_string", 
  "namespace": "some_string", 
  "external_id": "some_string", 
  "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
}
```

###Params


param | type | description
- | - | -
resource | `string` | String name of the resource collection that this Id is associated with. For example `workers`. :param namespace:
namespace | `string` | 
external_id | `string` | Id of the resource in 3rd party system. Can be any string format.
welkin_id | `guid` | 
  

  
  


## Find
Finds  external ids, subject to filters.

### Invocation

```shell
curl -XGET /v1/external_ids
```

`GET /v1/external_ids`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "76c5662c-1e16-4cfa-bbad-900e721a290b", 
        "resource": "some_string", 
        "namespace": "some_string", 
        "external_id": "some_string", 
        "welkin_id": "e6cf56d8-a62d-4581-8339-91c846960041"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.199779+00:00", 
        "page[to]": "2018-09-17T20:03:21.199793+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
resource | `optional string` | String name of the resource collection that this Id is associated with. For example `workers`. :param namespace:
namespace | `optional string` | 
external_id | `optional string` | Id of the resource in 3rd party system. Can be any string format.
welkin_id | `optional string` | 
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  

# Integration Tasks (provisional)








> Example Response

```json
{
  "id": "9bf1e295-47f5-4027-a382-008c860694c2", 
  "status": "failed", 
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "provider_id": "c9a72425-f433-4c6c-9d95-0c36846acd2f", 
  "args": null, 
  "result": null, 
  "ref_ids": [
    "abc123", 
    "cdf456"
  ], 
  "job_id": "some_string", 
  "task_name": "some_string", 
  "updated_at": "2018-09-12T01:27:32.041332+00:00", 
  "created_at": "2018-09-12T01:27:32.041464+00:00", 
  "errors": null
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
status | `enum` | `unattempted`, `running`, `failed`, or `succeeded`
user_id | `guid` | Id of the [patient](#patients)
provider_id | `string` | 
args | `string` | 
result | `optional string` | 
ref_ids | `array string` | 
job_id | `string` | 
task_name | `string` | 
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
errors | `array integration-errors` | 
  

  

### Model integration error
field | type | description
- | - | -
code | string | Machine readable error code
message | string | Human readable error message
extra | string | JSON blob


## Get
Gets a single integration task.

### Invocation

```shell
curl -XGET /v1/integration_tasks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/integration_tasks/:id`
  

> Returns

```json
{
  "id": "9bf1e295-47f5-4027-a382-008c860694c2", 
  "status": "failed", 
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "provider_id": "c9a72425-f433-4c6c-9d95-0c36846acd2f", 
  "args": null, 
  "result": null, 
  "ref_ids": [
    "abc123", 
    "cdf456"
  ], 
  "job_id": "some_string", 
  "task_name": "some_string", 
  "updated_at": "2018-09-12T01:27:32.041332+00:00", 
  "created_at": "2018-09-12T01:27:32.041464+00:00", 
  "errors": null
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  




## Find
Finds  integration tasks, subject to filters.

### Invocation

```shell
curl -XGET /v1/integration_tasks
```

`GET /v1/integration_tasks`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "9bf1e295-47f5-4027-a382-008c860694c2", 
        "status": "failed", 
        "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
        "provider_id": "c9a72425-f433-4c6c-9d95-0c36846acd2f", 
        "args": null, 
        "result": null, 
        "ref_ids": [
          "abc123", 
          "cdf456"
        ], 
        "job_id": "some_string", 
        "task_name": "some_string", 
        "updated_at": "2018-09-12T01:27:32.041332+00:00", 
        "created_at": "2018-09-12T01:27:32.041464+00:00", 
        "errors": null
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.204217+00:00", 
        "page[to]": "2018-09-17T20:03:21.204230+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
job_id | `optional string` | 
task_name | `optional string` | 
ref_id | `optional string` | 
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  


# Mobile Messages



View and create messages which are shown in the [conversation](#conversations) view on
the [patient](#patients) profile in the coach portal.

<aside>Creating a message does NOT send that message to the [patient](#patients) . It records that the message was sent
to the [patient](#patients) . Sending must take place within a 3rd party system.</aside>





> Example Response

```json
{
  "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26", 
  "user_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f", 
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

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
user_id | `guid` | Id of the [patient](#patients) who sent or received this message.
worker_id | `guid` | Id of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id | `guid` | Id of the [conversation](#conversations) that this messages is contained in.
direction | `enum` | `inbound` or `outbound`
contents | `string` | Text of the message
automatically_sent | `boolean` | Was this message sent via an automated process or via direct [worker](#workers) action within Welkin.
send_time | `isodatetime` | Date and time when the message was sent.
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single message.

### Invocation

```shell
curl -XGET /v1/messages/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/messages/:id`
  

> Returns

```json
{
  "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26", 
  "user_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f", 
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

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  


## Create


Store a new message on the [patient's](#patients) profile. Messages created here display a record of communication
to the [worker](#workers).

<aside>Creating a message record does NOT cause that message to be sent to the [patient](#patients).</aside>



### Invocation

```shell
curl -XPOST /v1/messages -d 
```

`POST /v1/messages -d `
  

> Returns

```json
{
  "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26", 
  "user_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f", 
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

###Params


param | type | description
- | - | -
user_id | `guid` | Id of the [patient](#patients) who sent or received this message.
worker_id | `guid` | Id of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id | `guid` | Id of the [conversation](#conversations) that this messages is contained in.
direction | `enum` | `inbound` or `outbound`
contents | `string` | Text of the message
send_time | `isodatetime` | Date and time when the message was sent.
  

  
  


## Find
Finds  messages, subject to filters.

### Invocation

```shell
curl -XGET /v1/messages
```

`GET /v1/messages`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "0adfd8b0-3497-48fc-8ffa-eb2add2cde26", 
        "user_id": "65ae66fa-d1c0-4b98-bf0a-21cd6090229f", 
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
        "page[from]": "2018-09-17T20:03:21.209711+00:00", 
        "page[to]": "2018-09-17T20:03:21.209731+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  


# Patient Tasks






> Example Response

```json
{
  "id": "65567d1d-8ace-4db3-bdbe-c8693871f5d6", 
  "user_id": "6d868edb-4fd4-4c56-b450-eb6bdeb2c53a", 
  "task_type": "some_string", 
  "dismissed": null, 
  "updated_at": "2018-09-12T01:27:32.047351+00:00", 
  "created_at": "2018-09-12T01:27:32.047541+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
user_id | `guid` | 
task_type | `string` | 
dismissed | `boolean` | 
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single patient task.

### Invocation

```shell
curl -XGET /v1/patient_tasks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/patient_tasks/:id`
  

> Returns

```json
{
  "id": "65567d1d-8ace-4db3-bdbe-c8693871f5d6", 
  "user_id": "6d868edb-4fd4-4c56-b450-eb6bdeb2c53a", 
  "task_type": "some_string", 
  "dismissed": null, 
  "updated_at": "2018-09-12T01:27:32.047351+00:00", 
  "created_at": "2018-09-12T01:27:32.047541+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  


## Create
Creates a new patient task.

### Invocation

```shell
curl -XPOST /v1/patient_tasks -d 
```

`POST /v1/patient_tasks -d `
  

> Returns

```json
{
  "id": "65567d1d-8ace-4db3-bdbe-c8693871f5d6", 
  "user_id": "6d868edb-4fd4-4c56-b450-eb6bdeb2c53a", 
  "task_type": "some_string", 
  "dismissed": null, 
  "updated_at": "2018-09-12T01:27:32.047351+00:00", 
  "created_at": "2018-09-12T01:27:32.047541+00:00"
}
```

###Params


param | type | description
- | - | -
user_id | `guid` | 
task_type | `string` | 
  

  
  

## Delete
Deletes a single patient task.

### Invocation

```shell
curl -XDELETE /v1/patient_tasks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`DELETE /v1/patient_tasks/:id`
  

> Returns

```json
{
  "id": "65567d1d-8ace-4db3-bdbe-c8693871f5d6", 
  "user_id": "6d868edb-4fd4-4c56-b450-eb6bdeb2c53a", 
  "task_type": "some_string", 
  "dismissed": null, 
  "updated_at": "2018-09-12T01:27:32.047351+00:00", 
  "created_at": "2018-09-12T01:27:32.047541+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  

## Find
Finds  patient tasks, subject to filters.

### Invocation

```shell
curl -XGET /v1/patient_tasks
```

`GET /v1/patient_tasks`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "65567d1d-8ace-4db3-bdbe-c8693871f5d6", 
        "user_id": "6d868edb-4fd4-4c56-b450-eb6bdeb2c53a", 
        "task_type": "some_string", 
        "dismissed": null, 
        "updated_at": "2018-09-12T01:27:32.047351+00:00", 
        "created_at": "2018-09-12T01:27:32.047541+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.212882+00:00", 
        "page[to]": "2018-09-17T20:03:21.212901+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Patients





> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "phase": null, 
  "coach_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054", 
  "timezone": null, 
  "first_name": null, 
  "last_name": null, 
  "birthday": null, 
  "updated_at": "2018-09-12T01:27:32.108773+00:00", 
  "created_at": "2018-09-12T01:27:32.109872+00:00", 
  "street": "some_string", 
  "street_line_two": "some_string", 
  "city": "some_string", 
  "county": "some_string", 
  "zip_code": "some_string", 
  "state": null
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
phase | `provider_code` | 
coach_id | `guid` | 
timezone | `timezone` | 
first_name | `name` | 
last_name | `name` | 
birthday | `birthday` | 
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
street | `string` | 
street_line_two | `string` | 
city | `string` | 
county | `string` | 
zip_code | `string` | 
state | `address_state` | 
  

  


## Update
Updates an existing patient.

### Invocation

```shell
curl -XPUT /v1/patients/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/patients/:id -d `
  

> Returns

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "phase": null, 
  "coach_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054", 
  "timezone": null, 
  "first_name": null, 
  "last_name": null, 
  "birthday": null, 
  "updated_at": "2018-09-12T01:27:32.108773+00:00", 
  "created_at": "2018-09-12T01:27:32.109872+00:00", 
  "street": "some_string", 
  "street_line_two": "some_string", 
  "city": "some_string", 
  "county": "some_string", 
  "zip_code": "some_string", 
  "state": null
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
phase | `provider_code` | 
coach_id | `guid` | 
timezone | `timezone` | 
first_name | `name` | 
last_name | `name` | 
birthday | `birthday` | 
  

  
  

## Create
Creates a new patient.

### Invocation

```shell
curl -XPOST /v1/patients -d 
```

`POST /v1/patients -d `
  

> Returns

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "phase": null, 
  "coach_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054", 
  "timezone": null, 
  "first_name": null, 
  "last_name": null, 
  "birthday": null, 
  "updated_at": "2018-09-12T01:27:32.108773+00:00", 
  "created_at": "2018-09-12T01:27:32.109872+00:00", 
  "street": "some_string", 
  "street_line_two": "some_string", 
  "city": "some_string", 
  "county": "some_string", 
  "zip_code": "some_string", 
  "state": null
}
```

###Params


param | type | description
- | - | -
phase | `provider_code` | 
coach_id | `guid` | 
timezone | `timezone` | 
first_name | `name` | 
last_name | `name` | 
birthday | `birthday` | 
street | `string` | 
street_line_two | `string` | 
city | `string` | 
county | `string` | 
zip_code | `string` | 
state | `address_state` | 
country | `country` | 
email | `email` | 
external_ids | `list(object)` | 
phone | `phone` | 
  

  
  


  

# Phone Numbers


Manage the availible phone based contact methods for a [patient](#patients). Phone based contact methods are
call and sms.

Each patient phone number has it's own consents and opt in status. When setting the consent flags on a phone number
make sure that you have a record of how and when consent was received from the patient.

<aside>There are no uniqueness constraints on phone numbers but if two [patients](#patients) share the same
phone number calls and sms messages will be listed as unassigned in the coach portal rather than
associated directly with the [patient's](#patients) profile.</aside>





> Example Response

```json
{
  "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f", 
  "user_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f", 
  "phone_number": "555-555-5555", 
  "phone_number_type": "landline", 
  "friendly_name": "main number", 
  "verified": false, 
  "opted_in_to_sms": true, 
  "opted_in_to_call_recording": false, 
  "opted_in_to_voicemail": false, 
  "opted_on_to_phone": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.123172+00:00", 
  "created_at": "2018-09-12T01:27:32.123301+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
user_id | `guid` | The identifier of the [patient](#patients) which this phone number is associated.
phone_number | `phone` | The phone number to be associated with the patient. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type | `enum` | (`cell`, `landline`, `other`)
friendly_name | `string` | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers.
verified | `boolean` | True if and only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) details.
opted_in_to_sms | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving SMS at this number.
opted_in_to_call_recording | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to calls to this number being recorded.
opted_in_to_voicemail | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving voicemail at this number.
opted_in_to_phone | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving calls at this number.
automatic_recipient | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving automated SMS messages at this number.
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single phone number.

### Invocation

```shell
curl -XGET /v1/phone_numbers/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/phone_numbers/:id`
  

> Returns

```json
{
  "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f", 
  "user_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f", 
  "phone_number": "555-555-5555", 
  "phone_number_type": "landline", 
  "friendly_name": "main number", 
  "verified": false, 
  "opted_in_to_sms": true, 
  "opted_in_to_call_recording": false, 
  "opted_in_to_voicemail": false, 
  "opted_on_to_phone": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.123172+00:00", 
  "created_at": "2018-09-12T01:27:32.123301+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  

## Update
Updates an existing phone number.

### Invocation

```shell
curl -XPUT /v1/phone_numbers/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/phone_numbers/:id -d `
  

> Returns

```json
{
  "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f", 
  "user_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f", 
  "phone_number": "555-555-5555", 
  "phone_number_type": "landline", 
  "friendly_name": "main number", 
  "verified": false, 
  "opted_in_to_sms": true, 
  "opted_in_to_call_recording": false, 
  "opted_in_to_voicemail": false, 
  "opted_on_to_phone": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.123172+00:00", 
  "created_at": "2018-09-12T01:27:32.123301+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
phone_number_type | `enum` | (`cell`, `landline`, `other`)
friendly_name | `string` | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers.
verified | `boolean` | True if and only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) details.
opted_in_to_sms | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving SMS at this number.
opted_in_to_call_recording | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to calls to this number being recorded.
opted_in_to_voicemail | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving voicemail at this number.
opted_in_to_phone | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving calls at this number.
automatic_recipient | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving automated SMS messages at this number.
  

  
  

## Create
Creates a new phone number.

### Invocation

```shell
curl -XPOST /v1/phone_numbers -d 
```

`POST /v1/phone_numbers -d `
  

> Returns

```json
{
  "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f", 
  "user_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f", 
  "phone_number": "555-555-5555", 
  "phone_number_type": "landline", 
  "friendly_name": "main number", 
  "verified": false, 
  "opted_in_to_sms": true, 
  "opted_in_to_call_recording": false, 
  "opted_in_to_voicemail": false, 
  "opted_on_to_phone": true, 
  "automatic_recipient": false, 
  "updated_at": "2018-09-12T01:27:32.123172+00:00", 
  "created_at": "2018-09-12T01:27:32.123301+00:00"
}
```

###Params


param | type | description
- | - | -
user_id | `guid` | The identifier of the [patient](#patients) which this phone number is associated.
phone_number | `phone` | The phone number to be associated with the patient. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type | `enum` | (`cell`, `landline`, `other`)
friendly_name | `string` | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers.
verified | `boolean` | True if and only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) details.
opted_in_to_sms | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving SMS at this number.
opted_in_to_call_recording | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to calls to this number being recorded.
opted_in_to_voicemail | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving voicemail at this number.
opted_in_to_phone | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving calls at this number.
automatic_recipient | `boolean` | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving automated SMS messages at this number.
  

  
  


## Find
Finds  phone numbers, subject to filters.

### Invocation

```shell
curl -XGET /v1/phone_numbers
```

`GET /v1/phone_numbers`
  

> Returns

```json
[
  {
    "data": [
      {
        "id": "c9a72425-f433-4c6c-9d95-4057b25acc2f", 
        "user_id": "9a75cd83-7247-4d6b-a1dd-00e1aca2219f", 
        "phone_number": "555-555-5555", 
        "phone_number_type": "landline", 
        "friendly_name": "main number", 
        "verified": false, 
        "opted_in_to_sms": true, 
        "opted_in_to_call_recording": false, 
        "opted_in_to_voicemail": false, 
        "opted_on_to_phone": true, 
        "automatic_recipient": false, 
        "updated_at": "2018-09-12T01:27:32.123172+00:00", 
        "created_at": "2018-09-12T01:27:32.123301+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.242719+00:00", 
        "page[to]": "2018-09-17T20:03:21.242741+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
user_id | `optional guid` | The identifier of the [patient](#patients) which this phone number is associated.
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  

# Workers


All the workers for who have access to Welkin Coach Portal.





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
  "updated_at": "2018-09-12T01:27:32.125123+00:00", 
  "created_at": "2018-09-12T01:27:32.125229+00:00"
}
```

### Model


field | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
email | `string` | Email address of the worker. This is also used as the username of the worker when logging into Welkin Coach Portal.
first_name | `string` | Worker's first name
last_name | `string` | Worker's last name
phone_number | `string` | Direct line phone number of the worker
timezone | `string` | Timezone which the worker's working hours should be represented in
gender | `string` | (Male, Female, Unknown, Other, Transgender, Decline)
updated_at | `isodatetime` | Datetime the resource was last updated
created_at | `isodatetime` | Datetime the resource was created
  

  

## Get
Gets a single worker.

### Invocation

```shell
curl -XGET /v1/workers/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/workers/:id`
  

> Returns

```json
{
  "id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
  "email": "developer@welkinhealth.com", 
  "first_name": "Emily", 
  "last_name": "Smith", 
  "phone_number": "555-555-5555", 
  "timezone": "US/Eastern", 
  "gender": "Transgender", 
  "updated_at": "2018-09-12T01:27:32.125123+00:00", 
  "created_at": "2018-09-12T01:27:32.125229+00:00"
}
```

###Params


param | type | description
- | - | -
id | `guid` | The primary identifier
id | `guid` | The primary identifier
  

  
  




## Find
Finds  workers, subject to filters.

### Invocation

```shell
curl -XGET /v1/workers
```

`GET /v1/workers`
  

> Returns

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
        "updated_at": "2018-09-12T01:27:32.125123+00:00", 
        "created_at": "2018-09-12T01:27:32.125229+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-17T20:03:21.247143+00:00", 
        "page[to]": "2018-09-17T20:03:21.247165+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

###Params


param | type | description
- | - | -
page[from] | `optional isodatetime` | The minimum timestamp to include in the response
page[to] | `optional isodatetime` | The max timestamp to include in the response
page[size] | `optional integer` | Maximum number of items to include in the response
  

  
  
  


# Types

Reference on the types we use

# Errors

Commons errors and such

