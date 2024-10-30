// src/middlewares/auth.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';
import { JWT_SECRET } from '../config';

// JWT Strategy for API Authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Local Strategy for Admin Portal Authentication
passport.use('local', new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize and deserialize for session support (Admin Portal)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware for JWT Authentication (e.g., for API routes)
// export const requireJWTAuth = passport.authenticate('jwt', { session: false });
export const requireJWTAuth = (req: any, res: any, next: any) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'Internal server error'
      });
    }
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized'
      });
    }

    // console.log("user",user)
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware for Local Authentication (e.g., for Admin Portal routes)
export const requireAdminAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.error('Authentication failed, redirecting to /admin/login');
  res.redirect('/admin/login');
};
