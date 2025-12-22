const Brand = require('../models/Brand');

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private
exports.createBrand = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized. Please login.' });
    }
    const { name, description, industry, website, tone } = req.body;

    const brand = await Brand.create({
      user: req.user._id,
      name,
      description,
      industry,
      website,
      tone
    });

    res.status(201).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all brands for user
// @route   GET /api/brands
// @access  Private
exports.getBrands = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(200).json({ success: true, count: 0, data: [] });
    }
    const brands = await Brand.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Private
exports.getBrandById = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // Make sure user owns the brand
    if (brand.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private
exports.updateBrand = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // Make sure user owns the brand
    if (brand.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private
exports.deleteBrand = async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // Make sure user owns the brand
    if (brand.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
