## ADDED Requirements

### Requirement: Pinyin Sorting Cache
The system SHALL compute and cache pinyin sort keys when fetching contacts to prevent UI blocking.

#### Scenario: Listing contacts
- **WHEN** the user opens the Contacts page and the friend data is fetched
- **THEN** the API layer instantly appends a pre-calculated pinyin sort key and initial letter to each friend object in memory.

### Requirement: Pinyin Native Search
The global search bar on the Contacts page SHALL support filtering contacts using their pinyin representations.

#### Scenario: Searching with pinyin
- **WHEN** the user types "zs" into the search bar
- **THEN** friends whose names evaluate to "张三" (zhangsan) are instantly shown in the filtered list.
