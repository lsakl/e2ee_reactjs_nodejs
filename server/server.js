const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

// สร้างคู่คีย์ RSA
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

fs.writeFileSync(path.join(__dirname, './rsa/private.pem'), privateKey);
console.log('Private key saved to private.pem');

fs.writeFileSync(path.join(__dirname, './rsa/public.pem'), publicKey);
console.log('Public key saved to public.pem');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/key', (req, res) => {
    try {
        const publicKey = fs.readFileSync(path.join(__dirname, './rsa/public.pem'), 'utf8');
        res.status(200).json({ status: 200, key: Buffer.from(publicKey).toString('base64') });
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: 500, message: 'failed to retrieve key' });
    }
});

app.post('/api/secure', (req, res) => {
    const { encrypted } = req.body;
    const buffer = Buffer.from(encrypted, 'base64');
    try {
        const privateKey = fs.readFileSync(path.join(__dirname, './rsa/private.pem'), 'utf8');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256'
            },
            buffer
        );
        console.log(decrypted.toString());
        res.status(200).json({ status: 200, message: 'success', password: decrypted.toString() });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: 'failed', password: '' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
