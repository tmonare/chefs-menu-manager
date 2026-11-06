# Chef's Menu Manager MAST POE)

React Native (Expo Router + TypeScript) app that lets a chef manage a menu.

npm install
npx expo start        // scan the QR code with Expo Go
npx expo start --web  // run in the browser
```

// Features
- Add dishes (name, description, course, price) with validation and confirmation messages
- Edit and delete dishes (delete asks for confirmation)
- Search by dish name
- Filter by course (All, Starter, Main, Dessert)
- Menu statistics: total items, average price, count per course

// Change log since Part 2
- Added edit mode that reuses the add form
- Added delete with an inline confirmation step
- Added search by name and course filter chips
- Added statistics card (total, average price, items per course)
- Added empty-state messages and a success banner for add/edit/delete
- Cleaned up code: typed `MenuItem` and `Course`, one `validate` function, `useMemo` for filtering and stats
