# Welcome to the common APIs


# Assessment Responses


Some doc string for transform


  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
spec_id | string | 
user_id | guid | 
model | anything | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single assessment response.


### Invocation

```shell
curl -XGET /v1/assessment_responses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/assessment_responses/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
  

  
  


## Create
Creates a new assessment response.


### Invocation

```shell
curl -XPOST /v1/assessment_responses -d 
```

`POST /v1/assessment_responses -d `
  

###Params


param | type | description
- | - | -
spec_id | string | 
user_id | guid | 
model | anything | 
spec_name | string | 
spec_version | string | 
title | string | 
  

  
  


  

# Calendar Events




Calendar events belong to a worker calender, and reference a patient.
They can be scheduled for a time of day, or simply for a date.
<aside>All calendar events have an appointment type. Valid types vary by program, and each has separate
product implications. The range and capabilities of appointment types are not covered in this document.</aside>

  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
calendar_id | guid | Id of the referenced `calendar` resource
user_id | guid | The id of the `patient`
is_all_day |  | `true` if an all day event. `false` otherwise.
start_time | isodatetime | Scheduled start time of the calendar event if scheduled for a time of day
end_time | isodatetime | Scheduled end time of the calendar event if scheduled for a time of day
day | date | Date of the calendar event if an all day event
outcome | enum | The result of the event if completed
modality | enum | Modality, such as `call` or `visit`
appointment_type | string | Type of appointment
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single calendar event.


### Invocation

```shell
curl -XGET /v1/calendar_events/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/calendar_events/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
  

  
  

## Update
Updates an existing calendar event.


### Invocation

```shell
curl -XPUT /v1/calendar_events/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/calendar_events/:id -d `
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
start_time | isodatetime | Scheduled start time of the calendar event if scheduled for a time of day
end_time | isodatetime | Scheduled end time of the calendar event if scheduled for a time of day
day | date | Date of the calendar event if an all day event
outcome | enum | The result of the event if completed
  

  
  

## Create
Creates a new calendar event.


### Invocation

```shell
curl -XPOST /v1/calendar_events -d 
```

`POST /v1/calendar_events -d `
  

###Params


param | type | description
- | - | -
calendar_id | guid | Id of the referenced `calendar` resource
user_id | guid | The id of the `patient`
start_time | isodatetime | Scheduled start time of the calendar event if scheduled for a time of day
end_time | isodatetime | Scheduled end time of the calendar event if scheduled for a time of day
day | date | Date of the calendar event if an all day event
modality | enum | Modality, such as `call` or `visit`
appointment_type | string | Type of appointment
  

  
  


  

# Calendars





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
worker_id |  | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single calendar.


### Invocation

```shell
curl -XGET /v1/calendars/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/calendars/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
  

  
  




  

# Careplans





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
user_id |  | 
careplan |  | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single careplan.


### Invocation

```shell
curl -XGET /v1/careplans/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/careplans/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  




  

# Conversations





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
user_id | guid | 
conversation_type |  | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single conversation.


### Invocation

```shell
curl -XGET /v1/conversations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/conversations/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  


## Create
Creates a new conversation.


### Invocation

```shell
curl -XPOST /v1/conversations -d 
```

`POST /v1/conversations -d `
  

###Params


param | type | description
- | - | -
user_id | guid | 
  

  
  


  

# Custom Data Type Records





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
body | anything | 
user_id | guid | 
type_name | string | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single custom data type record.


### Invocation

```shell
curl -XGET /v1/custom_data_type_records/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/custom_data_type_records/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  

## Update
Updates an existing custom data type record.


### Invocation

```shell
curl -XPUT /v1/custom_data_type_records/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/custom_data_type_records/:id -d `
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
body | anything | 
  

  
  

## Create
Creates a new custom data type record.


### Invocation

```shell
curl -XPOST /v1/custom_data_type_records -d 
```

`POST /v1/custom_data_type_records -d `
  

###Params


param | type | description
- | - | -
body | anything | 
user_id | guid | 
type_name | string | 
  

  
  


  

# Email Addresses





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
email | email | 
friendly_name | string | 
user_id | guid | 
verified | boolean | 
opted_in_to_email | boolean | 
automatic_recipient | boolean | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single email address.


### Invocation

```shell
curl -XGET /v1/email_addresses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/email_addresses/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  

## Update
Updates an existing email address.


### Invocation

```shell
curl -XPUT /v1/email_addresses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/email_addresses/:id -d `
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
email | email | 
friendly_name | string | 
verified | boolean | 
opted_in_to_email | boolean | 
automatic_recipient | boolean | 
  

  
  

## Create
Creates a new email address.


### Invocation

```shell
curl -XPOST /v1/email_addresses -d 
```

`POST /v1/email_addresses -d `
  

###Params


param | type | description
- | - | -
email | email | 
friendly_name | string | 
user_id | guid | 
verified | boolean | 
opted_in_to_email | boolean | 
automatic_recipient | boolean | 
  

  
  


  

# External Ids





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
resource | string | 
namespace | string | 
external_id | string | 
welkin_id | guid | 
  

  


## Update
Updates an existing external id.


### Invocation

```shell
curl -XPUT /v1/external_ids/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/external_ids/:id -d `
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
resource | string | 
namespace | string | 
external_id | string | 
welkin_id | guid | 
  

  
  

## Create
Creates a new external id.


### Invocation

```shell
curl -XPOST /v1/external_ids -d 
```

`POST /v1/external_ids -d `
  

###Params


param | type | description
- | - | -
resource | string | 
namespace | string | 
external_id | string | 
welkin_id | guid | 
  

  
  


  

# Integration Tasks





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
status |  | 
user_id |  | 
provider_id |  | 
args |  | 
result |  | 
ref_ids |  | 
job_id | string | 
task_name | string | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
errors |  | 
  

  

## Get
Gets a single integration task.


### Invocation

```shell
curl -XGET /v1/integration_tasks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/integration_tasks/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  




  

