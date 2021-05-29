import {http, sessionMiddleware, passport} from '../index';
import configurations from '../server-basic-configurations';

let io = require("socket.io")(http, {
    cors: {
      origin: configurations.clientUrl,
      methods: ["GET", "POST"],
      credentials: true
    }
});

// @ts-ignore: Unreachable code error
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// @ts-ignore: Unreachable code error
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});

export default io;