@sprint-13 @phase-2 @analytics @utilisation @pnl @trend-charts
Feature: Multi-dimensional revenue, utilisation, profit and loss and twelve-month trends
  As the Owner
  I want revenue split by vehicle type, vehicle, customer nationality and month, surcharges by kind,
  utilisation per vehicle and type, a monthly profit and loss and twelve-month trend charts
  So that I optimise the fleet and the price list instead of guessing from a single total

  Background:
    Given an authenticated rental workspace
    And all vehicles, customers, contracts, expenses and acquisitions are synthetic fixtures
    And business days follow Asia/Ho_Chi_Minh while timestamps are persisted in UTC
    And all money is integer VND and financial records are append-only (BR-07, BR-09)
    And the demo scooter pricing is 150000 VND per day for 1–2 days and 130000 VND per day for 3–6 days
    And the demo fleet is XE-001, XE-002, XE-003 of type SCOOTER ("Xe tay ga") and the demo customer is Vietnamese ("VN")

  # ---------------------------------------------------------------- US-029 revenue by dimension

  @US-029 @revenue @unit
  Scenario: Revenue events are accrued once and every dimension reconciles to the same total
    Given an active four-day contract on XE-001 from 2026-09-01 (520000) with a delivery fee of 30000
    And a line-level OTHER charge of 40000 created on 2026-09-05
    And a contract-level DISCOUNT of 20000 created on 2026-09-06
    When the analytics report is computed for 2026-09-01 to 2026-09-30
    Then the total revenue is 570000 over 4 rental days and 1 contract
    And the vehicle type row SCOOTER shows 560000 and the "Chưa phân bổ" row shows 10000
    And the vehicle row XE-001 shows 560000 with 4 rental days and share 98 %
    And the nationality row VN shows 570000 (delivery fee and discount included) and share 100 %
    And the month row 2026-09 shows 570000
    And a CONFIRMED booking and a cancelled contract contribute nothing

  @US-029 @surcharges @unit
  Scenario: Surcharges are grouped by kind with counts and unsigned amounts
    Given charges inside the window: LATE_RETURN 40000, DAMAGE 150000, DAMAGE 180000, OTHER 30000, DISCOUNT 20000
    When the surcharge rows are computed
    Then LATE_RETURN shows count 1 amount 40000, DAMAGE count 2 amount 330000, OTHER count 1 amount 30000, DISCOUNT count 1 amount 20000
    And the net surcharge total is 380000 (discounts subtract)
    And a charge created outside the window is not counted

  @US-029 @utilisation @unit
  Scenario Outline: Utilisation counts occupied days over available days inside the window
    Given a vehicle created on <createdOn> with one line from <lineStart> to <lineEnd>
    When utilisation is computed for 2026-05-01 to 2026-05-31
    Then the row shows rented <rented> over available <available> days and <percent> %

    Examples:
      | createdOn  | lineStart              | lineEnd                | rented | available | percent |
      | 2026-01-01 | 2026-05-10T01:00:00Z   | 2026-05-13T01:00:00Z   | 3      | 31        | 9       |
      | 2026-01-01 | 2026-04-28T01:00:00Z   | 2026-05-03T01:00:00Z   | 2      | 31        | 6       |
      | 2026-05-16 | 2026-05-20T01:00:00Z   | 2026-06-05T01:00:00Z   | 12     | 16        | 75      |
      | 2026-06-01 | 2026-06-02T01:00:00Z   | 2026-06-03T01:00:00Z   | 0      | 0         | 0       |

  @US-029 @utilisation @unit
  Scenario: A returned line stops occupying the vehicle at the actual return
    Given a line from 2026-05-10T01:00:00Z to 2026-05-16T01:00:00Z returned on 2026-05-12T01:00:00Z
    When utilisation is computed for 2026-05-01 to 2026-05-31
    Then the vehicle shows 2 rented days
    And the type row SCOOTER sums rented and available days of its vehicles
    And the fleet row sums every vehicle

  @US-029 @analytics @authorization @integration
  Scenario: The Owner reads the analytics report and Staff is refused
    Given the golden contract of the first scenario exists in the demo workspace
    When the Owner requests GET /api/reports/analytics?from=2026-09-01&to=2026-09-30
    Then the API answers 200 with totals revenueVnd 570000, rentalDays 4 and contractCount 1
    And byType has SCOOTER 560000 and "unallocated" 10000
    And byNationality has VN 570000 with sharePercent 100
    And byMonth has 2026-09 570000
    And surcharges list OTHER count 1 amount 40000 and DISCOUNT count 1 amount 20000
    And utilisation.byVehicle has XE-001 rentedDays 4 availableDays 30 utilisationPercent 13
    When the Owner requests a range longer than 366 days
    Then the API answers 400 INVALID_INPUT
    When Staff requests the report or its export
    Then the API answers 403 FORBIDDEN

  @US-029 @export @integration
  Scenario: The analytics workbook carries one sheet per dimension
    When the Owner downloads GET /api/reports/analytics/export?from=2026-09-01&to=2026-09-30
    Then the file name is phan-tich-2026-09-01-2026-09-30.xlsx
    And the workbook lists the sheets "Loại xe", "Xe", "Quốc tịch", "Tháng", "Phụ phí" and "Sử dụng xe"
    And the vehicle sheet holds XE-001 with the numeric value 560000
    And the export is throttled by the export policy

  # ---------------------------------------------------------------- US-029 profit and loss

  @US-029 @pnl @unit
  Scenario: Monthly profit and loss subtracts expenses and straight-line depreciation
    Given revenue of 570000 in 2026-09 and 300000 in 2026-08
    And expenses of 250000 paid on 2026-09-10 with a reversal of 250000 on 2026-09-12 and 5000000 paid on 2026-08-01
    And an acquisition of 30000000 on 2026-01-15 with salvage 3000000 over 36 months (750000 per month)
    When the profit and loss is computed for the 12 months ending 2026-09
    Then 2026-09 shows revenue 570000, expenses 0, depreciation 750000 and profit -180000
    And 2026-08 shows revenue 300000, expenses 5000000, depreciation 750000 and profit -5450000
    And 2025-10 shows depreciation 0 because the vehicle was bought later
    And 2026-02 shows depreciation 750000 for the first elapsed month
    And the totals sum the twelve rows

  @US-029 @pnl @validation @unit
  Scenario Outline: The profit and loss query is validated
    When the query is months=<months> to=<to>
    Then the schema result is <result>

    Examples:
      | months | to       | result  |
      | 12     | 2026-09  | valid   |
      | 1      | 2026-01  | valid   |
      | 24     | 2026-09  | valid   |
      | 0      | 2026-09  | invalid |
      | 25     | 2026-09  | invalid |
      | 12     | 2026-9   | invalid |
      | 12     | 2026-13  | invalid |

  @US-029 @pnl @integration
  Scenario: The Owner reads and exports the profit and loss
    Given the golden contract, the acquisition on XE-001 and the two expenses exist
    When the Owner requests GET /api/reports/pnl?to=2026-09&months=12
    Then the API answers 200 with from 2025-10, to 2026-09 and twelve month rows
    And the 2026-09 row shows revenueVnd 570000, expensesVnd 250000, depreciationVnd 750000 and profitVnd -430000
    And GET /api/reports/pnl without a query defaults to the current business month and 12 months
    When the Owner downloads GET /api/reports/pnl/export?to=2026-09&months=12
    Then the file name is lai-lo-2025-10-2026-09.xlsx with the sheet "Lãi lỗ" and a numeric -430000
    And Staff receives 403 on both routes

  # ---------------------------------------------------------------- US-029 / US-030 screens

  @US-029 @screen @browser
  Scenario: The Owner reads the analytics page
    Given a three-day contract on XE-003 from 2026-08-10 (390000) was activated and returned on time
    And the demo vehicles were created in early August 2026, so earlier windows have no available days
    When the Owner opens /reports/analytics and sets the range 2026-08-05 to 2026-08-31
    Then the KPI cards show the revenue, rental days, contracts and net surcharges
    And the type table has a row SCOOTER "Xe tay ga", the vehicle table a row XE-003 with 390.000 and 3 days
    And the nationality table has a row VN and the month table a row 08/2026
    And the utilisation table shows XE-003 with 3/27 days and 11 %
    And the monthly chart is an inline SVG with an accessible name and a table fallback
    And "Xuất Excel" links to /api/reports/analytics/export with the same range

  @US-029 @screen @browser
  Scenario: The range form refuses more than 366 days before any request is sent
    When the Owner sets 2025-01-01 to 2026-09-18
    Then the form shows "Báo cáo tối đa 366 ngày" and the export button is disabled
    And no report request is issued

  @US-030 @screen @browser
  Scenario: The Owner reads the twelve-month profit and loss with the trend chart
    When the Owner opens /reports/pnl
    Then the page defaults to the twelve months ending this month
    And the trend chart draws revenue, expenses and profit as three labelled lines in one SVG
    And the table lists one row per month with revenue, expenses, depreciation and profit
    And a negative profit renders with a true minus sign
    And "Xuất Excel" links to /api/reports/pnl/export with the same query
    And choosing 6 months redraws the chart with six points

  @US-030 @chart @unit
  Scenario Outline: The chart geometry is pure and handles empty, flat and negative series
    Given the series <series>
    When the geometry is computed for a 600 by 240 canvas
    Then the zero line is at <zeroY> and the first point is at y <firstY>

    Examples:
      | series             | zeroY | firstY |
      | []                 | 200   | 200    |
      | [0, 0, 0]          | 200   | 200    |
      | [100, 200]         | 200   | 120    |
      | [-100, 100]        | 120   | 200    |

  @US-029 @authorization @browser
  Scenario: Staff cannot open the analytics or profit and loss pages
    When Staff opens /reports/analytics or /reports/pnl
    Then the access-denied screen is shown
    And the two routes pass the axe WCAG 2.2 AA sweep at 360 px and 1280 px for the Owner
