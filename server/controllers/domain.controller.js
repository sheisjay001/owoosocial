const Domain = require('../models/Domain');
const emailService = require('../services/email.service');

exports.addDomain = async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required' });

    // Check if domain already exists
    const existing = await Domain.findOne({ domain });
    if (existing) return res.status(400).json({ error: 'Domain already added' });

    // Call Resend API
    const resendData = await emailService.addDomain(domain);

    // Save to DB
    const newDomain = new Domain({
      domain: resendData.name,
      resendDomainId: resendData.id,
      status: resendData.status,
      dnsRecords: resendData.records ? resendData.records.map(r => ({
        recordType: r.record || r.type,
        name: r.name,
        value: r.value,
        ttl: r.ttl,
        status: r.status || 'pending'
      })) : [],
      region: resendData.region
    });

    await newDomain.save();

    res.status(201).json({ success: true, domain: newDomain });
  } catch (error) {
    console.error('Add Domain Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDomains = async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, domains });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const domain = await Domain.findById(id);
    if (!domain) return res.status(404).json({ error: 'Domain not found' });

    // Call Resend API
    const resendData = await emailService.getDomain(domain.resendDomainId);

    // Update DB
    domain.status = resendData.status;
    if (resendData.records) {
         domain.dnsRecords = resendData.records.map(r => ({
            recordType: r.record || r.type,
            name: r.name,
            value: r.value,
            ttl: r.ttl,
            status: r.status || 'pending'
          }));
    }
    
    await domain.save();

    res.status(200).json({ success: true, domain });
  } catch (error) {
    console.error('Check Verification Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteDomain = async (req, res) => {
    try {
        const { id } = req.params;
        await Domain.findByIdAndDelete(id);
        // Note: Should also delete from Resend, but for MVP we skip or add method later
        res.json({ success: true, message: 'Domain deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};