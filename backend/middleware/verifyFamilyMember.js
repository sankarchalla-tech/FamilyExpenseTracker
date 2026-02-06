const db = require('../config/database');

const verifyFamilyMember = async (req, res, next) => {
  try {
    const { familyId } = req.params;
    
    // TEMPORARILY SKIP VERIFICATION FOR DEVELOPMENT
    console.log('⚠️  Temporarily skipping family verification for development');
    req.family = { id: parseInt(familyId), name: 'Development', role: 'admin' };
    next();
    
    /*
    // RE-ENABLE THIS LATER WHEN DATABASE IS FIXED
    console.log('Verifying family member for familyId:', familyId, 'userId:', req.user.id);
    
    if (!familyId) {
      return res.status(400).json({ error: 'Family ID is required' });
    }
    
    const families = await db.getUserFamilies(req.user.id);
    console.log('User families from getUserFamilies:', families);
    
    const family = families.find(f => f.id === parseInt(familyId));
    console.log('Found family:', family);
    
    if (!family) {
      console.log('Family not found or user not member');
      return res.status(403).json({ error: 'Access denied. You are not a member of this family. Please ask an admin to add you.' });
    }
    
    req.family = family;
    console.log('Family verification successful for:', family.name);
    */
  } catch (error) {
    console.error('Verify family member error:', error);
    res.status(500).json({ error: 'Server error verifying family membership' });
  }
};

module.exports = verifyFamilyMember;