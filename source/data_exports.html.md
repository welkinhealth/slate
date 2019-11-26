# Standard Data Exports

This document outlines what Welkin offers in Standard Data Exports and how changes are made to those exports.

**Welkin's Standard Data Exports are in active development.**

# Goals

Welkin's Standard Data Exports are intended to cover all data types exposed in Coach Portal and or the API. As a Welkin customer there should be no data that is not accessible via exports or the API. This will allow customers to get a full picture of patient health from Welkin.

Welkin is continuing to develop data exports to reach this goal. Over the coming months Welkin will increase the fields and files available via data exports.

# What's currently included?
**Last updated 11/25/19**

* Alerts
* Assessments and Assessment Responses
* Care Plans
* Custom Data Type Records
* Inbound Phone Calls
* Outbound Phone Calls
* Patients
* Phase Changes
* Scheduled Events
* Tasks
* Workers

# Updates to Exports

**Welkin's Standard Data Exports are in active development.** Welkin will be making backwards compatible changes over the coming months with little or no advanced notice. Consumers of Exports should expect Welkin to add additional fields to data schemas and new resource types to the Exports. Systems ingesting these exports should be built with this understanding and should not break with the addition of new fields or files. Use of strict schema validation or schema validation that relies on column numbers or column position is not recommended.

**Breaking changes will be communicated in advance of rollout and Welkin will work with customers to make the transition.** This includes but is not limited to removing a field or file, renaming an existing field or file, or updating the data type definition of a field.

# How to download Exports

Standard Data Exports are available for download from Welkin's Admin Portal. The exports can be downloaded at any time from the Exports section of Admin Portal.

1. Login to Welkin as a Worker with the Role `admin`
2. Click Data Exports in the left nav
3. Click Download CSV

# Exceptions

Welkin has built custom exports for some customers. These custom exports are not covered by this document. Welkin will assist customers in migrating to Standard Data Exports once their use-cases are covered by the standard feature set.
