import crypto from 'crypto';

export const generateToken = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        token += chars[randomBytes[i] % chars.length];
    }
    return token;
};

export const generateAuthCode = (length = 64) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        otp += digits[randomBytes[i] % digits.length];
    }
    return otp;
};
