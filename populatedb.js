const { Customer, Item, Shop, Owner, ItemComment, ShopComment, ShoppingList } = require('./models');
const mongoose = require('mongoose');
const cfg = require('./config');

async function populateData() {
  let customer1 = new Customer({
    email: 'can@can.com',
    name: 'Can',
    surname: 'Gumeli',
    addressLine1: 'SLC',
    addressLine2: 'Garching',
    zipCode: 85748,
    city: 'Munich',
    country: 'Germany',
  });
  await customer1.setPassword('123456');
  customer1 = await customer1.save();

  let customer2 = new Customer({
    email: 'burak@burak.com',
    name: 'Burak',
    surname: 'Aybar',
    addressLine1: 'SLC',
    addressLine2: 'Garching',
    zipCode: 85748,
    city: 'Munich',
    country: 'Germany',
  });
  await customer2.setPassword('123456');
  customer2 = await customer2.save();

  let customer3 = new Customer({
    email: 'melisch@ismet.com',
    name: 'Melisch',
    surname: 'Ismet',
    addressLine1: 'SLC',
    addressLine2: 'Garching',
    zipCode: 85748,
    city: 'Munich',
    country: 'Germany',
  });
  await customer3.setPassword('123456');
  customer3 = await customer3.save();
  let owner1 = new Owner({
    email: 'elif@elif.com',
    name: 'Elif',
    surname: 'Erbil',
  });
  await owner1.setPassword('123456');
  owner1 = await owner1.save();
  let owner2 = new Owner({
    email: 'arhan@arhan.com',
    name: 'Arhan',
    surname: 'Kamac',
  });
  await owner2.setPassword('123456');
  owner2 = await owner2.save();
  let shop1 = new Shop({
    owner: owner1._id,
    title: 'Rewe',
    description: 'Rewe is a supermarket chain which sells basic home goods.',
    location: { type: 'Point', coordinates: [41.40338, 2.17403] },
  });
  shop1 = await shop1.save();
  let item1 = new Item({
    shopId: shop1._id,
    name: 'Glass',
    category: 'Kitchen',
    tag: 'Utensils',
    price: 2,
    detail: 'Durable glass for cold drinks',
    material: 'Glass',
    size: '300 ml',
  });
  item1 = await item1.save();
  let item2 = new Item({
    shopId: shop1._id,
    name: 'Fork',
    category: 'Kitchen',
    tag: 'Utensils',
    price: 3,
    detail: 'Set of forks, 6 piece per pack',
    material: 'Metal',
  });
  item2 = await item2.save();
  let item3 = new Item({
    shopId: shop1._id,
    name: 'Small Pan',
    category: 'Kitchen',
    tag: 'Pots and Pans',
    price: 5,
    material: 'Metal',
    size: 'Diameter: 15cm',
  });
  item3 = await item3.save();
  let shopComment1 = new ShopComment({
    shopId: shop1._id,
    text:
      'This shop is very big and you can find all the items you searched for. But it is not close to the ubahn.',
    rating: 4,
    date: new Date(2018, 11, 24, 10, 33),
    upvote: [customer1._id, customer2._id],
    downvote: [customer3._id],
    userId: customer1._id,
  });
  shopComment1 = await shopComment1.save();
  let itemComment1 = new ItemComment({
    itemId: item1._id,
    text: "Do not buy this item, I couldn't use it at all",
    rating: 1,
    date: new Date(2019, 01, 04, 09, 38),
    upvote: [customer1._id],
    downvote: [customer3._id],
    userId: customer2._id,
  });
  itemComment1 = await itemComment1.save();
  let itemComment2 = new ItemComment({
    itemId: item1._id,
    text: 'I really like the item but it is not very durable',
    rating: 3,
    date: new Date(2019, 01, 05, 11, 42),
    upvote: [],
    downvote: [customer2._id, customer1._id],
    userId: customer3._id,
  });
  itemComment2 = await itemComment2.save();
  let shoppingList1 = new ShoppingList({
    user: customer1._id,
    items: [item1._id, item3._id],
  });
  shoppingList1 = await shoppingList1.save();
}

mongoose.connect(cfg.DB_URL, { useNewUrlParser: true });
populateData();
