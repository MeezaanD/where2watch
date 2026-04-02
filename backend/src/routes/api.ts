import express from 'express';
import { getShowtimes } from '../services/compare.js';

const router = express.Router();

router.get('/showtimes', async (req, res) => {
  try {
    const { movie, cinema, branch } = req.query;
    
    const filters = {
      movie: movie as string | undefined,
      cinema: cinema as string | undefined,
      branch: branch as string | undefined
    };
    
    const showtimes = await getShowtimes(filters);
    
    res.json({
      success: true,
      count: showtimes.length,
      data: showtimes
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch showtimes'
    });
  }
});

export default router;
