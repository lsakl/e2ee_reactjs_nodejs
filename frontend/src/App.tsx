import { useState, useEffect } from 'react';

export default function App() {
    const [password, setPassword] = useState('');
    const [publicKeyPem, setPublicKeyPem] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);

    const extractBase64FromPem = (pem: string): string => {
        const match = pem.match(/-----BEGIN PUBLIC KEY-----([A-Za-z0-9+/=\n\r]+)-----END PUBLIC KEY-----/);
        if (!match) throw new Error('Invalid PEM format');
        return match[1].replace(/\s+/g, '');
    };

    const importPublicKey = async (pem: string): Promise<CryptoKey> => {
        const base64 = extractBase64FromPem(atob(pem));
        const binaryDer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        return await window.crypto.subtle.importKey(
            'spki',
            binaryDer.buffer,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256'
            },
            true,
            ['encrypt']
        );
    };

    const ab2b64 = (buffer: ArrayBuffer): string => {
        return window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    const handleEncrypt = async () => {
        if (!publicKeyPem) {
            return;
        }
        const publicKey = await importPublicKey(publicKeyPem);
        const encoded = new TextEncoder().encode(password);
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            encoded
        );
        const encrypted = ab2b64(encryptedBuffer);

        const response = await fetch('http://localhost:3000/api/secure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted }),
        });
        setResponse(await response.json());
    };

    useEffect(() => {
        const fetchPublicKey = async () => {
            const response = await fetch('http://localhost:3000/api/key');
            if (!response.ok) {
                throw new Error('Failed to fetch public key');
            }
            const data = await response.json();
            setPublicKeyPem(data.key);
        };
        fetchPublicKey().catch(error => {
            console.error('Error fetching public key:', error);
            alert('Failed to fetch public key. Please check the server.');
        });
    }, []);

    return (
        <>
            <div>
                <input value={password} type='password' onChange={e => setPassword(e.target.value)} />
                <button onClick={handleEncrypt} disabled={!publicKeyPem}>Send password</button>
            </div>
            {response&&(<pre>
                {response ? `Response: ${JSON.stringify(response)}` : 'Waiting for response...'}
            </pre>)}
        </>
    );
}