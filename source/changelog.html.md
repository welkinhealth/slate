# Welkin API Change Log

This document outlines the changes that Welkin has made to our external API.
This document was started in June 2019 and covers all changes made since that date.

**API Documentation URL:** [https://developers.welkinhealth.com](https://developers.welkinhealth.com)

**Welkin's API is in active development.** We will be making backwards compatible changes over the coming months with little or no advanced notice. You should expect Welkin to add additional optional fields to resource schemas and new resource types to the API. Your integration should be built with this understanding and should not break with the addition of new fields or resource types. Use of strict schema validation is not recommended. Breaking changes will be communicated in advance of rollout and we will work with you to make the transition.

# API Updates
Updates are listed by the day the api or documentation was released.

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
