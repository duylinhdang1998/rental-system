@sprint-2 @fleet @customers
Feature: Fleet, customer and catalog foundations
  As an Owner or Staff member
  I want trustworthy fleet and customer records
  So that contract creation uses valid source data without exposing private documents

  Background:
    Given an authenticated rental workspace
    And all test people and identifiers are synthetic

  @US-007 @catalog @authorization @integration
  Scenario: Owner creates a vehicle type while Staff remains read-only
    Given the Owner is viewing vehicle type settings
    When the Owner creates type "Scooter" with code "SCOOTER"
    Then the type is available to fleet forms
    And an audit event records the Owner and created values
    When Staff attempts the same catalog mutation
    Then the API returns status 403

  @US-008 @vehicle @crud @integration
  Scenario: Staff adds a valid vehicle
    Given vehicle type "Scooter" exists
    When Staff adds vehicle "TEST-001" with plate "43A1-000.01"
    Then the API returns the vehicle in AVAILABLE status
    And search by plate returns that vehicle
    And no future contract or revenue is fabricated

  @US-008 @vehicle @validation @integration
  Scenario: Duplicate normalized plates are rejected
    Given plate "43A1-000.01" already exists
    When Staff adds plate "43a1 000.01"
    Then the API returns status 409 with a request identifier
    And the existing vehicle remains unchanged

  @US-008 @vehicle @state-machine @audit @unit @integration
  Scenario: Vehicle condition transitions are controlled
    Given an AVAILABLE vehicle
    When Staff moves it to MAINTENANCE with reason "Scheduled service"
    Then the new status and reason are stored in append-only history
    When Staff manually moves the same vehicle to RENTED without a contract
    Then the transition is rejected

  @US-008 @vehicle @search @integration @e2e
  Scenario: Staff filters fleet by status and type
    Given synthetic vehicles exist across several types and statuses
    When Staff searches a plate fragment and filters AVAILABLE scooters
    Then only matching vehicles are returned in stable pagination order
    And the filter state is represented in the URL

  @US-008 @vehicle @responsive @e2e
  Scenario: Fleet management works at a 360 pixel viewport
    Given Staff opens the fleet list at 360 pixels
    Then each vehicle is represented as a mobile card
    And plate, type, status and primary action remain visible
    And there is no page-level horizontal overflow

  @US-008 @availability @calendar @e2e
  Scenario: Staff sees vehicle availability like a room-booking calendar
    Given synthetic vehicles have available, held and rented periods this month
    When Staff opens the fleet availability calendar
    Then rows identify vehicles and columns identify calendar days
    And each period says Available, Held or Rented with an icon and accessible text
    And Staff can move between date ranges and filter by vehicle type
    When Staff selects an available period
    Then the chosen vehicle and dates can be carried into contract creation

  @US-009 @customer @crud @integration
  Scenario: Staff creates a customer with multiple contact channels
    When Staff creates customer "Test Customer" with phone and email contacts
    Then one customer record owns both normalized contacts
    And the customer can be found by name, phone or email
    And list responses omit private document object keys

  @US-009 @customer @duplicate @integration @e2e
  Scenario: Potential duplicate customer is suggested before creation
    Given a customer owns normalized phone "+84900000001"
    When Staff starts creating another customer with phone "0900000001"
    Then the existing customer is suggested as a possible duplicate
    And Staff can open the existing profile instead of creating a copy

  @US-009 @customer @blacklist @security @integration @e2e
  Scenario: Blacklist warning is explicit during customer selection
    Given a customer has blacklist tag and reason "Synthetic risk fixture"
    When Staff searches that customer for a new contract
    Then the result shows a danger icon, readable warning and reason
    And selecting the customer requires explicit acknowledgement
    And no sensitive document image is included in the warning payload

  @US-009 @documents @authorization @security @integration
  Scenario: Customer document access is private and audited
    Given a customer document metadata record exists in private storage
    When an unauthenticated request asks for the document
    Then the API returns status 401
    When authorized Staff asks for it
    Then the API returns a short-lived access descriptor
    And an audit event records document access without the document contents

  @US-009 @customer @validation @integration
  Scenario: Invalid customer PII is rejected safely
    When Staff submits an invalid phone, malformed email or unknown field
    Then the API returns normalized status 400 with a request identifier
    And the response contains no SQL detail, file key or secret

  @US-007 @US-008 @US-009 @localization @e2e
  Scenario: Fleet and customer interface supports Vietnamese and English
    Given Staff is viewing a filtered customer list in Vietnamese
    When Staff switches to English and navigates to Vehicles and back
    Then navigation, field labels, statuses and actions are English
    And synthetic customer names, plates and document values are unchanged
    And the selected filter remains active
