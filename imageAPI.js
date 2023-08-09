const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: '1e196e3c4180484fbaa0ad6ad4523bf6' 
});


const handleApiCall = (req, res) => {
  app.models.predict('face-detection', req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json('unable to work with API'))
}


module.exports = {
  handleApiCall
}