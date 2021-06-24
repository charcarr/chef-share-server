Legacy Project Summary of Changes - Chef Share Server

- Refactored to typescript
- Created individual files to boot database and webserver (db.ts and server.ts, respectively)
- Modified index.ts to use above files
- Created .env.example to persist environment variable names
- Created nodemon.json to store nodemon configurations to address start up issues with nodemon
- Updated eslintrc.js rules
- In controllers/recipeScraper.ts
  - De-structured v4 out of uuid to address an error with uuid.v4() format later in code
  - Commented out an else if that would always evaluate to false, could not reproduce the need for it
  - Added 'author' and 'image' property handling (lines 84-96) to ensure that what comes out of recipeScraper is always the same format, per Ben's suggestion
  - Added else ifs for all types to address typescript issues
  - Added type guards (examples on lines 145-151) to handle function outputs that might be of two types
- Implemented Jest for backend testing
- Added seed folder to enable seeding of test database with mock data for 25 users with 4 recipes each
- Added testing for all endpoints in router, addressing major functionality of each controller