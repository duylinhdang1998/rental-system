@sprint-3 @pricing @contracts
Feature: Pricing and multi-vehicle contract creation
  As an Owner or Staff member
  I want an atomic, explainable contract workflow
  So that pricing, availability, handover evidence and bilingual documents stay trustworthy

  Background:
    Given an authenticated rental workspace
    And all customers, vehicles and files are synthetic fixtures
    And rental intervals use Asia/Ho_Chi_Minh time with an exclusive end boundary

  @US-007 @pricing @golden @unit
  Scenario Outline: Rental days use 24-hour blocks with a 60-minute grace period
    Given a rental starts at "2026-09-01 08:00"
    When its requested end is <end>
    Then the billable rental days are <days>

    Examples:
      | end                | days |
      | "2026-09-02 08:00" | 1    |
      | "2026-09-02 09:00" | 1    |
      | "2026-09-02 09:01" | 2    |

  @US-007 @pricing @tier @golden @unit
  Scenario Outline: Versioned tiers produce integer VND totals
    Given scooter pricing is 150000 per day for 1-2 days, 130000 for 3-6 days and 100000 for 7 or more days
    When pricing is calculated for <days> days
    Then the selected daily rate is <dailyRate>
    And the vehicle subtotal is <subtotal>

    Examples:
      | days | dailyRate | subtotal |
      | 1    | 150000    | 150000   |
      | 5    | 130000    | 650000   |
      | 7    | 100000    | 700000   |

  @US-007 @pricing @snapshot @integration
  Scenario: Existing contracts retain their price snapshot
    Given a contract line was quoted from pricing version 1
    When the Owner publishes pricing version 2
    Then a new quote uses version 2
    And the existing line keeps version 1 rates and totals

  @US-012 @pricing @customer-tag @unit
  Scenario: Customer tag adjustment remains explainable
    Given a 5-day scooter subtotal is 650000 VND
    And the customer has a synthetic VIP adjustment of 10 percent
    When the quote is calculated
    Then the adjusted subtotal is 585000 VND
    And the explanation names the tier, adjustment and final amount

  @US-012 @override @audit @integration
  Scenario: Manual price override requires a reason and actor
    Given the calculated vehicle subtotal is 650000 VND
    When an authorized user overrides it to 600000 VND without a reason
    Then the API returns status 400
    When the user supplies reason "Synthetic negotiated rate"
    Then the quote stores 650000 and 600000 VND
    And append-only audit records actor, reason and before/after values

  @US-011 @availability @boundary @unit @integration
  Scenario: Adjacent rental intervals do not overlap
    Given vehicle "TEST-001" is reserved from "2026-09-01 08:00" until "2026-09-02 08:00"
    When another quote starts exactly at "2026-09-02 08:00"
    Then the vehicle is available
    When another quote starts one minute earlier
    Then the vehicle is unavailable with the conflicting interval

  @US-010 @US-011 @transaction @concurrency @integration
  Scenario: Concurrent double booking has one winner
    Given vehicle "TEST-001" is initially available
    When two contract transactions reserve the same overlapping interval concurrently
    Then exactly one transaction commits
    And the other returns status 409 with the conflicting vehicle
    And no partial contract or orphan line remains

  @US-010 @transaction @integration
  Scenario: Multi-vehicle contract creation is atomic
    Given three vehicles were selected for one customer and interval
    And the second vehicle became unavailable after the quote
    When Staff confirms the contract
    Then the entire transaction is rejected with status 409
    And none of the three vehicle lines is reserved
    And the user can return to vehicle selection with form data preserved

  @US-010 @contract @integration
  Scenario: Valid multi-vehicle contract receives a unique code
    Given a customer, two available vehicles and a valid quote
    When Staff confirms the contract
    Then one contract with a unique generated code owns two vehicle lines
    And each line stores interval, price snapshot and subtotal
    And the contract total equals line totals plus delivery fee

  @US-013 @handover @validation @integration
  Scenario: Handover evidence is validated and stored privately
    Given a valid draft contract
    When Staff records deposit, retained document, delivery place, fuel level, notes and two images
    Then monetary values use integer VND and fuel is between 0 and 100
    And image object keys remain private
    And authorized reads receive only short-lived access descriptors

  @US-013 @pdf @integration
  Scenario: Authorized user exports a bilingual contract PDF
    Given a confirmed contract with two vehicle lines
    When Staff requests the contract PDF
    Then the response is a valid PDF with contract code and Việt-Anh section labels
    And the PDF is generated from the immutable contract snapshot
    And an unauthenticated request receives status 401

  @US-010 @responsive @accessibility @e2e
  Scenario: Staff completes contract creation at a 360 pixel viewport
    Given Staff opens the contract wizard at 360 pixels
    When Staff completes Customer, Vehicles, Pricing, Handover and Confirmation steps
    Then each step has one visible primary action and a readable progress indicator
    And validation moves focus to the first invalid field
    And there is no page-level horizontal overflow

  @US-011 @conflict @e2e
  Scenario: Availability conflict preserves entered contract data
    Given Staff has completed customer, pricing and handover fields
    When confirmation receives a vehicle conflict
    Then the conflicting vehicle and interval are explained without relying on color alone
    And Staff returns to vehicle selection
    And valid customer, pricing and handover fields remain populated

  @US-012 @localization @e2e
  Scenario: Price explanation and confirmation follow the selected locale
    Given Staff built a quote in Vietnamese
    When Staff switches to English
    Then step labels, price explanation, dates and VND formatting use English locale
    And customer names, plates, notes and stored snapshot values are unchanged
