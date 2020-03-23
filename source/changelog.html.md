# API Changelog

This document outlines the changes that Welkin has made to our external APIs and Data Exports.

This document was started in June 2019 and covers all changes made since that date.

**Welkin's APIs and Exports are in active development.** We will be making backwards compatible changes over the coming months with little or no advanced notice. You should expect Welkin to add additional optional fields to resource schemas and new resource types to the APIs. Your integration should be built with this understanding and should not break with the addition of new fields or resource types. Use of strict schema validation is not recommended. Breaking changes will be communicated in advance of rollout and we will work with you to make the transition.

# Apps API Updates
Updates are listed by the day the api or documentation was released.

**Apps API Documentation URL:** [https://developers.welkinhealth.com/app_frontend_api.html](/apps_frontend_api.html)

## November 26th, 2019
* **[released]** Documentation Only preview of the [Apps API](/apps_frontend_api.html) has been released and is available to select Welkin customers. Please speak to your account manager for details.

# Data API Updates
Updates are listed by the day the api or documentation was released.

**Data API Documentation URL:** [https://developers.welkinhealth.com](/data_api.html)

## March 2nd, 2020
* **[added]** Profiles can be created in Batch with External IDs [Batch Create](/data_api.html#batch-creation-of-resources)

* **[added]** Profiles can be created in Batch with Profile Phone Numbers [Batch Create](/data_api.html#batch-creation-of-resources)

## January 20th, 2020
* **[added]** GET, POST, PUT, and FIND for [Event Labels](/data_api.html#event-labels) APIs released.

* **[added]** DELETE added to [Email Addresses](/data_api.html#email-addresses).
* **[changed]** Birthday is now optional when creating [Patients](/data_api.html#patients).

## December 16nd, 2019
* **[added]** GET, POST, and FIND for Email Messages APIs released. [Email Messages](/data_api.html#email-messages)

* **[added]** Provider ID Number added to [Patients](/data_api.html#patients) endpoint.
* **[changed]** Conversations can now be of `type in-app` or `email`. [Conversations](/data_api.html#conversations)
* **[added]** Find by POST for Phone Numbers. [Phone Number Find by POST](/data_api.html#phone-numbers-find-by-post)

## December 2nd, 2019
* **[added]** GET and FIND for Calls APIs released. [Calls](/data_api.html#calls)

* **[added]** PUT and POST for Visits (in person meetings between workers and patients). [Visits](/data_api.html#visits)
* **[deprecated]** Disposition field on [calendar events](/data_api.html#calendar_events) is deprecated.

## November 13th, 2019
* **[fixed]** [Batch creation](/data_api.html#batch-creation-of-resources) of [Custom Data Type Records](/data_api.html#custom-data-type-records) as part of a POST to the [Patients](/data_api.html#patients) endpoint now functions as expected.

## November 4th, 2019
* **[changed]** External IDs are no longer provisional. No functional changes were made to the External ID resource. [External IDs](/data_api.html#external-ids)

## October 16th, 2019
* **[added]** FIND Custom Data Type Records by Patient ID, `patient_id` and fixed FIND by `type_name`. [Custom Data Type FIND](/data_api.html#custom-data-type-records-find)

* **[added]** GET and FIND for Visits (in person meetings between workers and patients). [Visits](/data_api.html#visits)
* **[changed]** Clarified documentation for Assessment Responses and which fields are required. [Assessment Reponses](/data_api.html#assessment-responses)
* **[changed]** Clarified documentation for Calendar Events and which fields are required. [Calendar Events](/data_api.html#calendar-events)
* **[changed]** Clarified documentation for Care Flows and their Model. [Care Flows Model](/data_api.html#care-flows-model-care_flow)
* **[changed]** Other minor typos and documentation bugs. No functional changes.
* **[fixed]** FIND by `patient_id` now works correctly for SMS Messages and App Messages. [SMS Messages FIND](/data_api.html#sms-messages-find) [App Messages FIND](/data_api.html#app-messages-find)

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

**Data Exports Documentation URL:** [https://developers.welkinhealth.com/data_exports.html](/data_exports.html)

## March 12th, 2020
* **[removed]** Removed duplicate fields with the old field names. Columns in exports are now consistently named across files. Exports run from here out will have the new column names.

## February 12th, 2020
* **[changed]** Changed the order of some fields in some exports
* **[changed]** Added duplicate fields with better field names (old fields to be removed March 11th)

## December 16th, 2019
* **[added]** Relationships and Profiles are now included in Data Exports

## November 25th, 2019
* **[added]** Assessment and Assessment responses are now included in Data Exports
*
* **[added]** Workers are now included in Data Exports
* **[added]** Outcome of Calendar Events have been added to the Calendar Events export file
