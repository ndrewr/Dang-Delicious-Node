#Dang Delicious!

Built alongside Wes Bos' Learn Node course.

A catalog app osentensibly for restaurants/cafes/eateries. Implements user accounts, new store creation, filtered views, tags and a reviews system.

All stores and named users depicted by default are figments of the imagination. Except maybe Wes.


===

[![](http://wes.io/kH9O/wowwwwwwwww.jpg)](https://LearnNode.com)


## Featured tech

- backend: Node Express server, data housed with mongodb via Mongoose schema, hosted on [mlabs](https://mlab.com/)
- frontend: HTML5/CSS rendered with Pug templates 


## Sample Data

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

That will populate 16 stores with 3 authors and 41 reviews. The logins for the authors are as follows:

|Name|Email (login)|Password|
|---|---|---|
|Wes Bos|wes@example.com|wes|
|Debbie Downer|debbie@example.com|debbie|
|Beau|beau@example.com|beau|


