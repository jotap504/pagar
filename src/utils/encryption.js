/**
 * Encryption Utility using Native Web Crypto API
 * This ensures sensitive data (like Mercado Pago Tokens) is encrypted in the browser
 * before being sent to Firestore.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Derives an AES-GCM key from a secret string (e.g., user.uid)
 */
async function getKey(secret) {
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("pagar-security-salt-2026"), // Static salt for consistency
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts cleartext into a base64 string
 */
export async function encryptToken(text, secret) {
    if (!text || text.startsWith("enc:")) return text; // Avoid double encryption

    try {
        const key = await getKey(secret);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoder.encode(text)
        );

        const encryptedArray = new Uint8Array(encrypted);
        const combined = new Uint8Array(iv.length + encryptedArray.length);
        combined.set(iv);
        combined.set(encryptedArray, iv.length);

        // Convert to base64 and prefix to identify as encrypted
        const base64 = btoa(String.fromCharCode.apply(null, combined));
        return `enc:${base64}`;
    } catch (e) {
        console.error("[Encryption] Failed to encrypt:", e);
        return text;
    }
}

/**
 * Decrypts a base64 string back to cleartext
 */
export async function decryptToken(encoded, secret) {
    if (!encoded || !encoded.startsWith("enc:")) return encoded; // Not encrypted or legacy

    try {
        const base64 = encoded.replace("enc:", "");
        const combined = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const key = await getKey(secret);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );
        return decoder.decode(decrypted);
    } catch (e) {
        console.warn("[Encryption] Decryption failed. Possibly invalid key or cleartext:", e);
        return encoded; // Fallback to raw if decryption fails
    }
}
