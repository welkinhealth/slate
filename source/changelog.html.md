# Welkin API Changelog

This document outlines the changes that Welkin has made to our external APIs and Data Exports.

This document was started in June 2019 and covers all changes made since that date.

**Data API Documentation URL:** [https://developers.welkinhealth.com](/)

**Apps API Documentation URL:** [https://developers.welkinhealth.com/app_frontend_api.html](/apps_frontend_api.html)

**Data Exports Documentation URL:** [https://developers.welkinhealth.com/data_exports.html](/data_exports.html)

**Welkin's APIs and Exports are in active development.** We will be making backwards compatible changes over the coming months with little or no advanced notice. You should expect Welkin to add additional optional fields to resource schemas and new resource types to the APIs. Your integration should be built with this understanding and should not break with the addition of new fields or resource types. Use of strict schema validation is not recommended. Breaking changes will be communicated in advance of rollout and we will work with you to make the transition.

# Apps API Updates
Updates are listed by the day the api or documentation was released.

## November 26th, 2019
* **[released]** Documentation Only preview of the [Apps API](/apps_frontend_api.html) has been released and is available to select Welkin customers. Please speak to your account manager for details.

# Data API Updates
Updates are listed by the day the api or documentation was released.

## December 9nd, 2019
* **[added]** GET, PUT, and FIND for Email Messages APIs released. [Email Messages](/#email-messages)

* **[added]** Provider ID Number added to [Patients](/#patients) endpoint.
* **[changed]** Conversations can now be of `type in-app` or `email`. [Conversations](#conversations)

## December 2nd, 2019
* **[added]** GET and FIND for Calls APIs released. [Calls](/#calls)

* **[added]** PUT and POST for Visits (in person meetings between workers and patients). [Visits](/#visits)
* **[deprecated]** Disposition field on [calendar events](#calendar_events) is deprecated.

## November 13th, 2019
* **[fixed]** [Batch creation](/#batch-creation-of-resources) of [Custom Data Type Records](/#custom-data-type-records) as part of a POST to the [Patients](/#patients) endpoint now functions as expected.

## November 4th, 2019
* **[changed]** External IDs are no longer provisional. No functional changes were made to the External ID resource. [External IDs](/#external-ids)

## October 16th, 2019
* **[added]** FIND Custom Data Type Records by Patient ID, `patient_id` and fixed FIND by `type_name`. [Custom Data Type FIND](/#custom-data-type-records-find)

* **[added]** GET and FIND for Visits (in person meetings between workers and patients). [Visits](/#visits)
* **[changed]** Clarified documentation for Assessment Responses and which fields are required. [Assessment Reponses](/#assessment-responses)
* **[changed]** Clarified documentation for Calendar Events and which fields are required. [Calendar Events](/#calendar-events)
* **[changed]** Clarified documentation for Care Flows and their Model. [Care Flows Model](/#care-flows-model-care_flow)
* **[changed]** Other minor typos and documentation bugs. No functional changes.
* **[fixed]** FIND by `patient_id` now works correctly for SMS Messages and App Messages. [SMS Messages FIND](/#sms-messages-find) [App Messages FIND](/#app-messages-find)

## October 1st, 2019
* **[added]** Assessment Responses now include the Worker ID of the worker who filled out the assessment or most recently edited the assessment. The worker who filled out the assessment can also be set when it is created.

## August 27th, 2019
* **[added]** Profiles and Profile Phone Numbers added to the Welkin API. You can now create and update Profile instances through the API. Definitions of Profiles are created in Workshop.

## August 19th, 2019
* **[added]** Patient `Get` method to documentation. This functionality already existed but was not documented.

* **[added]** Batch creation of Calendar Events and their External IDs. You can now create an External ID while creating a Calendar Event.

## June 18th, 2019
* **[added]** Worker `Create` and `Update` methods. You can now create and update worker accounts via Welkin APIs. In order to create or update workers you must have this functionality turned on by Welkin. Please contact your implementation manager or customer success manager to have this functionality enabled.

* **[changed]** Worker roles are now represented with the `role_ids` field. The `roles` field is now deprecated but will still be populated for Get and Find methods of Workers.
* **[added]** Worker `Unavailable Time` and `Working Hours` endpoints added to worker calenders. You can now view the time on a worker's calendar which they are busy or can't be scheduled for.
* **[added]** Batch creation of nested resources. This allows resources like Patients and Phone Numbers to be created in a single API call rather than in two sequential calls.
* **[added]** `Relationship Records` endpoint. This allows you to connect profiles to patients. Note profiles endpoints not yet released. Requires profiles to be enabled for your Welkin configuration.
* **[documented]** Clarified documentation on how webhook notifications are secured in Welkin.
* **[documented]** Clarified example of how to upload files via Welkin's API.
* **[documented]** Clarified how Conversations resource works with emails and app messages.


# Data Exports Updates
Updates are listed by the day the data export or documentation was released.

## December 9th, 2019
* **[added]** Relationships are now included in Data Exports

## November 25th, 2019
* **[added]** Assessment and Assessment responses are now included in Data Exports
*
* **[added]** Workers are now included in Data Exports
* **[added]** Outcome of Calendar Events have been added to the Calendar Events export file
