---
title: Create database
description: Create an new empty database.
navigation:
    title: create
---

## {{$doc.title}}

**Accepted roles**:

- `root`
- `atlasAdmin` - if using [MongoDB Atlas](https://www.mongodb.com/atlas/database){target="_blank"}
- `dbOwner` on `admin` database.
- `dbAdminAnyDatabase` on any database.
- `readWriteAnyDatabase` on any database.

> Refer to [roles manual](https://www.mongodb.com/docs/manual/reference/built-in-roles/#all-database-roles){target="_blank"}

You can create a new database by clicking the :custom-icon{name='mdi:database-plus'} `new database`
button at the bottom left.

A dialog appears where you can enter the database name and the first collection.

![createDatabaseDialog](/img/createDatabaseDialog.png)
*create database dialog*

### Note

Creation of new empty databases is **implied**. That is, the database is not created on MongoDB
and **will be lost if the connection is closed** when no documents are added.

To create the database on MongoDB and make it permanent, you need to add a new document to a collection in the database.
During creation, only the collection with the new document is created and the rest are discarded.

> Learn more on [new collections in empty database](/collection/create#new-collection-in-new-empty-database),
> [inserting document](/document/insert)
