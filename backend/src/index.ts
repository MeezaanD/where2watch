import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'https://where2watch-steel.vercel.app',
  'https://where2watch.meezaan.dev/',
  process.env.CORS_ORIGIN
].filter((origin): origin is string => Boolean(origin));

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients and same-origin requests with no Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(origin));
  }
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🎬 Cinema Compare API running on http://localhost:${PORT}`);
});
