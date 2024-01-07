---
title: Drop collection
navigation:
    title: drop
---

## {{$doc.title}}

**Accepted roles**:

- `root`
- `atlasAdmin` - if using [MongoDB Atlas](https://www.mongodb.com/atlas/database){target="_blank"}
- `dbOwner` on `admin` database.
- `dbOwner` on current database.
- `dbAdmin` on current database.
- `dbAdminAnyDatabase` on any database.
- `readWrite` on current database.
- `readWriteAnyDatabase` on any database.

> Refer to [roles manual](https://www.mongodb.com/docs/manual/reference/built-in-roles){target="_blank"}

If you have any of the above roles, you can drop collections.

**Note**: Dropped collections are deleted permanently.
