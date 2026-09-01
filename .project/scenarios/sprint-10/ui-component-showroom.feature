Feature: Review the UI foundation component by component
  As the Product Owner
  I want a standalone local component showroom
  So that the visual foundation is approved before more business screens are built

  @e2e
  Scenario: Open the local component showroom without business data
    Given the admin development server is running
    When I open "/ui-kit"
    Then I see the "UI Foundation" review workspace
    And I see navigation for every component category
    And no business API request is required to render the workspace

  @e2e
  Scenario: Navigate directly to an individual component section
    Given I am on the component showroom
    When I choose the "Buttons" category
    Then the URL identifies the buttons section
    And the buttons specimen is visible

  @e2e
  Scenario: Compare action and form-control states
    Given I am on the component showroom
    Then buttons show primary, secondary, outline, quiet, destructive and disabled states
    And form controls show default, populated, disabled and invalid states
    And loading actions preserve their visible width

  @e2e
  Scenario: Exercise accessible selection and overlay primitives
    Given I am on the component showroom
    When I use the select, checkbox, radio group and dialog by keyboard
    Then each control exposes a visible focus state
    And the dialog traps focus and returns it to its trigger when closed

  @e2e
  Scenario: Review data-display and feedback patterns
    Given I am on the component showroom
    Then I can compare status badges, KPI cards and table styling in one section
    And I can compare loading, empty and error feedback states in one section

  @e2e
  Scenario: Use the component showroom on a mobile viewport
    Given the viewport is 360 pixels wide
    When I open the component showroom
    Then the review navigation remains usable
    And all interactive targets are at least 44 pixels high or wide
    And the page has no horizontal overflow

  @unit
  Scenario: Reuse production base components in every specimen
    Given the showroom source files are inspected
    Then specimens import base components through the configured "@/" alias
    And specimens do not recreate native form controls or duplicate component styles

  @unit
  Scenario: Keep the showroom out of production
    Given a production frontend build
    Then the "/ui-kit" development route is not registered
