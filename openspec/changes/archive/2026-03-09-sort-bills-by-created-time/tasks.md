## 1. Modify Database Query

- [x] 1.1 In `src/lib/api/bills.ts`, locate the `fetchMyBills` function.
- [x] 1.2 Change the `.order('date', { ascending: false })` clause to `.order('created_at', { ascending: false })`.

## 2. Validation

- [x] 2.1 Run the local dev server and ensure the homepage bill list loads without errors.
- [x] 2.2 Verify that bills on the homepage are displayed in descending order of their creation time (newest at the top).
- [x] 2.3 Verify that the bills are still correctly grouped by month.
