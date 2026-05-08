import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as DiscordStrategy } from 'passport-discord-auth';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './dbConfig.mjs';

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const [users] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return done(null, false, { message: 'Email tidak terdaftar.' });
            }

            const user = users[0];

            const [passwords] = await db.query(
                'SELECT * FROM user_passwords WHERE user_id = ?',
                [user.id]
            );

            if (passwords.length === 0) {
                return done(null, false, { message: 'Akun ini tidak memiliki password. Silakan login menggunakan Google atau Discord.' });
            }

            const isMatch = await bcrypt.compare(password, passwords[0].password);

            if (!isMatch) {
                return done(null, false, { message: 'Password salah.' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const providerId = profile.id;
            const email = profile.emails[0].value;
            const fullName = profile.displayName;

            const [identities] = await db.query(
                'SELECT * FROM user_identities WHERE provider = ? AND provider_id = ?',
                ['google', providerId]
            );

            if (identities.length > 0) {
                const [users] = await db.query(
                    'SELECT * FROM users WHERE id = ?',
                    [identities[0].user_id]
                );
                return done(null, users[0]);
            }

            const [existingUsers] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return done(null, false, {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'Akun dengan email ini sudah terdaftar. Silakan login dengan metode yang ada, lalu hubungkan akun Google dari halaman Settings.'
                });
            }

            const userId = uuidv4();
            await db.query(
                'INSERT INTO users (id, full_name, email) VALUES (?, ?, ?)',
                [userId, fullName, email]
            );

            await db.query(
                'INSERT INTO user_identities (id, user_id, provider, provider_id) VALUES (?, ?, ?, ?)',
                [uuidv4(), userId, 'google', providerId]
            );

            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
            return done(null, newUser[0]);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use(new DiscordStrategy(
    {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackUrl: process.env.DISCORD_CALLBACK_URL,
        scope: ['identify', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const providerId = profile.id;
            const email = profile.email;
            const fullName = profile.global_name || profile.username;

            if (!email) {
                return done(null, false, { message: 'Email tidak tersedia dari akun Discord Anda. Pastikan email terverifikasi di Discord.' });
            }

            const [identities] = await db.query(
                'SELECT * FROM user_identities WHERE provider = ? AND provider_id = ?',
                ['discord', providerId]
            );

            if (identities.length > 0) {
                const [users] = await db.query(
                    'SELECT * FROM users WHERE id = ?',
                    [identities[0].user_id]
                );
                return done(null, users[0]);
            }

            const [existingUsers] = await db.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return done(null, false, {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'Akun dengan email ini sudah terdaftar. Silakan login dengan metode yang ada, lalu hubungkan akun Discord dari halaman Settings.'
                });
            }

            const userId = uuidv4();
            await db.query(
                'INSERT INTO users (id, full_name, email) VALUES (?, ?, ?)',
                [userId, fullName, email]
            );

            await db.query(
                'INSERT INTO user_identities (id, user_id, provider, provider_id) VALUES (?, ?, ?, ?)',
                [uuidv4(), userId, 'discord', providerId]
            );

            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
            return done(null, newUser[0]);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use('google-bind', new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_BIND_CALLBACK_URL,
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            return done(null, {
                provider: 'google',
                provider_id: profile.id,
                email: profile.emails[0].value,
                displayName: profile.displayName
            });
        } catch (error) {
            return done(error);
        }
    }
));

passport.use('discord-bind', new DiscordStrategy(
    {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackUrl: process.env.DISCORD_BIND_CALLBACK_URL,
        scope: ['identify', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            return done(null, {
                provider: 'discord',
                provider_id: profile.id,
                email: profile.email,
                displayName: profile.global_name || profile.username
            });
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0] || null);
    } catch (error) {
        done(error);
    }
});

export default passport;
