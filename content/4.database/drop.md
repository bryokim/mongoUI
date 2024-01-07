---
title: Drop database
description: Drop a database.
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

> Refer to [roles manual](https://www.mongodb.com/docs/manual/reference/built-in-roles){target="_blank"}

Dropping databases deletes its collections and all the documents in the collections.
