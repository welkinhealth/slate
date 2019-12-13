# Overview

Welkin’s goal is to empower you, our customers, to deliver patient-centered care. Our APIs exists in support of this goal. Whether it’s data kept within our platform, or your pre-existing systems, we think you should have complete, real-time access and agency over your own data.

Using Welkin's APIs will allow you to keep your systems in sync with Welkin and extend Welkin's functionality with Apps.

# API updates
**Welkin's APIs are in active development.** We will be making backwards compatible changes over the coming months with little or no advanced notice. You should expect that we will add additional optional fields to resource schemas and new resource types to Welkin's APIs. Your integration should be built with this understanding and should not break with the addition of new fields or resource types. Use of strict schema validation is not recommended. Breaking changes will be communicated in advance of rollout and we will work with you to make the transition. [See API Versioning and Update Policy](/version_policy.html)

# App Framework

Apps allow you to integrate Welkin with tools that you already use to create a single workflow within the Welkin UI. With Apps, Welkin supports showing UI built by 3rd parties as part of the Welkin experience.

Learn about how to use Welkin's **[App Framework](/apps_framework.html)**

## App API

The Welkin Apps Frontend API enables Welkin and an embedded App to communicate and call functions on each other. This tight integration allows for a seamless experience across areas of Welkin functionality.

To enable Apps to have control over Welkin's UI we have exposed an API via which Apps can perform a defined set of actions which update the Welkin UI.

Learn about how to use Welkin's **[App Frontend API](/apps_frontend_api.html)**

# Data API

Welkin's Data API allows you to keep the data stored in Welkin in sync with the data stored in all your other systems.

Welkin's API notifies your subscribed systems of any updates to your resources within Welkin. For example, when a patient's phone number is changed in Welkin, that information is sent to your systems, keeping them up to date with the latest values stored in Welkin.

Learn about how to use Welkin's **[Data API](/data_api.html)**

# Standard Exports

Welkin's Standard Data Exports allow you to download all the data from your Welkin program as a set of CSV files. These files contain data ready for loading into your data analysis tools or data warehouse. These exports are available at anytime via Welkin's Admin Portal and cover all the data stored in your Welkin program.

Learn about how to use Welkin's **[Data Exports](/data_exports.html)**

# Tools, Resources, and Policies

## Changelog

Welkin documents when changes are made to our APIs and Exports. This changelog points to the areas where changes have been made so that you can go read about the details of the updated endpoints.

Welkin's **[API Changelog](/changelog.html)**

## Deprecation Policy

Welkin sometimes must make non-backwards-compatible changes to our [Data API](#data-api). The process by which we will notify developers and rollout these changes is documented in our Deprecation Policy.

Welkin's Data API **[Deprecation Policy](/deprecation_policy.html)**

## Integration Tools

Integration Tools is a section of Workshop (Welkin's codeless configuration tool), which allows you to configure Apps and other integrations. You can configure which systems have access to data within Welkin and how they access it.

Learn about how to use Welkin's **[Integration Tools](/integration_tools.html)**
