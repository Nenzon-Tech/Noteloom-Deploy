const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['college', 'individual'], default: 'college' },
  subdomain: String,
  logoUrl: String,
  collegeCode: { type: String, unique: true, minlength: 4 },
  // --- NEW FIELDS ---
  location: { type: String, default: 'India' }, // e.g., "Kolkata, West Bengal"
  category: { type: String, default: 'University' }, // e.g., "Engineering"
  featured: { type: Boolean, default: false }, // For the star badge shown in the image
  slug: { type: String, unique: true, sparse: true },
  isPublished: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
  // ------------------
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  deletionScheduledAt: { type: Date, default: null }
});

// Auto-generate slug from name if not provided (only for colleges)
tenantSchema.pre('save', function(next) {
  if (this.type === 'college') {
    if (!this.slug) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);