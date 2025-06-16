const fs = require('fs');
const https = require('https');

const postData = JSON.stringify({});

const authHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Accept': 'application/json',
    'User-Agent': 'Chad Lutz Challenge',
    'Cookie': 'JSESSIONID=2d4a5408-7840-4136-b033-eda5f5e22512; _csrf_token=5a1cf6ac19c20abd51f276645386833771eb25b6a75c429cc5c3632f62341a2f; analytics_id=analytics_74e3c65b34275066a84ad4e011034723; device_id=device_9f4ef74dde1416c34a2e1fd7; feature_flags=eyJuZXdEYXNoYm9hcmQiOnRydWUsImJldGFGZWF0dXJlcyI6ZmFsc2UsImFkdmFuY2VkU2V0dGluZ3MiOnRydWUsImV4cGVyaW1lbnRhbFVJIjpmYWxzZX0%3D; session_fingerprint=2de6f07e5e406323caedd34932fc44d14d8fd9027ebc4a849b468f8a32bbb6cc; tracking_consent=accepted; user_preferences=eyJ0aGVtZSI6ImxpZ2h0IiwibGFuZ3VhZ2UiOiJlbiIsInRpbWV6b25lIjoiVVRDIiwibm90aWZpY2F0aW9ucyI6dHJ1ZX0%3D'
};

function fetch(path, callback) {
    const connectionString = {
        hostname: 'challenge.sunvoy.com',
        path: path,
        method: 'POST',
        headers: authHeaders
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
    req.write(JSON.stringify({}));
    req.end();
  }

  fetch('/api/users', (err, usersData) => {
    if (err) return console.error('Error fetching users:', err.message);
  
      const data = Array.isArray(usersData) ? usersData.slice() : [];

      fs.writeFileSync('users.json', JSON.stringify(data, null, 2));
      console.log('Data saved to users.json');
    });
 