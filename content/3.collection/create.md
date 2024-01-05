---
title: Create collection
navigation:
    title: create
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

You can create a collection by navigating to the database home page and
clicking the :custom-icon{name="mdi:plus-circle-outline"} icon on the collections.

![createCollection](/img/createCollection.png)

### Note

- #### New collection in new, empty database

New collections in a new, empty database are not created on MongoDB.
Their creation is only implied.
They are only created in MongoDB when a new document is added to the collection.

In that case, if you create multiple empty collections on an empty database,
the first collection to have a document inserted is the one that is created
on MongoDB. The other collections are discarded.

**Example**:

If you create new empty database `new_db` then add `collection_1`, `collection_2` and `collection_3`
collections into the new database and insert a new document into `collection_2`, `new_db` is created
on MongoDB with `collection_2`. The other collections, `collection_1` and `collection_3` are discarded.

> Learn more about [`empty databases`](/database/create)

- #### New collection in non-empty/existing database

New collections in an already existing database are created on MongoDB directly
even though the collection is empty.
The creation is not implied.

**Example**:

If you have an already existing database `old_db` and add `collection_10` collection to the database,
the collection is directly registered on MongoDB.