# Messages





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
user_id | guid | 
worker_id | guid | 
conversation_id | guid | 
direction | enum | 
contents | string | 
automatically_sent |  | 
send_time | isodatetime | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single message.


### Invocation

```shell
curl -XGET /v1/messages/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/messages/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  


## Create
Creates a new message.


### Invocation

```shell
curl -XPOST /v1/messages -d 
```

`POST /v1/messages -d `
  

###Params


param | type | description
- | - | -
user_id | guid | 
worker_id | guid | 
conversation_id | guid | 
direction | enum | 
contents | string | 
send_time | isodatetime | 
  

  
  


  

# Patient Tasks





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
user_id | guid | 
task_type | string | 
dismissed |  | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single patient task.


### Invocation

```shell
curl -XGET /v1/patient_tasks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/patient_tasks/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  


## Create
Creates a new patient task.


### Invocation

```shell
curl -XPOST /v1/patient_tasks -d 
```

`POST /v1/patient_tasks -d `
  

###Params


param | type | description
- | - | -
user_id | guid | 
task_type | string | 
  

  
  

## Delete
Deletes a single patient task.


### Invocation

```shell
curl -XDELETE /v1/patient_tasks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`DELETE /v1/patient_tasks/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  

  

# Patients





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
phase | provider_code | 
coach_id | guid | 
timezone | timezone | 
first_name | name | 
last_name | name | 
birthday | birthday | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
street | string | 
street_line_two | string | 
city | string | 
county | string | 
zip_code | string | 
state | address_state | 
  

  


## Update
Updates an existing patient.


### Invocation

```shell
curl -XPUT /v1/patients/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/patients/:id -d `
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
phase | provider_code | 
coach_id | guid | 
timezone | timezone | 
first_name | name | 
last_name | name | 
birthday | birthday | 
  

  
  

## Create
Creates a new patient.


### Invocation

```shell
curl -XPOST /v1/patients -d 
```

`POST /v1/patients -d `
  

###Params


param | type | description
- | - | -
phase | provider_code | 
coach_id | guid | 
timezone | timezone | 
first_name | name | 
last_name | name | 
birthday | birthday | 
street | string | 
street_line_two | string | 
city | string | 
county | string | 
zip_code | string | 
state | address_state | 
country | country | 
email | email | 
external_ids | object | 
phone | phone | 
  

  
  


  

# Phone Numbers





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
user_id | guid | 
phone_number | phone | 
phone_number_type | enum | 
friendly_name | string | 
verified | boolean | 
opted_in_to_sms | boolean | 
opted_in_to_call_recording | boolean | 
opted_in_to_voicemail | boolean | 
opted_on_to_phone |  | 
automatic_recipient | boolean | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single phone number.


### Invocation

```shell
curl -XGET /v1/phone_numbers/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/phone_numbers/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  

## Update
Updates an existing phone number.


### Invocation

```shell
curl -XPUT /v1/phone_numbers/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa -d 
```

`PUT /v1/phone_numbers/:id -d `
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
phone_number_type | enum | 
friendly_name | string | 
verified | boolean | 
opted_in_to_sms | boolean | 
opted_in_to_call_recording | boolean | 
opted_in_to_voicemail | boolean | 
automatic_recipient | boolean | 
opted_in_to_phone | boolean | 
  

  
  

## Create
Creates a new phone number.


### Invocation

```shell
curl -XPOST /v1/phone_numbers -d 
```

`POST /v1/phone_numbers -d `
  

###Params


param | type | description
- | - | -
user_id | guid | 
phone_number | phone | 
phone_number_type | enum | 
friendly_name | string | 
verified | boolean | 
opted_in_to_sms | boolean | 
opted_in_to_call_recording | boolean | 
opted_in_to_voicemail | boolean | 
automatic_recipient | boolean | 
opted_in_to_phone | boolean | 
  

  
  


  

# Workers





  

### Model


field | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
email |  | 
first_name |  | 
last_name |  | 
phone_number |  | 
timezone |  | 
gender |  | 
updated_at |  | Datetime the resource was last updated
created_at |  | Datetime the resource was created
  

  

## Get
Gets a single worker.


### Invocation

```shell
curl -XGET /v1/workers/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
```

`GET /v1/workers/:id`
  

###Params


param | type | description
- | - | -
id | guid | The primary identifier
id | guid | The primary identifier
  

  
  




  


# Types

Reference on the types we use

# Errors

Commons errors and such

