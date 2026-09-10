@sprint-5 @returns @settlement @contracts
Feature: Per-vehicle return, charges and settlement
  As an Owner or Staff member
  I want to receive each vehicle separately, record late and damage charges and settle the contract
  So that multi-vehicle contracts reflect operations and every amount collected or refunded is explicit

  Background:
    Given an authenticated rental workspace
    And all customers, vehicles and contracts are synthetic fixtures
    And rental intervals use Asia/Ho_Chi_Minh business time with an exclusive end boundary
    And timestamps are persisted in UTC and all money is integer VND
    And the demo scooter pricing is 150000 VND per day for 1–2 days with 60 free late minutes and 20000 VND per started late hour

  @US-016 @BR-03 @partial-return @transaction @integration
  Scenario: Returning one vehicle keeps the contract renting
    Given an active contract "HD-A" renting vehicles "XE-001" and "XE-003" until "2026-10-06 08:00"
    When Staff returns "XE-001" at "2026-10-06 08:00" in GOOD condition with 70% fuel
    Then the line for "XE-001" stores the return time, condition, fuel level and receiving staff
    And the contract status is still ACTIVE
    And vehicle "XE-001" is AVAILABLE while vehicle "XE-003" is still RENTED
    And "XE-001" can be booked from "2026-10-06 08:00" although "HD-A" is still open
    And the timeline shows a LINE_RETURNED entry naming "XE-001"

  @US-016 @BR-03 @completion @integration
  Scenario: Returning the last vehicle completes the contract
    Given an active contract "HD-A" renting vehicles "XE-001" and "XE-003"
    And "XE-001" has already been returned
    When Staff returns "XE-003"
    Then the contract status is COMPLETED with the completion time equal to the last return time
    And the timeline shows LINE_RETURNED for "XE-003" followed by COMPLETED
    And an audit event CONTRACT_VEHICLE_RETURNED stores the actor and vehicle
    And the settlement statement is ready

  @US-016 @validation @integration
  Scenario: A vehicle can only be returned once and only while renting
    Given a confirmed contract "HD-B" holding vehicle "XE-001"
    When Staff tries to return "XE-001"
    Then the API returns status 409 with code INVALID_TRANSITION
    Given an active contract "HD-A" whose vehicle "XE-001" was returned
    When Staff tries to return "XE-001" again
    Then the API returns status 404
    When Staff returns a vehicle with an actual return time before the line started
    Then the API returns status 400 with code INVALID_INPUT

  @US-016 @PD-05 @late-fee @money @unit
  Scenario Outline: Late-return charge is computed from the line snapshot at return time
    Given a line scheduled to end at "2026-10-06 08:00" with 60 free minutes and 20000 VND per started hour
    When the vehicle is returned at <returnedAt>
    Then the late minutes are <lateMinutes>
    And the billable late hours are <hours>
    And the late-return charge is <feeVnd> VND

    Examples:
      | returnedAt         | lateMinutes | hours | feeVnd |
      | 2026-10-06 07:00   | 0           | 0     | 0      |
      | 2026-10-06 09:00   | 60          | 0     | 0      |
      | 2026-10-06 09:01   | 61          | 1     | 20000  |
      | 2026-10-06 10:30   | 150         | 2     | 40000  |
      | 2026-10-07 08:00   | 1440        | 23    | 460000 |

  @US-016 @late-fee @audit @integration
  Scenario: Late return records an immutable LATE_RETURN charge
    Given an active contract renting "XE-001" until "2026-10-06 08:00"
    When Staff returns "XE-001" at "2026-10-06 10:30"
    Then a charge of kind LATE_RETURN for 40000 VND is stored with the vehicle, late minutes and started hours
    And the LINE_RETURNED event stores lateFeeVnd 40000 and the scheduled end
    And no user can edit or delete the charge afterwards

  @US-016 @early-return @PD-05 @unit
  Scenario: Early return does not refund unused rental days
    Given a line priced for 2 days ending at "2026-10-06 08:00"
    When the vehicle is returned at "2026-10-05 08:00"
    Then the rental charge stays 300000 VND
    And no late-return charge exists

  @US-016 @BR-02 @vehicle-condition @integration
  Scenario Outline: Vehicle condition at return drives the fleet status
    Given an active contract renting "XE-001"
    When Staff returns "XE-001" with condition <condition>
    Then vehicle "XE-001" status is <vehicleStatus>
    And the status-history reason names the contract

    Examples:
      | condition   | vehicleStatus |
      | GOOD        | AVAILABLE     |
      | MAINTENANCE | MAINTENANCE   |
      | DAMAGED     | DAMAGED       |

  @US-016 @inspection @charges @integration
  Scenario: Inspection can record a damage charge in the same transaction
    Given an active contract renting "XE-001"
    When Staff returns "XE-001" in DAMAGED condition with a DAMAGE charge of 250000 VND "Vỡ yếm trước"
    Then the line is returned and the DAMAGE charge is stored with the vehicle code and description
    And the timeline shows LINE_RETURNED and CHARGE_ADDED entries

  @US-017 @BR-06 @charges @authorization @integration
  Scenario: Manual charges require a reason and discounts are Owner-only
    Given an active contract "HD-A"
    When Staff adds an OTHER charge of 50000 VND without a description
    Then the API returns status 400
    When Staff adds a DISCOUNT of 20000 VND "Khách quen"
    Then the API returns status 403 with code FORBIDDEN
    When the Owner adds a DISCOUNT of 20000 VND "Khách quen"
    Then the discount is stored with the Owner as actor
    And an audit event CONTRACT_CHARGE_ADDED stores kind, amount and description

  @US-017 @BR-04 @settlement @money @unit
  Scenario Outline: Settlement figures are explicit and never ambiguous in sign
    Given charges of <chargesVnd> VND and discounts of <discountsVnd> VND
    And payments of <paidVnd> VND and a deposit of <depositVnd> VND
    When the deposit applied is <applied>
    Then the total due is <totalDue> VND
    And the outstanding amount is <outstanding> VND
    And the receivable from the customer is <receivable> VND
    And the refund to the customer is <refund> VND

    Examples:
      | chargesVnd | discountsVnd | paidVnd | depositVnd | applied | totalDue | outstanding | receivable | refund |
      | 740000     | 0            | 0       | 500000     | default | 740000   | 740000      | 240000     | 0      |
      | 340000     | 0            | 0       | 500000     | default | 340000   | 340000      | 0          | 160000 |
      | 340000     | 40000        | 0       | 500000     | 0       | 300000   | 300000      | 300000     | 500000 |
      | 300000     | 0            | 300000  | 500000     | default | 300000   | 0           | 0          | 500000 |
      | 100000     | 150000       | 0       | 0          | default | 0        | 0           | 0          | 0      |

  @US-017 @settlement @statement @integration
  Scenario: The settlement statement lists rental, delivery, late, damage and discount lines
    Given a completed contract with two scooter lines of 300000 VND, a delivery fee of 50000 VND, a LATE_RETURN charge of 40000 VND, a DAMAGE charge of 100000 VND and an Owner DISCOUNT of 20000 VND
    And the handover deposit is 500000 VND
    When Staff opens the settlement statement
    Then the items are RENTAL ×2, DELIVERY_FEE, LATE_RETURN, DAMAGE and DISCOUNT
    And chargesVnd is 790000, discountsVnd is 20000 and totalDueVnd is 770000
    And paidVnd is 0 because payments arrive in Sprint 6
    And the default deposit applied is 500000, the receivable is 270000 and the refund is 0
    And the statement is marked ready with no open vehicles

  @US-017 @settlement @BR-03 @integration
  Scenario: Settlement is refused while a vehicle is still out or after it was done
    Given an active contract with one returned and one open vehicle
    When Staff settles the contract
    Then the API returns status 409 with code INVALID_TRANSITION naming the open vehicle
    Given a completed and settled contract
    When Staff settles it again or adds a charge
    Then the API returns status 409 with code INVALID_TRANSITION

  @US-017 @settlement @release @audit @integration
  Scenario: Settlement confirms deposit and document release and freezes the figures
    Given a completed contract with total due 340000 VND, deposit 500000 VND and retained document "CCCD ••••0000"
    When Staff settles without confirming the document return
    Then the API returns status 400 explaining the document must be returned
    When Staff settles with deposit applied 340000, document returned and deposit refunded
    Then the settlement stores totalDue 340000, depositApplied 340000, refund 160000, receivable 0, the actor and the time
    And the contract records settledAt and the timeline shows a SETTLED entry with the four amounts
    And a later Owner discount attempt returns status 409
    And an audit event CONTRACT_SETTLED stores the amounts

  @US-017 @settlement @validation @integration
  Scenario: Deposit applied cannot exceed the deposit or the outstanding amount
    Given a completed contract with total due 740000 VND and deposit 500000 VND
    When Staff settles with deposit applied 600000
    Then the API returns status 400 with code INVALID_INPUT
    When Staff settles with deposit applied 500000
    Then the receivable is 240000 VND and the refund is 0 VND

  @US-016 @queue @timezone @integration
  Scenario: The return queue lists vehicles still out ordered by urgency
    Given "now" is "2026-10-06 15:00" in Asia/Ho_Chi_Minh
    And an active contract "HD-A" renting "XE-001" until "2026-10-06 09:00" and "XE-003" until "2026-10-06 23:30"
    And an active contract "HD-B" renting "XE-002" until "2026-10-08 08:00"
    When Staff loads the return queue
    Then "HD-A" is listed first as OVERDUE with "XE-001" 6 hours late and "XE-003" due today
    And "HD-B" is listed as LATER with 0 hours late
    And counters report 1 overdue, 1 due today and 2 renting contracts
    When "XE-001" is returned
    Then "HD-A" only lists "XE-003"

  @lifecycle @regression @integration
  Scenario: Extension and swap ignore returned lines
    Given an active contract renting "XE-001" and "XE-003" where "XE-001" was returned
    When Staff extends the contract
    Then only the "XE-003" line is repriced and checked for conflicts
    When Staff tries to swap the returned "XE-001" line
    Then the API returns status 404

  @US-016 @e2e @mobile
  Scenario: Staff receives vehicles from the return queue
    Given an overdue two-vehicle contract seeded through the API
    When Staff opens "Trả xe"
    Then the contract is listed under "Quá hạn" with both vehicles and hours late
    When Staff taps "Nhận xe" for the first vehicle and confirms the inspection
    Then the vehicle disappears from the queue while the contract remains listed
    When Staff receives the second vehicle
    Then the contract leaves the queue and the detail page shows "Đã trả"

  @US-017 @e2e
  Scenario: Staff settles a contract from the detail page
    Given a completed contract whose statement shows rent, a late fee and a damage charge
    When Staff opens "Tất toán"
    Then the dialog shows the total due, the deposit applied and either "Hoàn lại cho khách" or "Khách còn phải trả"
    And the checklist requires confirming the returned document
    When Staff confirms
    Then the page shows "Đã tất toán" with the settlement time
    And no further charge or settlement action is offered
