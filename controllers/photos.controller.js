const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');

function escape(text) {
  return text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    
    if(title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];

      const pattern = new RegExp(/(([A-z]|\s)*)/, 'g');
      const matchedAuthor = author.match(pattern).join('');
      const matchedTitle = title.match(pattern).join('');
      const mailRegEx = new RegExp(/^[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}$/, 'i');
      const matchedEmail = email.match(mailRegEx).join('');
      
      if (fileExt === 'jpg' || fileExt === 'gif' || fileExt === 'png') {
        const newPhoto = new Photo({ title: matchedTitle, author: matchedAuthor, email: matchedEmail, src: fileName, votes: 0 });
          await newPhoto.save(); // ...save new photo in DB
          res.json(newPhoto);
        } else {
          throw new Error('Wrong input!');
        }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {


  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    console.log('photoToUpdate', photoToUpdate);
    /*
    
    console.log('cIP', userIP);
    const ipUsed = await Voter.findOne();
    console.log('ipUsed', ipUsed);
    */
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      const userIP = req.ip.split(':').slice(-1);
      console.log('userIP', userIP);
      const voted = await Voter.findOne({user: userIP});
      console.log('voted', voted);
      if(!voted) {
        const newUser = new Voter({ user: userIP });
        await newUser.save();
        console.log('newUser', newUser);
        const aaa = await Voter.find();
        console.log('aaaaa', aaa);

      } else {
        if (voted.votes.some(vote => vote == req.params.id)) {
          throw new Error("You've already voted");
        }
        voted.votes.push(req.params.id)
        await voted.save();
      }
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
