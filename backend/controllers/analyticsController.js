const db = require('../config/database');

const getAnalytics = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { startDate, endDate, userId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const analytics = await db.getAnalytics(familyId, startDate, endDate, userId);
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

module.exports = { getAnalytics };