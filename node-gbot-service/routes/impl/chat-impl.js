const gkeys = require('../../chat-bot-app-1-bdcb025398b2.json');
// const bodyParser = require('body-parser');
const { google } = require('googleapis');
const unirest = require('unirest');

function getJWT() {
    return new Promise(function(resolve, reject) {
      let jwtClient = new google.auth.JWT(
        gkeys.client_email,
        null,
        gkeys.private_key, ['https://www.googleapis.com/auth/chat.bot']
      );
  
      jwtClient.authorize(function(err, tokens) {
        if (err) {
          console.log('Error create JWT hangoutchat');
          reject(err);
        } else {
          resolve(tokens.access_token);
        }
      });
    });
}

function postMessage(message = 'Hello! This is test message', token, roomID) {
  return new Promise(function(resolve, reject) {
    try {
      unirest.post('https://chat.googleapis.com/v1/spaces/' + roomID + '/messages')
      .headers({
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
      })
      .send(JSON.stringify({
          'text': message,
      }))
      .end(function(res) {
          resolve();
      });
    } catch(e) {
      console.log(e);
    }
  });
}

module.exports = {
    getJWT,
    postMessage
}
