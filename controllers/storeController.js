const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    }
    else {
      next({ message: 'That filetype is not allowed.' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); //skip to next middleware
    return;
  }

  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we have written photo to filesystem, keep going
  next();
} 

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  // await store.save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id })

  // TODO auth owner of store entry

  res.render('editStore', { title: 'Edit this store', store });
}

exports.updateStore = async (req, res) => {
  // const store = await Store.findOne({ _id: req.params.id })
  
  // set the location data to a Point type
  req.body.location.type = 'Point';

  const store = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true, // returns the new store instead of old
      runValidators: true,
    }
  ).exec();

  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View store</a>`
  );

  res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({
    slug: req.params.slug,
  });

  // handle case url slug doesnt exist
  if (! store) {
    return next();
  }

  res.render('store', { store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
  // const tags = await Store.getTagsList();
  const selectedTag = req.params.tag;
  const tagQuery = selectedTag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });

  const [ tags, stores ] = await Promise.all([
    tagsPromise,
    storesPromise,
  ]);

  res.render('tags', { stores, tags, selectedTag, title: 'Tags' });
}
