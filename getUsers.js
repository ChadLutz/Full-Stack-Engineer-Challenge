const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const authHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'User-Agent': 'Chad Lutz Challenge',
    'Cookie': 'JSESSIONID=2d4a5408-7840-4136-b033-eda5f5e22512; _csrf_token=5a1cf6ac19c20abd51f276645386833771eb25b6a75c429cc5c3632f62341a2f; analytics_id=analytics_74e3c65b34275066a84ad4e011034723; device_id=device_9f4ef74dde1416c34a2e1fd7; feature_flags=eyJuZXdEYXNoYm9hcmQiOnRydWUsImJldGFGZWF0dXJlcyI6ZmFsc2UsImFkdmFuY2VkU2V0dGluZ3MiOnRydWUsImV4cGVyaW1lbnRhbFVJIjpmYWxzZX0%3D; session_fingerprint=2de6f07e5e406323caedd34932fc44d14d8fd9027ebc4a849b468f8a32bbb6cc; tracking_consent=accepted; user_preferences=eyJ0aGVtZSI6ImxpZ2h0IiwibGFuZ3VhZ2UiOiJlbiIsInRpbWV6b25lIjoiVVRDIiwibm90aWZpY2F0aW9ucyI6dHJ1ZX0%3D'
};

function fetch(host, path, postData , callMethod, callback) {
    const connectionString = {
        hostname: host,
        path: path,
        method: callMethod,
        headers: {...authHeaders}
      };
  
    const req = https.request(connectionString, (res) => {
      let data = '';
      res.on('data', dataChunk => data += dataChunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          callback(null, json);
        } catch (e) {
          callback(new Error('Failed to parse JSON: ' + data));
        }
      });
    });
  
    req.on('error', (err) => callback(err));
    req.write(postData);
    req.end();
  }

  let combinedData = [];
  fetch('challenge.sunvoy.com', '/api/users', JSON.stringify({}) ,'POST' , (err, usersData) => {
    if (err) return console.error('Error fetching users:', err.message);
  
      combinedData = Array.isArray(usersData) ? usersData.slice() : [];

      fs.writeFileSync('users.json', JSON.stringify(combinedData, null, 2));
      console.log('Data saved to users.json');
    });


    const timestamp = Math.floor(Date.now() / 1e3);
    const currentUserTime = timestamp.toString();
    const tempPostData = {
        access_token: '084a2d56cef8cc8332a3d4b3a76047e0f7511062d7bf8a364a8ced7db7a453fa',
        apiuser: 'demo@example.org',
        language: 'en_US',
        openId: 'openid456',
        operateId: 'op789',
        userId: 'd9b30f76-2c07-468b-9c23-63de80f0ebf2',
        timestamp: currentUserTime
      };

    const sortedKeys = Object.keys(tempPostData).sort();

    const baseString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(tempPostData[key])}`)
      .join('&');
    
    const hmac = crypto.createHmac('sha1', 'mys3cr3t');
    hmac.update(baseString);
    const checkcode = hmac.digest('hex').toUpperCase();

    const fullPostData = {
        ...tempPostData, 
        checkcode: checkcode
    }
    const params = new URLSearchParams(fullPostData).toString();
    console.log(params);

  fetch('api.challenge.sunvoy.com', '/api/settings', params ,  'POST' , (err, currentUserData) => {
        if (err) return console.error('Error fetching current user:', err.message);

        combinedData.push(currentUserData);

        fs.writeFileSync('users.json', JSON.stringify(combinedData, null, 2));
        console.log('Combined data saved to users.json');
    });
