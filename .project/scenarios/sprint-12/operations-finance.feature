@sprint-12 @phase-2 @damage-catalog @return-photos @deposit-refund @cash-shift
Feature: Damage catalog, return photos, deposit refund and cash shift close
  As the shop
  I want damage prices to come from a catalog, return photos to be kept privately,
  deposits to be refunded through the ledger and every cash shift to be counted
  So that the counter is tight on money and evidence

  Background:
    Given an authenticated rental workspace
    And all vehicles, contracts, catalog items, payments and shifts are synthetic fixtures
    And business days follow Asia/Ho_Chi_Minh while timestamps are persisted in UTC
    And all money is integer VND and financial records are append-only (BR-07, BR-09)
    And the demo scooter pricing is 150000 VND per day for 1–2 days and 130000 VND per day for 3–6 days

  # ---------------------------------------------------------------- US-026 damage catalog

  @US-026 @catalog @authorization @integration
  Scenario: The Owner maintains the damage catalog and Staff only reads it
    When the Owner creates damage item code "guong" named "Gương chiếu hậu" priced 150000
    Then the API answers 201 with code "GUONG", active true and the price 150000
    And an audit event DAMAGE_ITEM_CREATED stores code "GUONG" and priceVnd 150000
    When the Owner creates another item with code "GUONG"
    Then the API answers 409 DAMAGE_ITEM_EXISTS
    When the Owner updates "GUONG" to price 180000 and active false
    Then the API answers 200 with price 180000 and active false
    And an audit event DAMAGE_ITEM_UPDATED stores beforePriceVnd 150000, afterPriceVnd 180000 and active false
    And GET /api/catalog/damage-items returns only active items for Staff
    And GET /api/catalog/damage-items?includeInactive=true returns the inactive item for the Owner
    And Staff creating or updating an item receives 403

  @US-026 @catalog @validation @unit
  Scenario Outline: Damage item input is validated
    When a damage item is submitted with code "<code>", name "<name>" and price <price>
    Then the schema result is <result>

    Examples:
      | code   | name             | price      | result  |
      | GUONG  | Gương chiếu hậu  | 150000     | valid   |
      | g      | Gương            | 150000     | invalid |
      | GUONG  | G                | 150000     | invalid |
      | GUONG  | Gương chiếu hậu  | -1         | invalid |
      | GUONG  | Gương chiếu hậu  | 1000000001 | invalid |

  @US-026 @catalog @return @integration
  Scenario: A return charge priced from the catalog uses the catalog price and name
    Given active damage item "GUONG" priced 150000 and inactive item "YEM" priced 300000
    And an active contract on vehicle-001 with an open line
    When Staff returns the line with condition DAMAGED and a DAMAGE charge referencing item "GUONG"
    Then the contract carries one DAMAGE charge of 150000 described "Gương chiếu hậu"
    And the settlement statement lists the charge with vehicle code "XE-001"
    When Staff adds a manual charge referencing item "YEM"
    Then the API answers 409 DAMAGE_ITEM_INACTIVE
    When Staff adds a manual charge referencing an unknown item
    Then the API answers 404 DAMAGE_ITEM_NOT_FOUND
    And a free-text DAMAGE charge of 120000 "Trầy yếm trước" is still accepted

  # ---------------------------------------------------------------- US-028 return photos

  @US-028 @photos @security @integration
  Scenario: Return photos are uploaded to private storage and served through short-lived links
    Given an active contract on vehicle-001 with an open line
    When Staff uploads two PNG photos of 1 KB for the contract
    Then the API answers 201 with two object keys under "private/returns/<contractId>/"
    And the original file names never appear in the keys
    When Staff returns the line with those two keys
    Then the line inspection reports imageCount 2 and the response never echoes the keys
    And GET /api/contracts/<id>/lines/<lineId>/return-photos returns two signed links expiring in 300 seconds
    And fetching a signed link answers 200 with content type image/png and Cache-Control no-store
    And fetching a tampered link answers 404
    And fetching the link after it expires answers 404

  @US-028 @photos @validation @integration
  Scenario Outline: Uploads that are not small JPEG, PNG or WebP images are refused before storage
    When Staff uploads <file>
    Then the API answers <status> <code>
    And nothing is written to private storage

    Examples:
      | file                                     | status | code               |
      | a GIF renamed to photo.png               | 400    | UNSUPPORTED_FILE   |
      | a text file named notes.txt              | 400    | UNSUPPORTED_FILE   |
      | a PNG of 3 MB                            | 413    | PAYLOAD_TOO_LARGE  |
      | six PNG files in one request             | 400    | TOO_MANY_FILES     |

  # ---------------------------------------------------------------- US-028 deposit refund

  @US-028 @deposit @ledger @integration
  Scenario: The deposit is refunded once, through the ledger, after settlement
    Given a settled contract with deposit 500000, total due 300000, nothing collected and deposit applied 300000
    Then the settlement shows refund 200000 and depositRefunded false
    When Staff posts a deposit refund in CASH with idempotency key K1
    Then the API answers 201 with a ledger row of kind DEPOSIT_REFUND and amount 200000
    And the settlement shows depositRefunded true
    And the ledger balance keeps paidVnd 0 and reports depositRefundedVnd 200000
    And an audit event CONTRACT_DEPOSIT_REFUNDED stores amountVnd 200000 and method CASH
    When Staff replays the refund with key K1
    Then the API answers 201 with the same row and the ledger still has one DEPOSIT_REFUND row
    When Staff posts a refund with a new key
    Then the API answers 409 DEPOSIT_ALREADY_REFUNDED
    And a contract whose settlement has refund 0 receives 409 NO_DEPOSIT_REFUND_DUE
    And a contract that is not settled receives 409 CONTRACT_NOT_SETTLED

  @US-028 @deposit @reporting @unit
  Scenario: Deposit refunds never touch revenue, receivables or the refund cap
    Given payments PAYMENT 300000 CASH, DEPOSIT_REFUND 200000 CASH on a contract due 300000
    Then netPaid is 300000 and remainingReceivable is 0
    And the REFUND cap is 300000
    And the revenue report cash figure for that day is 300000

  # ---------------------------------------------------------------- US-027 cash shift

  @US-027 @cash-shift @integration
  Scenario: A cash shift is opened once and closed with the counted amount
    When Staff opens a shift with opening float 1000000
    Then the API answers 201 with status OPEN, the opener "Nhân viên" and openingFloatVnd 1000000
    And an audit event CASH_SHIFT_OPENED stores openingFloatVnd 1000000
    When the Owner opens another shift
    Then the API answers 409 CASH_SHIFT_ALREADY_OPEN
    Given during the shift a CASH payment 300000, a CASH refund 50000, a CASH deposit refund 200000, a CASH expense 100000 and a BANK_TRANSFER payment 400000 are recorded
    And a CASH expense 70000 was recorded before the shift opened
    When GET /api/cash-shifts/current is called
    Then the expectation shows cashCollectedVnd 300000, cashRefundedVnd 50000, depositRefundedVnd 200000, cashExpensesVnd 100000 and expectedCashVnd 950000
    When Staff closes the shift with counted 930000 and no note
    Then the API answers 400 CASH_SHIFT_NOTE_REQUIRED
    When Staff closes the shift with counted 930000 and note "Thiếu tiền lẻ"
    Then the API answers 200 with status CLOSED, expectedCashVnd 950000, countedCashVnd 930000 and varianceVnd -20000
    And an audit event CASH_SHIFT_CLOSED stores expectedCashVnd 950000, countedCashVnd 930000 and varianceVnd -20000
    When Staff closes the shift again
    Then the API answers 409 CASH_SHIFT_NOT_OPEN

  @US-027 @cash-shift @unit
  Scenario Outline: Expected cash is the opening float plus cash movements inside the window
    Given opening float <float>, cash collected <collected>, cash refunded <refunded>, deposits refunded <deposits> and cash expenses <expenses>
    Then the expected cash is <expected>
    And counting <counted> gives variance <variance>

    Examples:
      | float   | collected | refunded | deposits | expenses | expected | counted | variance |
      | 1000000 | 300000    | 50000    | 200000   | 100000   | 950000   | 930000  | -20000   |
      | 0       | 0         | 0        | 0        | 0        | 0        | 0       | 0        |
      | 500000  | 1200000   | 0        | 0        | 1500000  | 200000   | 250000  | 50000    |

  @US-027 @cash-shift @authorization @integration
  Scenario: Staff sees only their own shifts while the Owner reviews every shift
    Given a closed shift opened by Staff and a closed shift opened by the Owner
    Then GET /api/cash-shifts for Staff lists only the Staff shift
    And GET /api/cash-shifts for the Owner lists both, newest first
    And a note or opening float outside 0–1000000000 is refused with 400

  # ---------------------------------------------------------------- browser journeys

  @US-026 @US-028 @browser
  Scenario: The Owner prices a damage item and Staff uses it with photos while returning a vehicle
    Given the Owner is signed in
    When the Owner opens Cài đặt → Bảng giá hư hỏng and adds "Gương chiếu hậu" at 150000
    Then the table lists "GUONG · Gương chiếu hậu · 150.000 ₫ · Đang dùng"
    Given Staff is signed in with an active contract on XE-001
    When Staff opens Nhận xe from the return queue, picks condition "Hư hỏng", damage item "Gương chiếu hậu", attaches one PNG photo and confirms
    Then the contract detail shows the inspection with "Ảnh nhận xe: 1" and one thumbnail that loads
    And the settlement items list "Gương chiếu hậu · 150.000 ₫"
    When Staff settles the contract and clicks "Hoàn cọc"
    Then the ledger shows a "Hoàn cọc" row and the settlement shows "Đã hoàn cọc"

  @US-027 @browser
  Scenario: Staff opens and closes a cash shift and the Owner reviews it
    Given Staff is signed in
    When Staff opens /cash-shifts, clicks "Mở ca" with float 1000000
    Then the current shift card shows "Đang mở" and "Tiền mặt phải có 1.000.000 ₫"
    When Staff clicks "Đóng ca", enters counted 980000 and note "Thiếu tiền lẻ" and confirms
    Then the history lists the shift with variance "−20.000 ₫" and the note
    Given the Owner is signed in
    Then /cash-shifts lists that shift with the opener "Nhân viên"
