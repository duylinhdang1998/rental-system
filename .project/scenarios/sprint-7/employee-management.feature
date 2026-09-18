@sprint-7 @employees @access
Feature: Employee account management
  As the Owner
  I want to create, lock, unlock and reset Staff accounts
  So that only current employees can sign in and every action stays attributable

  Background:
    Given an authenticated rental workspace
    And every account in these scenarios is a synthetic fixture
    And passwords are stored only as argon2 hashes and never returned by the API

  @US-006 @authorization @integration
  Scenario: Only the Owner manages employees
    Given Staff is signed in
    When Staff lists, creates, locks or resets an employee account
    Then every call is rejected with 403
    And the /employees route shows the access-denied page to Staff

  @US-006 @create @integration
  Scenario: Owner creates a Staff account
    Given the Owner is signed in
    When the Owner creates employee "nv.lan" named "Nguyễn Thị Lan" with a password of at least 10 characters
    Then the employee list shows "nv.lan" as an active STAFF account
    And an EMPLOYEE_CREATED audit event stores the actor and the new username
    And "nv.lan" can sign in with that password
    And creating "nv.lan" again is rejected with 409

  @US-006 @validation @unit
  Scenario Outline: Employee input is validated
    When the Owner submits username "<username>" and password "<password>"
    Then the request is <outcome>

    Examples:
      | username | password        | outcome  |
      | nv.lan   | MatKhau!2026x   | accepted |
      | nv       | MatKhau!2026x   | rejected |
      | nv lan   | MatKhau!2026x   | rejected |
      | nv.lan   | short           | rejected |

  @US-006 @lock @session @integration
  Scenario: Locking an employee ends their sessions but keeps their history
    Given employee "nv.lan" is signed in on a phone
    And "nv.lan" recorded a payment earlier today
    When the Owner locks "nv.lan"
    Then the phone session receives 401 on its next request
    And "nv.lan" cannot sign in and sees "Tài khoản hiện không thể truy cập"
    And the payment ledger and the audit log still name "nv.lan" as the actor
    And an EMPLOYEE_LOCKED audit event stores the actor and the account

  @US-006 @unlock @integration
  Scenario: Owner unlocks an employee
    Given employee "nv.lan" is locked
    When the Owner unlocks "nv.lan"
    Then "nv.lan" can sign in again
    And an EMPLOYEE_UNLOCKED audit event is recorded

  @US-006 @reset @integration
  Scenario: Owner resets an employee password
    Given employee "nv.lan" is signed in
    When the Owner sets a new password for "nv.lan"
    Then the old password is rejected and the new password signs in
    And the previous session is ended
    And an EMPLOYEE_PASSWORD_RESET audit event is recorded without the password

  @US-006 @safety @integration
  Scenario: The Owner cannot lock their own account
    Given the Owner is signed in
    When the Owner tries to lock their own account
    Then the request is rejected with 409 and the account stays active

  @US-006 @ui @e2e
  Scenario: Owner manages employees from the workspace
    Given the Owner is signed in on the /employees page
    When the Owner adds employee "nv.demo" with a valid password
    Then the list shows "nv.demo" with an "Đang làm" status badge
    When the Owner locks "nv.demo"
    Then the badge reads "Đã khóa" and the action offers to unlock
    And the audit page lists the EMPLOYEE_LOCKED entry with the Owner as actor
