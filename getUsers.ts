import * as fs from 'fs';
import * as https from 'https';
import * as crypto from 'crypto';

const authHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'User-Agent': 'Chad Lutz Challenge',
    'Cookie': 'JSESSIONID=412e55ec-a6f2-4eed-b90c-c3209197e987; _csrf_token=6978e07753f189f6c54830c5224c8a49442d6262f10a0f83564b2553e44743fd; user_preferences=eyJ0aGVtZSI6ImxpZ2h0IiwibGFuZ3VhZ2UiOiJlbiIsInRpbWV6b25lIjoiVVRDIiwibm90aWZpY2F0aW9ucyI6dHJ1ZX0%3D; analytics_id=analytics_bcf023996b45b74da28f18d52cacb2b4; session_fingerprint=37c4191508d1f0199f763daae3034306cc410caefbd877c63e0c6b929ae55d73; feature_flags=eyJuZXdEYXNoYm9hcmQiOnRydWUsImJldGFGZWF0dXJlcyI6ZmFsc2UsImFkdmFuY2VkU2V0dGluZ3MiOnRydWUsImV4cGVyaW1lbnRhbFVJIjpmYWxzZX0%3D; tracking_consent=accepted; device_id=device_c9fa91c862c51c828875b833'
};

type FetchCallback = (err: Error | null, data: any) => void;

function fetch(host: string, path: string, postData: string, callMethod: 'GET' | 'POST', callback: FetchCallback): void {
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
          callback(new Error('Failed to parse JSON: ' + data), null);
        }
      });
    });
  
    req.on('error', (err) => callback(err, null));
    req.write(postData);
    req.end();
  }

  let combinedData: any[] = [];
  fetch('challenge.sunvoy.com', '/api/users', JSON.stringify({}) ,'POST' , (err, usersData) => {
    if (err) return console.error('Error fetching users:', err.message);
  
      combinedData = Array.isArray(usersData) ? usersData.slice() : [];

      fs.writeFileSync('users.json', JSON.stringify(combinedData, null, 2));
      console.log('Data saved to users.json');
    });


    const timestamp = Math.floor(Date.now() / 1e3);
    const currentUserTime = timestamp.toString();

    interface TempPostData {
        access_token: string;
        apiuser: string;
        language: string;
        openId: string;
        operateId: string;
        userId: string;
        timestamp: string;
    }
    const tempPostData = {
        access_token: '084a2d56cef8cc8332a3d4b3a76047e0f7511062d7bf8a364a8ced7db7a453fa',
        apiuser: 'demo@example.org',
        language: 'en_US',
        openId: 'openid456',
        operateId: 'op789',
        userId: 'd9b30f76-2c07-468b-9c23-63de80f0ebf2',
        timestamp: currentUserTime
      };

    const sortedKeys: (keyof TempPostData)[]  = Object.keys(tempPostData).sort() as (keyof TempPostData)[];

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

  fetch('api.challenge.sunvoy.com', '/api/settings', params ,  'POST' , (err, currentUserData) => {
        if (err) return console.error('Error fetching current user:', err.message);

        combinedData.push(currentUserData);

        fs.writeFileSync('users.json', JSON.stringify(combinedData, null, 2));
        console.log('Combined data saved to users.json');
    });
