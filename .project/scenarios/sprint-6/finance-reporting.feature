@sprint-6 @finance @payments @reporting
Feature: Payment ledger, receivables and revenue reporting
  As an Owner or Staff member
  I want to collect money in several transactions and methods, follow up debts and reconcile revenue
  So that every đồng received, refunded or still owed is explicit and the daily report matches the ledger

  Background:
    Given an authenticated rental workspace
    And all customers, vehicles, contracts and payments are synthetic fixtures
    And business days follow Asia/Ho_Chi_Minh while timestamps are persisted in UTC
    And all money is integer VND and financial records are append-only (BR-07)
    And the demo scooter pricing is 150000 VND per day

  @US-018 @FR-08 @ledger @transaction @integration
  Scenario: Staff collects a contract in two methods and the ledger nets the balance
    Given a completed contract "HD-A" whose total due is 300000 VND with no deposit
    When Staff records a CASH payment of 100000 VND
    And Staff records a BANK_TRANSFER payment of 150000 VND with reference "FT26091012"
    Then the ledger lists two PAYMENT entries in received order with method, reference and staff
    And the balance shows paid 250000, remaining 50000 and cash 100000 / transfer 150000
    And the settlement statement reports paidVnd 250000 and receivable 50000
    And the timeline shows two PAYMENT_RECORDED entries
    And an audit event CONTRACT_PAYMENT_RECORDED stores actor, method and amount

  @US-018 @BR-04 @money @unit
  Scenario Outline: Payment balance is explicit in direction and never signed
    Given a contract whose total due is <totalDue> VND with deposit <deposit> VND
    And payments totalling <paid> VND and refunds totalling <refunded> VND
    Then the net paid amount is <net>
    And the remaining receivable is <remaining>
    And the refund preview at settlement is <refundPreview>

    Examples:
      | totalDue | deposit | paid   | refunded | net    | remaining | refundPreview |
      | 300000   | 0       | 250000 | 0        | 250000 | 50000     | 0             |
      | 300000   | 500000  | 0      | 0        | 0      | 300000    | 200000        |
      | 300000   | 500000  | 300000 | 0        | 300000 | 0         | 500000        |
      | 300000   | 0       | 300000 | 50000    | 250000 | 50000     | 0             |

  @US-018 @validation @integration
  Scenario: A payment cannot exceed the remaining receivable
    Given a completed contract "HD-A" whose remaining receivable is 50000 VND
    When Staff records a CASH payment of 60000 VND
    Then the API returns status 400 with code INVALID_INPUT naming the 50000 VND cap
    And no ledger entry or event was written

  @US-018 @idempotency @integration
  Scenario: Replaying a payment with the same idempotency key does not double-collect
    Given a completed contract "HD-A" with remaining receivable 300000 VND
    When Staff records a CASH payment of 100000 VND with idempotency key "K1"
    And the same request is replayed with key "K1"
    Then the ledger holds exactly one entry of 100000 VND
    And both responses return the same contract snapshot
    When a different payment is sent with key "K1" and amount 20000 VND
    Then the API returns status 409 with code CONFLICT

  @US-018 @refund @integration
  Scenario: A refund reverses money already collected and never exceeds it
    Given a completed contract "HD-A" with net paid 250000 VND
    When the Owner records a CASH refund of 50000 VND with a reason
    Then the ledger shows a REFUND entry and net paid becomes 200000
    And the timeline shows REFUND_RECORDED with the reason
    When Staff records a refund of 250000 VND
    Then the API returns status 400 with code INVALID_INPUT naming the 200000 VND cap

  @US-018 @BR-07 @immutability @integration
  Scenario: Ledger entries are immutable and payments stay possible after settlement
    Given a settled contract "HD-B" whose settlement froze receivable 200000 VND
    When Staff records a BANK_TRANSFER payment of 200000 VND
    Then the ledger accepts it and the remaining receivable is 0
    And the frozen settlement figures are unchanged (BR-07)
    And there is no API route to update or delete a ledger entry
    Given a cancelled contract "HD-C"
    When Staff records a payment
    Then the API returns status 409 with code INVALID_TRANSITION

  @US-018 @receivables @integration
  Scenario: The receivable list shows every contract that still owes money
    Given contract "HD-A" with remaining 50000 VND ended 3 days ago
    And contract "HD-B" settled yesterday with remaining 200000 VND
    And contract "HD-D" fully paid
    When Staff opens the receivable list
    Then it lists "HD-A" and "HD-B" oldest first with customer, remaining, days outstanding and last payment
    And it omits "HD-D" and every cancelled contract
    And the total remaining is 250000 VND across 2 contracts
    When "HD-A" is paid in full
    Then "HD-A" leaves the list

  @US-019 @FR-09 @BR-08 @authorization @integration
  Scenario: Revenue aggregates are Owner-only at the API and the UI
    Given a Staff session
    When Staff requests GET /api/reports/revenue
    Then the API returns status 403
    When Staff requests GET /api/reports/revenue/export
    Then the API returns status 403
    And the "Báo cáo" navigation item is hidden for Staff
    And the Owner receives status 200 for both routes

  @US-019 @FR-09 @business-day @unit
  Scenario: Daily rows group payments by Asia/Ho_Chi_Minh business day
    Given a payment received at "2026-09-09T17:30:00Z"
    And a payment received at "2026-09-09T16:30:00Z"
    Then the first payment belongs to business day "2026-09-10"
    And the second payment belongs to business day "2026-09-09"
    And a report from "2026-09-10" to "2026-09-10" includes only the first payment

  @US-019 @FR-09 @golden @integration
  Scenario: Revenue report totals reconcile to the ledger for the period
    Given contract "HD-A" collected 100000 CASH and 150000 BANK_TRANSFER today by Staff
    And contract "HD-B" collected 200000 BANK_TRANSFER today by the Owner and refunded 50000 CASH
    When the Owner requests the revenue report for today
    Then totals are cash 100000, transfer 350000, refunds 50000, net 400000 over 4 transactions and 2 contracts
    And the daily row for today carries the same figures
    And the employee rows show Staff net 250000 and Owner net 150000 with names, not ids
    And the receivable aging lists open debts as of now in buckets: current, 1–7, 8–30 and over 30 days
    And the contract rows follow the 14-column client layout

  @US-019 @FR-09 @export @integration
  Scenario: Excel export follows the approved 14-column layout
    Given the revenue report for today has two contract rows
    When the Owner downloads GET /api/reports/revenue/export?from=today&to=today
    Then the response is an .xlsx attachment named "doanh-thu-<from>-<to>.xlsx"
    And sheet "Doanh thu" has the header row: STT, Khách hàng, Liên hệ, Thời gian, Ngày trả, Xe, Số ngày thuê, Đơn giá, Chuyển khoản, Tiền mặt, Cọc / Giấy tờ, Địa chỉ, Nhân viên, Ghi chú
    And the last row totals the bank transfer and cash columns
    And every amount is a numeric cell, never text

  @US-019 @validation @integration
  Scenario: Report ranges are validated
    When the Owner requests a report whose "to" precedes "from"
    Then the API returns status 400 with code INVALID_INPUT
    When the Owner requests a range longer than 92 days
    Then the API returns status 400

  @US-018 @ui @e2e
  Scenario: Staff collects money from the contract detail page
    Given an overdue contract with receivable 150000 VND and an empty ledger
    When Staff opens the detail page and clicks "Thu tiền"
    And enters 100000 VND, method "Tiền mặt", note "Thu lần 1" and confirms
    Then the ledger lists "+100.000 ₫" with the note and shows "Còn phải thu 50.000 ₫"
    And the timeline shows a "Thu tiền" event
    When Staff opens "Công nợ" and collects the remaining 50000 VND from the row
    Then the contract leaves the "Công nợ" page
    And the "Thu tiền" action stays on the detail page for refunds until the contract is settled

  @US-019 @ui @e2e
  Scenario: Owner reviews today's revenue and exports Excel
    Given payments were recorded today
    When the Owner opens "Báo cáo" with today's range
    Then the summary cards show net revenue, cash, bank transfer and open receivables
    And the daily table and the employee table list today's figures
    And the "Xuất Excel" link downloads the .xlsx attachment
