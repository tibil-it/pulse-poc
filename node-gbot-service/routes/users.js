var express = require('express');
var router = express.Router();
const chatImpl = require('./impl/chat-impl.js');
let chatAccessToken = '';

/* GET authentication token from google. */
router.get('/authenticate', async (req, res) => {
  try {
    let result = await chatImpl.getJWT();
    this.chatAccessToken = result;
    res.status(200).send({code: 2000, data: result});
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
});

router.post('/send-message', async (req, res) => {
  try {
    let  reqBody = req.body;
    await chatImpl.postMessage(reqBody.message, (reqBody.token || chatAccessToken), reqBody.roomId);
    res.status(200).send('message sent succesfully');
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
});

module.exports = router;
