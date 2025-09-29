const LocalStrategy = require('passport-local').Strategy;
const { PrismaClient } = require('../../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

module.exports = function(passport) {
    // Local strategy for email/password authentication
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email }
            });

            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: id }
            });
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};