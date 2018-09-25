# Overview

This documentation outlines the datatypes available via Welkin’s APIs and the usage of these APIs. APIs exist for all of the core datatypes managed within Welkin.

**Base URL:** https://api.welkinhealth.com

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
headers = 

resp = requests.post('https://api.welkinhealth.com/v1/patients', headers=headers).json()
```

Use of Welkin APIs requires the use of 2-legged OAuth using the JWT-Bearer flow. For testing purposes, Welkin will provide a long-lived access token but will require the use of 2-legged OAuth for production.

Once you obtain an access token, the token can should be passed as an Authorization header along with the keyword “Bearer”.

More information on the JWT protocol can be found at [jwt.io](https://jwt.io/).

A simple guide to understanding JWT can befound in this [Medium article](https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec).

## Notification Job
Welkin's APIs work using a “ping and pull” model. This means our APIs notify subscribers via Webhook any time there’s an update to their data within our platform. Those subscribers can then decide if they want to pull the updated resources into their system, from Welkin. This ensures your systems are kept up to date with the latest data changes in our platform, without needing to continuously poll our APIs.

The webhook notification includes which resources have changed, the time range of the changes, and a url to GET the deltas.

Change notification webhooks are delayed no more than 60 seconds from the time of update.

An example of Welkin’s data sync could look like the following:

1. Alex, a coach, logs into Welkin and updates the phone number in the patient's (Allison)  profile.
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
resource | `string` | resource endpoint path name
from | `isodatetime` | date of first update
to | `isodatetime` | date of latest update
href | `string` | link to GET all updates for this notification

### Webhook security
Welkin's APIs expect that the webhook destination is secured using [JWT Bearer Authorization](#authentication) in the same manor that our core API is secured. This ensures that patient data remains secure and protected at all times.

# Collection Reference


## Assessment Responses


Assessments can be completed in external systems and loaded into Welkin for display in the coach portal.

Assessments completed in Welkin can be retrieved via this API.

Assessment responses must match existing  assessment templates which have been created in
[Workshop](https://workshop.welkinhealth.com).







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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
spec_id <br /><code><a href='#string'>string</a></code> | Id of the assessment which this response corresponds to. This Id can be found in [Workshop](https://workshop.welkinhealth.com).
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients)
model <br /><code><a href='#json'>json</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single assessment response.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  


### Create





#### Invocation

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

#### Params


param | description
- | -
spec_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Id of the assessment which this response corresponds to. This Id can be found in [Workshop](https://workshop.welkinhealth.com).
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients)
model <br /><code><a href='#anything'>anything</a></code> | Response data for assessment fields. The schema for this JSON object can be found in [Workshop](https://workshop.welkinhealth.com).
spec_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | 
spec_version <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | 
title <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | 
  

  
  


### Find
Finds  assessment responses, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.141096+00:00", 
        "page[to]": "2018-09-25T21:53:11.141119+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Calendar Events


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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
calendar_id <br /><code><a href='#guid'>guid</a></code> | Id of the [calendar](#calendars) on which this event resides
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients)
is_all_day <br /><code><a href='#boolean'>boolean</a></code> | `true` if not scheduled for a specific time of day. `false` otherwise.
start_time <br /><code><a href='#isodatetime'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time <br /><code><a href='#isodatetime'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day
day <br /><code><a href='#isodate'>isodate</a></code> | Date of the calendar event if not scheduled for a specific time of day
outcome <br /><code><a href='#enum'>enum</a></code> | The result of the event if it is no longer upcoming (`completed`, `cancelled`, `no-show`)
modality <br /><code><a href='#enum'>enum</a></code> | Mode via which the event will take place (`call`, `visit`, `video`)
appointment_type <br /><code><a href='#string'>string</a></code> | Type of appointment (see note for details)
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single calendar event.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  

### Update
Updates an existing calendar event.

#### Invocation

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

#### Params


param | description
- | -
calendar_id <br /><code><a href='#guid'>guid</a></code> | Id of the [calendar](#calendars) on which this event resides
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients)
start_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled start time of the calendar event if scheduled for a specific time of day
end_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Scheduled end time of the calendar event if scheduled for a specific time of day
day <br /><code><a href='#optional'>optional</a> <a href='#date'>date</a></code> | Date of the calendar event if not scheduled for a specific time of day
modality <br /><code><a href='#enum'>enum</a></code> | Mode via which the event will take place (`call`, `visit`, `video`)
appointment_type <br /><code><a href='#string'>string</a></code> | Type of appointment (see note for details)
  

  
  


### Find
Finds  calendar events, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.144722+00:00", 
        "page[to]": "2018-09-25T21:53:11.144738+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Calendars


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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
worker_id <br /><code><a href='#guid'>guid</a></code> | The ID of the worker who's calendar this is
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created (excluding updates to events on this calendar)
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single calendar.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  




### Find
Finds  calendars, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.148017+00:00", 
        "page[to]": "2018-09-25T21:53:11.148038+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Care Flows



Care Flows represent a set of actions or tasks to be completed for a specific patient.

<aside>Care flows can be created from templates by coaches or processes but are stored per patient and do not have
a connection back to the template from which they were been generated.</aside>






> Example Response

```json
{
  "id": "c68a80d4-95ea-4f61-bf90-615d70bea591", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "care_flow": {
    "description": "increase daily exercise", 
    "diagnosis": "patient needs at least 30min exercise per day", 
    "goals": [
      {
        "title": "Make a plan", 
        "interventions": [
          {
            "title": "decide on type of exercise", 
            "reminder_date": "2018-08-07T00:00:00+00:00", 
            "completed_at": null, 
            "completed_by_worker_id": null, 
            "worker_id": null, 
            "instructions": "Help the patient decide what type of exercise they can commit to doing."
          }, 
          {
            "title": "document the new plan", 
            "reminder_date": "2018-08-10T00:00:00+00:00", 
            "completed_at": null, 
            "completed_by_worker_id": null, 
            "worker_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
            "instructions": "Make sure there is a written record of the patient's new exercise plan"
          }
        ]
      }
    ]
  }, 
  "updated_at": "2018-09-12T01:27:32.029691+00:00", 
  "created_at": "2018-09-12T01:27:32.029817+00:00"
}
```

### Model


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
user_id <br /><code><a href='#guid'>guid</a></code> | The id of the [patient](#patients)
care_flow <br /><code><a href='#json'>json</a></code> | List of [care_flow objects](#model-care_flow)
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Model care_flow
field | type | description
- | - | -
description | `string` | Description of the overall Care Flow
diagnosis | `string` |
goals | `list` | List of [goal objects](#model-goal)

### Model goal
field | type | description
- | - | -
title | `string` | Title of the Care Flow goal
interventions | `list` | List of [goal intervention objects](#model-intervention)

### Model intervention
field | type | description | optional
- | - | - | -
title | `string` | Title of the Care Flow intervention
reminder_date | `isodatetime` | Due date of the intervention | optional
completed_at | `isodatetime` | Date the intervention was marked completed | optional
completed_by_worker_id | `guid` | ID of the [worker](#workers) who completed this intervention | optional
worker_id | `guid` | ID of the [worker](#workers) who this intervention is assigned to | optional


### Get
Gets a single care flow.

#### Invocation

```shell
curl -XGET /v1/care_flows/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/care_flows/:id`
  

> Returns

```json
{
  "id": "c68a80d4-95ea-4f61-bf90-615d70bea591", 
  "user_id": "509fad6c-5382-4952-ad23-cfc2b2707180", 
  "care_flow": {
    "description": "increase daily exercise", 
    "diagnosis": "patient needs at least 30min exercise per day", 
    "goals": [
      {
        "title": "Make a plan", 
        "interventions": [
          {
            "title": "decide on type of exercise", 
            "reminder_date": "2018-08-07T00:00:00+00:00", 
            "completed_at": null, 
            "completed_by_worker_id": null, 
            "worker_id": null, 
            "instructions": "Help the patient decide what type of exercise they can commit to doing."
          }, 
          {
            "title": "document the new plan", 
            "reminder_date": "2018-08-10T00:00:00+00:00", 
            "completed_at": null, 
            "completed_by_worker_id": null, 
            "worker_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
            "instructions": "Make sure there is a written record of the patient's new exercise plan"
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
Finds  care flows, subject to filters.

#### Invocation

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
        "care_flow": {
          "description": "increase daily exercise", 
          "diagnosis": "patient needs at least 30min exercise per day", 
          "goals": [
            {
              "title": "Make a plan", 
              "interventions": [
                {
                  "title": "decide on type of exercise", 
                  "reminder_date": "2018-08-07T00:00:00+00:00", 
                  "completed_at": null, 
                  "completed_by_worker_id": null, 
                  "worker_id": null, 
                  "instructions": "Help the patient decide what type of exercise they can commit to doing."
                }, 
                {
                  "title": "document the new plan", 
                  "reminder_date": "2018-08-10T00:00:00+00:00", 
                  "completed_at": null, 
                  "completed_by_worker_id": null, 
                  "worker_id": "0d5de756-cdda-4cc0-9cca-bcdc36b1a92f", 
                  "instructions": "Make sure there is a written record of the patient's new exercise plan"
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
        "page[from]": "2018-09-25T21:53:11.152620+00:00", 
        "page[to]": "2018-09-25T21:53:11.152639+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  


## Conversations


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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) which this conversation is with
conversation_type <br /><code><a href='#enum'>enum</a></code> | `app` (Welkin 1st party in app notification), `third_party_app` (In app and push notifications to 3rd party apps), `phone` (SMS messages), `email`
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single conversation.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  


### Create
Creates a new conversation.

#### Invocation

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

#### Params


param | description
- | -
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) which this conversation is with
  

  
  


### Find
Finds  conversations, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.156518+00:00", 
        "page[to]": "2018-09-25T21:53:11.156534+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Custom Data Type Records


Welkin stores custom structured data about a [patient](#patients) in the form of custom data type records.
The spec of custom data types must be defined in [Workshop](https://workshop.welkinhealth.com)
before being created via this endpoint.

<aside>Multiple records of the same data type can be created for each [patient](#patients). Depending on the display
conditions and data uses defined in [Workshop](https://workshop.welkinhealth.com), creating multiple records of the
same type will have different effects within the Welkin Coach Portal.</aside>







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
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

### Model


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
body <br /><code><a href='#json'>json</a></code> | The content of the custom date type record.
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) this data is associated with
type_name <br /><code><a href='#string'>string</a></code> | Name of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single custom data type record.

#### Invocation

```shell
curl -XGET /v1/custom_data_type_records/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/custom_data_type_records/:id`
  

> Returns

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
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  

### Update
Updates an existing custom data type record.

#### Invocation

```shell
curl -XPUT /v1/custom_data_type_records/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/custom_data_type_records/:id -d `
  

> Returns

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
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
body <br /><code><a href='#anything'>anything</a></code> | The content of the custom date type record.
  

  
  

### Create
Creates a new custom data type record.

#### Invocation

```shell
curl -XPOST /v1/custom_data_type_records -d 
```

`POST /v1/custom_data_type_records -d `
  

> Returns

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
  "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
  "type_name": "hcp", 
  "updated_at": "2018-09-12T01:27:32.033666+00:00", 
  "created_at": "2018-09-12T01:27:32.033816+00:00"
}
```

#### Params


param | description
- | -
body <br /><code><a href='#anything'>anything</a></code> | The content of the custom date type record.
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) this data is associated with
type_name <br /><code><a href='#string'>string</a></code> | Name of the custom data type as defined in [Workshop](https://workshop.welkinhealth.com)
  

  
  


### Find
Finds  custom data type records, subject to filters.

#### Invocation

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
        "body": {
          "name": "Frank Smith", 
          "suffix": "MD", 
          "practice_name": "Boston Medical Group", 
          "office_id": "e32ac52", 
          "specialty": "internal medicine"
        }, 
        "user_id": "a162d51e-7791-476a-bf9c-c631e178e3c4", 
        "type_name": "hcp", 
        "updated_at": "2018-09-12T01:27:32.033666+00:00", 
        "created_at": "2018-09-12T01:27:32.033816+00:00"
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-25T21:53:11.159948+00:00", 
        "page[to]": "2018-09-25T21:53:11.159960+00:00", 
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
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Email Addresses


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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#email'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#string'>string</a></code> | Provides a name visible to [workers](#workers) to identify which address for the [patient](#patients) they are using.
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) which this email address is associated with.
verified <br /><code><a href='#boolean'>boolean</a></code> | True if and only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verify email. This does not guarantee that the email address is owned by the [patient](#patients). Note: this verification is not done by Welkin.
opted_in_to_email <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address.
automatic_recipient <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) as consented to receive automated emails at this email address.
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single email addresse.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  

### Update
Updates an existing email addresse.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#optional'>optional</a> <a href='#email'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Provides a name visible to [workers](#workers) to identify which address for the [patient](#patients) they are using.
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verify email. This does not guarantee that the email address is owned by the [patient](#patients). Note: this verification is not done by Welkin.
opted_in_to_email <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address.
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) as consented to receive automated emails at this email address.
  

  
  

### Create
Creates a new email addresse.

#### Invocation

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

#### Params


param | description
- | -
email <br /><code><a href='#email'>email</a></code> | Email address for the [patient](#patients). Note: no validation of format is done on email addresses.
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Provides a name visible to [workers](#workers) to identify which address for the [patient](#patients) they are using.
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) which this email address is associated with.
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if this email has been verified by the [patient](#patients) clicking on a link in an email to confirm that they received the verify email. This does not guarantee that the email address is owned by the [patient](#patients). Note: this verification is not done by Welkin.
opted_in_to_email <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) as consented to receive emails at this email address. If False, then no emails of any kind can be sent to this address.
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) as consented to receive automated emails at this email address.
  

  
  


### Find
Finds  email addresses, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.164859+00:00", 
        "page[to]": "2018-09-25T21:53:11.164879+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | Id of the [patient](#patients) which this email address is associated with.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## External Ids (provisional)



Welkin APIs and systems communicate via Welkin Ids which are GUIDs. All communications with Welkin's standard API
must be in Welkin Ids. In rare cases custom integartions may be created which rely on knowing the mapping between
Welkin Ids and a set of external Ids.

<aside>Duplicate values within the same namespace will be rejected.</aside>








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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
resource <br /><code><a href='#string'>string</a></code> | String name of the resource collection that this Id is associated with. For example `workers`.
namespace <br /><code><a href='#string'>string</a></code> | Seperates mappings of the same Welkin Id to multiple external Ids.
external_id <br /><code><a href='#string'>string</a></code> | Id of the resource in 3rd party system. Can be any string format.
welkin_id <br /><code><a href='#guid'>guid</a></code> | Id of the resource within Welkin. Must be a valid existing Welkin GUID.
  

  


### Update
Updates an existing external id.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
resource <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | String name of the resource collection that this Id is associated with. For example `workers`.
namespace <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Seperates mappings of the same Welkin Id to multiple external Ids.
external_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Id of the resource in 3rd party system. Can be any string format.
welkin_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | Id of the resource within Welkin. Must be a valid existing Welkin GUID.
  

  
  

### Create
Creates a new external id.

#### Invocation

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

#### Params


param | description
- | -
resource <br /><code><a href='#string'>string</a></code> | String name of the resource collection that this Id is associated with. For example `workers`.
namespace <br /><code><a href='#string'>string</a></code> | Seperates mappings of the same Welkin Id to multiple external Ids.
external_id <br /><code><a href='#string'>string</a></code> | Id of the resource in 3rd party system. Can be any string format.
welkin_id <br /><code><a href='#guid'>guid</a></code> | Id of the resource within Welkin. Must be a valid existing Welkin GUID.
  

  
  


### Find
Finds  external ids, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.169239+00:00", 
        "page[to]": "2018-09-25T21:53:11.169258+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
resource <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | String name of the resource collection that this Id is associated with. For example `workers`.
namespace <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Seperates mappings of the same Welkin Id to multiple external Ids.
external_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Id of the resource in 3rd party system. Can be any string format.
welkin_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Id of the resource within Welkin. Must be a valid existing Welkin GUID.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  

## Integration Tasks (provisional)



For custom integrations built by Welkin, this endpoint reports the status and resulting error from the ingestion of
specific data itmes.

<aside>
This only applies for custom integrations built by Welkin and is rarely used. Integrations created using
Welkin's standard API are self reporting and do not require Integration Task monitoring as exposed here.</aside>











> Example Response

```json
{
  "id": "9bf1e295-47f5-4027-a382-008c860694c2", 
  "status": "failed", 
  "user_id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
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
      "code": "user_not_found", 
      "message": "There is no user with that ID.", 
      "extra": {
        "user_id": "abc", 
        "attempt_number": 7
      }
    }
  ]
}
```

### Model


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
status <br /><code><a href='#enum'>enum</a></code> | `unattempted`, `running`, `failed`, or `succeeded`
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients)
provider_id <br /><code><a href='#'></a></code> | to be removed
args <br /><code><a href='#'></a></code> | to be removed
result <br /><code><a href='#'></a></code> | to be removed
ref_ids <br /><code><a href='#array'>array</a> <a href='#string'>string</a></code> | Array of external Ids that tasks is working with. This enables tasks to be linked to the resources in systems outside Welkin.
job_id <br /><code><a href='#string'>string</a></code> | Groups related tasks together
task_name <br /><code><a href='#string'>string</a></code> | The name of the task prefixed with the name of the job
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
errors <br /><code><a href='#array'>array</a> <a href='#integration-errors'>integration-errors</a></code> | Array of all the errors that resulted from this specific task. Note, these errors do not roll up to higher level tasks.
  

  

### Model integration-errors
field | type | description
- | - | -
code | `string` | Machine readable error code. The set of possible errors is defined during custom implementation. Examples include: `user_not_found` or `customer_disabled`
message | `string` | Human readable error message
extra | `string` | JSON blob

### Integration jobs
An integration job is a series of tasks all linked together with a common job id.

The following describes an example custom (built by Welkin) integration.

Kiwi Health is a health system which sends patient data to Welkin throgh a custom integration. When new data is availible for Welkin to consume Kiwi Health sends Welkin a notification. Welkin then valudates the notification and then fetches the data and processes it.

For example a intregration job might be structured as follows:

* kiwihealth_pull.run_kiwihealth_pull
    * kiwihealth_pull.validate_user
    * kiwihealth_pull.fetch_results
    * kiwihealth_pull.process_response
        * kiwihealth_pull.process_item (potentially multiple process_item tasks)

Status for each task is tracked individually and the overall job can hit failures at any of these stages. The top-level task (run_kiwihealth_pull) reports the overall status of the entire job.


### Get
Gets a single integration task.

#### Invocation

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
      "code": "user_not_found", 
      "message": "There is no user with that ID.", 
      "extra": {
        "user_id": "abc", 
        "attempt_number": 7
      }
    }
  ]
}
```

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  




### Find
Finds  integration tasks, subject to filters.

#### Invocation

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
            "code": "user_not_found", 
            "message": "There is no user with that ID.", 
            "extra": {
              "user_id": "abc", 
              "attempt_number": 7
            }
          }
        ]
      }
    ], 
    "meta": {
      "current": {
        "page[from]": "2018-09-25T21:53:11.173401+00:00", 
        "page[to]": "2018-09-25T21:53:11.173420+00:00", 
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
task_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | The name of the task prefixed with the name of the job
ref_id <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | 
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  


## Messages


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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) who sent or received this message.
worker_id <br /><code><a href='#guid'>guid</a></code> | Id of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#guid'>guid</a></code> | Id of the [conversation](#conversations) that this messages is contained in.
direction <br /><code><a href='#enum'>enum</a></code> | `inbound` or `outbound`
contents <br /><code><a href='#string'>string</a></code> | Text of the message
automatically_sent <br /><code><a href='#boolean'>boolean</a></code> | Was this message sent via an automated process or via direct [worker](#workers) action within Welkin.
send_time <br /><code><a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent.
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single message.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  


### Create


Store a new message on the [patient's](#patients) profile. Messages created here display a record of communication
to the [worker](#workers).

<aside>Creating a message record does NOT cause that message to be sent to the [patient](#patients).</aside>



#### Invocation

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

#### Params


param | description
- | -
user_id <br /><code><a href='#guid'>guid</a></code> | Id of the [patient](#patients) who sent or received this message.
worker_id <br /><code><a href='#guid'>guid</a></code> | Id of the [worker](#workers) who sent this message. Note: inbound messages do not have a `worker_id`
conversation_id <br /><code><a href='#guid'>guid</a></code> | Id of the [conversation](#conversations) that this messages is contained in.
direction <br /><code><a href='#enum'>enum</a></code> | `inbound` or `outbound`
contents <br /><code><a href='#string'>string</a></code> | Text of the message
send_time <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date and time when the message was sent.
  

  
  


### Find
Finds  messages, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.177627+00:00", 
        "page[to]": "2018-09-25T21:53:11.177640+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Patient Tasks


Tasks sent to patients in the Welkin app. Often this links to an patient facing survey.

**To be removed** until we have a more concrete use case for this.





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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
user_id <br /><code><a href='#guid'>guid</a></code> | 
task_type <br /><code><a href='#string'>string</a></code> | 
dismissed <br /><code><a href='#boolean'>boolean</a></code> | 
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single patient task.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  


### Create
Creates a new patient task.

#### Invocation

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

#### Params


param | description
- | -
user_id <br /><code><a href='#guid'>guid</a></code> | 
task_type <br /><code><a href='#string'>string</a></code> | 
  

  
  

### Delete
Deletes a single patient task.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  

### Find
Finds  patient tasks, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.181867+00:00", 
        "page[to]": "2018-09-25T21:53:11.181894+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Patients


Patients are the primary data object within Welkin. Almost all other data is attached to a patient.
[Emails](#email-addresses), [assessment responses](#assessment_responses), [care flows](#care_flows), and many more
resources are mapped directly to a specific patient.

There are no restrictions on patient data and thus duplicate can be created on purpose or by accident. Take care when
creating new patients that you do not create duplicates inadvertantly.

When using the Welkin API it is best of have one system be the Master copy and other systems be followers. In this
model patients are created in only one source and thus duplicates are very rare and not introduced when the patient
is create both via Welkin and in an external tool.


















> Example Response

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "phase": "intake", 
  "coach_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054", 
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

### Model


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
phase <br /><code><a href='#enum'>enum</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
coach_id <br /><code><a href='#guid'>guid</a></code> | Id of the [worker](#workers) who is the primary coach for this patient.
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
zip_code <br /><code><a href='#zip_code'>zip_code</a></code> | Zip code of this patient's address in five digit form.
state <br /><code><a href='#state'>state</a></code> | Two character abbrivation of the state in which the patient resides.
country <br /><code><a href='#string'>string</a></code> | Country in which the [patient](#patients) lives
  

  


### Update
Updates an existing patient.

#### Invocation

```shell
curl -XPUT /v1/patients/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/patients/:id -d `
  

> Returns

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "phase": "intake", 
  "coach_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054", 
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
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
phase <br /><code><a href='#optional'>optional</a> <a href='#provider_code'>provider_code</a></code> | The phase (or stage) of care that this patient is in. The possible set of phases is defined in [Workshop](https://workshop.welkinhealth.com).
coach_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | Id of the [worker](#workers) who is the primary coach for this patient.
timezone <br /><code><a href='#optional'>optional</a> <a href='#timezone'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#optional'>optional</a> <a href='#name'>name</a></code> | First name of this patient
last_name <br /><code><a href='#optional'>optional</a> <a href='#name'>name</a></code> | Last name of this patient
birthday <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | Date of birth of this patient
  

  
  

### Create
Creates a new patient.

#### Invocation

```shell
curl -XPOST /v1/patients -d 
```

`POST /v1/patients -d `
  

> Returns

```json
{
  "id": "45ceeba9-4944-43d1-b34d-0c36846acd4c", 
  "phase": "intake", 
  "coach_id": "1ecacc1f-1a4c-4bcb-9790-528642cba054", 
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
coach_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | Id of the [worker](#workers) who is the primary coach for this patient.
timezone <br /><code><a href='#timezone'>timezone</a></code> | Timezone in which this [patient](#patients) lives
first_name <br /><code><a href='#name'>name</a></code> | First name of this patient
last_name <br /><code><a href='#name'>name</a></code> | Last name of this patient
birthday <br /><code><a href='#birthday'>birthday</a></code> | Date of birth of this patient
street <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Street address of this patient
street_line_two <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Second line of this patient's street address
city <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | City of this patient's address
county <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | County in which the patient lives. If unknown then this can be left out.
zip_code <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Zip code of this patient's address in five digit form.
state <br /><code><a href='#optional'>optional</a> <a href='#address_state'>address_state</a></code> | Two character abbrivation of the state in which the patient resides.
country <br /><code><a href='#optional'>optional</a> <a href='#country'>country</a></code> | Country in which the [patient](#patients) lives
email <br /><code><a href='#optional'>optional</a> <a href='#email'>email</a></code> | 
external_ids <br /><code><a href='#optional'>optional</a> <a href='#list(object)'>list(object)</a></code> | 
phone <br /><code><a href='#optional'>optional</a> <a href='#phone'>phone</a></code> | 
  

  
  


  

## Phone Numbers


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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
user_id <br /><code><a href='#guid'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#phone'>phone</a></code> | The phone number to be associated with the patient. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers.
verified <br /><code><a href='#boolean'>boolean</a></code> | True if and only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) details.
opted_in_to_sms <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving SMS at this number.
opted_in_to_call_recording <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to calls to this number being recorded.
opted_in_to_voicemail <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving voicemail at this number.
opted_in_to_phone <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving calls at this number.
automatic_recipient <br /><code><a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving automated SMS messages at this number.
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single phone number.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  

### Update
Updates an existing phone number.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
phone_number_type <br /><code><a href='#optional'>optional</a> <a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers.
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) details.
opted_in_to_sms <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving SMS at this number.
opted_in_to_call_recording <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to calls to this number being recorded.
opted_in_to_voicemail <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving voicemail at this number.
opted_in_to_phone <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving calls at this number.
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving automated SMS messages at this number.
  

  
  

### Create
Creates a new phone number.

#### Invocation

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

#### Params


param | description
- | -
user_id <br /><code><a href='#guid'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
phone_number <br /><code><a href='#phone'>phone</a></code> | The phone number to be associated with the patient. Note, this can be a phone number of the patient, a care giver, or other associated entity.
phone_number_type <br /><code><a href='#enum'>enum</a></code> | (`cell`, `landline`, `other`)
friendly_name <br /><code><a href='#optional'>optional</a> <a href='#string'>string</a></code> | Name of the phone number to help the [worker](#workers) differentiate between patient phone numbers.
verified <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if you have confirmed this phone number is owned by the [patient](#patients) by calling this number and confirming the [patient's](#patients) details.
opted_in_to_sms <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving SMS at this number.
opted_in_to_call_recording <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to calls to this number being recorded.
opted_in_to_voicemail <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving voicemail at this number.
opted_in_to_phone <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving calls at this number.
automatic_recipient <br /><code><a href='#optional'>optional</a> <a href='#boolean'>boolean</a></code> | True if and only if the [patient](#patients) has consented verbaly, digitally, or in writing to receiving automated SMS messages at this number.
  

  
  


### Find
Finds  phone numbers, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.191398+00:00", 
        "page[to]": "2018-09-25T21:53:11.191422+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
user_id <br /><code><a href='#optional'>optional</a> <a href='#guid'>guid</a></code> | The identifier of the [patient](#patients) which this phone number is associated.
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  

## Workers


All the workers for who have access to Welkin Coach Portal.

Workers are assigned to [patients](#patients) as their primary coach via `[Patient](#patients).coach_id`










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


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
email <br /><code><a href='#string'>string</a></code> | Email address of the worker. This is also used as the username of the worker when logging into Welkin Coach Portal.
first_name <br /><code><a href='#string'>string</a></code> | Worker's first name
last_name <br /><code><a href='#string'>string</a></code> | Worker's last name
phone_number <br /><code><a href='#string'>string</a></code> | Direct line phone number of the worker
timezone <br /><code><a href='#string'>string</a></code> | Timezone which the worker's working hours should be represented in
gender <br /><code><a href='#string'>string</a></code> | (`Male`, `Female`, `Unknown`, `Other`, `Transgender`, `Decline`)
updated_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was last updated
created_at <br /><code><a href='#isodatetime'>isodatetime</a></code> | Datetime the resource was created
  

  

### Get
Gets a single worker.

#### Invocation

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

#### Params


param | description
- | -
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
id <br /><code><a href='#guid'>guid</a></code> | The primary identifier
  

  
  




### Find
Finds  workers, subject to filters.

#### Invocation

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
        "page[from]": "2018-09-25T21:53:11.194408+00:00", 
        "page[to]": "2018-09-25T21:53:11.194422+00:00", 
        "page[size]": 50
      }
    }
  }
]
```

#### Params


param | description
- | -
page[from] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The minimum timestamp to include in the response
page[to] <br /><code><a href='#optional'>optional</a> <a href='#isodatetime'>isodatetime</a></code> | The max timestamp to include in the response
page[size] <br /><code><a href='#optional'>optional</a> <a href='#integer'>integer</a></code> | Maximum number of items to include in the response
  

  
  
  


# Reference

## Types

type | definition | example
- | - | -
enum | `string` with predefined set of values | `"Female"`
isodatetime | `string` following [isodatetime format](https://en.wikipedia.org/wiki/ISO_8601) representing a date and time in UTC | `"2018-09-15T15:20:01"`
isodate | `string` following the [isodatetime format](https://en.wikipedia.org/wiki/ISO_8601) representing a day in the local timezone of the [worker](#workers) or [patient](#patients) | `"2018-09-15"`
guid | `string` with X number of characters. 36 characters seperated by dashes 8-4-4-4-12. | `"45ceeba9-4944-43d1-b34d-0c36846acd4c"`
boolean | JSON style boolean | `true`
string | Any quoted set of characters with no length restriction. | `"Welcome to Welkin's APIs"`
phone | `string` representing a phone number without extensions or other dialing information. Country code should not be included. +1 numbers only. | `"555-555-1234"`
email | `string` representing an email address | `"support@welkinhealth.com"`
timezone | `string` following [iana tz format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) | `"US/Pacific"`
state | `string` of two character United States state abbrivation | `"CA"`
zip_code | `string` of a five digit United States zip code | `"94110"`
integer | Counting numbers with no decimal place including zero and negative numbers | `42`
json | `string` following [JSON format](https://en.wikipedia.org/wiki/JSON). Welkin may require the `json` to have a specific format. | `""`

<aside>GUIDs are global unique identifiers for objects within Welkin. These Ids are long lived for resources and are unqiue within and across resources.</aside>

## Errors

Common errors and such

