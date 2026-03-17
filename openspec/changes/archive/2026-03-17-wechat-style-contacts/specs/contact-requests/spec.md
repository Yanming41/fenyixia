## ADDED Requirements

### Requirement: Send and Receive Friend Requests
Users SHALL be able to send friend requests via email search, requiring approval from the recipient.

#### Scenario: Sending a request
- **WHEN** user A searches for user B's email and clicks "Add"
- **THEN** a pending friendship record is created.

#### Scenario: Receiving a request
- **WHEN** user B visits the "New Friends" page
- **THEN** they see the pending request from user A and can choose to Accept or Reject.
- **THEN** if Accepted, the friendship status changes to 'accepted' and they appear in each other's contact lists.
