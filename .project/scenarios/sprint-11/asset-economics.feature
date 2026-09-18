@sprint-11 @phase-2 @economics @expenses
Feature: Vehicle cost, depreciation, expenses and break-even
  As the Owner
  I want every vehicle's cost, depreciation, expenses and attributed revenue in one place
  So that I know when each vehicle pays for itself and every đồng spent is traceable

  Background:
    Given an authenticated rental workspace
    And all vehicles, contracts, expenses and acquisitions are synthetic fixtures
    And business days follow Asia/Ho_Chi_Minh while timestamps are persisted in UTC
    And all money is integer VND and financial records are append-only (BR-07, BR-09)
    And the demo scooter pricing is 150000 VND per day for 1–2 days and 130000 VND per day for 3–6 days

  @US-023 @acquisition @unit
  Scenario Outline: Straight-line depreciation is derived from the acquisition record
    Given a vehicle bought for <price> VND on <purchasedOn> with <life> months of useful life and <salvage> VND salvage value
    When the depreciation is evaluated as of <asOf>
    Then <monthsElapsed> whole months have elapsed
    And the monthly depreciation is <monthly>
    And the accumulated depreciation is <accumulated>
    And the book value is <bookValue>

    Examples:
      | price    | purchasedOn | life | salvage | asOf       | monthsElapsed | monthly | accumulated | bookValue |
      | 30000000 | 2026-01-15  | 36   | 3000000 | 2026-09-18 | 8             | 750000  | 6000000     | 24000000  |
      | 30000000 | 2026-01-15  | 36   | 3000000 | 2026-09-14 | 7             | 750000  | 5250000     | 24750000  |
      | 30000000 | 2026-01-15  | 36   | 3000000 | 2030-01-15 | 48            | 750000  | 27000000    | 3000000   |
      | 30000000 | 2026-09-18  | 36   | 3000000 | 2026-09-18 | 0             | 750000  | 0           | 30000000  |
      | 10000000 | 2026-01-01  | 3    | 0       | 2026-02-15 | 1             | 3333333 | 3333333     | 6666667   |

  @US-023 @acquisition @authorization @integration
  Scenario: The Owner records a vehicle acquisition and the change is audited
    Given vehicle "XE-001" has no acquisition record
    When the Owner sets purchase price 30000000, purchased on 2026-01-15, 36 months and salvage 3000000
    Then the API answers 200 with the stored acquisition and the Owner as updater
    And GET /api/fleet/vehicles/vehicle-001/acquisition returns the same record for Staff
    And an audit event VEHICLE_ACQUISITION_SET stores before 0 and after 30000000
    When the Owner changes the purchase price to 32000000
    Then the audit event stores before 30000000 and after 32000000
    And Staff sending an acquisition receives 403
    And an unknown vehicle receives 404

  @US-023 @acquisition @validation @unit
  Scenario Outline: Acquisition input is validated
    When an acquisition is submitted with price <price>, life <life> months and salvage <salvage>
    Then the schema result is <result>

    Examples:
      | price    | life | salvage  | result  |
      | 30000000 | 36   | 3000000  | valid   |
      | 0        | 12   | 0        | valid   |
      | 30000000 | 0    | 0        | invalid |
      | 30000000 | 241  | 0        | invalid |
      | 30000000 | 36   | 30000001 | invalid |

  @US-024 @expenses @ledger @integration
  Scenario: Staff records a vehicle expense and the ledger keeps who, when and how
    Given vehicle "XE-001" exists
    When Staff records a MAINTENANCE expense of 250000 VND in CASH paid on 2026-09-10 for vehicle-001 with description "Thay nhớt"
    Then the API answers 201 with the expense, vehicle code "XE-001", recordedByName "Nhân viên" and reversalOfId null
    And GET /api/expenses lists it newest paid day first with totals cash 250000, transfer 0, net 250000
    And the category breakdown shows MAINTENANCE 250000
    And an audit event EXPENSE_RECORDED stores amount, category and vehicle code

  @US-024 @expenses @idempotency @integration
  Scenario: Replaying an expense with the same idempotency key does not double-record
    When Staff records an expense with idempotency key "K1"
    And the same request is replayed with key "K1"
    Then the ledger holds exactly one entry and both responses carry the same id
    When a different amount is sent with key "K1"
    Then the API returns status 409 with code CONFLICT

  @US-024 @expenses @validation @integration
  Scenario: Expense input is validated
    When Staff records an expense with amount 0
    Then the API returns 400
    When Staff records an expense for vehicle "no-such-vehicle"
    Then the API returns 404
    When Staff records an expense with an unknown category
    Then the API returns 400

  @US-024 @expenses @reversal @BR-09 @integration
  Scenario: The Owner corrects an expense with a reversal entry, never an edit
    Given an expense of 250000 VND recorded by Staff
    When the Owner reverses it with reason "Nhập nhầm xe"
    Then the API answers 201 with a reversal entry whose reversalOfId is the original id and amount 250000
    And the original now carries reversedByExpenseId
    And GET /api/expenses shows both rows with totals reversed 250000 and net 0
    And an audit event EXPENSE_REVERSED stores the reason and the amount
    When the Owner reverses the same expense again
    Then the API returns 409
    When the Owner reverses the reversal entry itself
    Then the API returns 409
    When Staff tries to reverse an expense
    Then the API returns 403
    And there is no PATCH or DELETE route for expenses

  @US-024 @expenses @filters @integration
  Scenario: The expense list filters by paid day, category and vehicle
    Given expenses on 2026-09-01 (FUEL, no vehicle), 2026-09-10 (MAINTENANCE, vehicle-001) and 2026-09-12 (INSURANCE, vehicle-002)
    When Staff lists expenses from 2026-09-05 to 2026-09-12
    Then only the two later expenses are returned, newest paid day first
    When Staff lists expenses for vehicle-001
    Then only the MAINTENANCE expense is returned
    When Staff lists expenses for category FUEL
    Then only the FUEL expense is returned
    And a malformed day or a limit above 500 answers 400

  @US-025 @economics @revenue-attribution @unit
  Scenario: Revenue is attributed to vehicles from contract lines and line-level charges
    Given an activated contract with two lines: XE-001 for 4 days at 130000 (520000) and XE-002 for 1 day at 150000
    And a delivery fee of 30000 and a contract-level DISCOUNT of 20000
    And a LATE_RETURN charge of 40000 on the XE-001 line and a DAMAGE charge of 100000 on the XE-002 line
    And a line-level DISCOUNT of 10000 on the XE-002 line
    When vehicle revenue is attributed as of today
    Then XE-001 earns 560000 over 4 rental days
    And XE-002 earns 240000 over 1 rental day
    And unallocated revenue is 10000 (delivery fee 30000 minus contract discount 20000)
    And a CONFIRMED (not activated) contract and a CANCELLED contract contribute nothing
    And a line replaced by a swap still counts what it earned before the swap

  @US-025 @economics @break-even @unit
  Scenario Outline: Break-even is derived from cost, cumulative net and the trailing 90-day rate
    Given a vehicle with purchase price <cost> and cumulative net <net>
    And a trailing 90-day net of <trailing>
    When break-even is evaluated as of 2026-09-18
    Then the status is <status>, months remaining <months> and recovered <recovered> percent

    Examples:
      | cost     | net      | trailing | status          | months | recovered |
      | 0        | 500000   | 100000   | NO_COST         | null   | 0         |
      | 30000000 | 30000000 | 0        | RECOVERED       | 0      | 100       |
      | 30000000 | 10000000 | 3000000  | PROJECTED       | 20     | 33        |
      | 30000000 | 10000000 | 0        | NOT_PROJECTABLE | null   | 33        |
      | 30000000 | -500000  | -100000  | NOT_PROJECTABLE | null   | 0         |

  @US-025 @economics @BR-08 @integration
  Scenario: The fleet economics report reconciles vehicles, expenses and depreciation for the Owner only
    Given vehicle-001 was bought for 30000000 on 2026-01-15 with 36 months and salvage 3000000
    And an activated 4-day contract on vehicle-001 (520000) with a 40000 late fee and a settled delivery fee of 30000
    And a MAINTENANCE expense of 250000 on vehicle-001 and a RENT expense of 5000000 with no vehicle
    When the Owner requests GET /api/reports/fleet-economics?asOf=2026-09-18
    Then the vehicle-001 row shows revenueVnd 560000, expensesVnd 250000, netVnd 310000, rentalDays 4
    And accumulatedDepreciationVnd 6000000, bookValueVnd 24000000, recoveredPercent 1 and status PROJECTED
    And vehicles without an acquisition show status NO_COST and book value 0
    And totals show unallocatedRevenueVnd 30000 and unallocatedExpensesVnd 5000000
    And Staff requesting the report or its export receives 403
    And a malformed asOf answers 400

  @US-025 @economics @export @integration
  Scenario: The fleet economics workbook has one row per vehicle plus totals
    When the Owner downloads GET /api/reports/fleet-economics/export?asOf=2026-09-18
    Then the response is an xlsx attachment named "hieu-qua-doi-xe-2026-09-18.xlsx"
    And the sheet "Đội xe" has the header row, one row per vehicle, an unallocated row and a totals row
    And money cells are numeric

  @US-023 @US-024 @US-025 @browser
  Scenario: The Owner records cost and expenses and reads the fleet economics page
    Given the Owner is signed in
    When the Owner opens /vehicles and chooses "Giá vốn" on XE-001
    And enters price 30000000, purchased on 2026-01-15, 36 months, salvage 3000000 and saves
    Then the row shows the book value badge
    When the Owner opens /expenses and records a MAINTENANCE expense of 250000 for XE-001
    Then the list shows the expense with "Nhân viên" or "Chủ cửa hàng" as recorder and the net total
    When the Owner reverses it with a reason
    Then the row is marked "Đã đảo" and the net total returns to 0
    When the Owner opens /reports/fleet
    Then the XE-001 row shows the book value and the break-even badge
    And the "Doanh thu" and "Đội xe" report tabs switch between the two reports

  @US-024 @browser
  Scenario: Staff records an expense but never sees a reversal button or the economics report
    Given Staff is signed in
    When Staff opens /expenses and records a FUEL expense with no vehicle
    Then the list shows it and no "Đảo" button is rendered
    And /reports/fleet shows the access-denied screen
    And GET /api/reports/fleet-economics answers 403
