const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['infrastructure', 'environment', 'public-services', 'community']
  },
  subcategory: {
    type: String,
    required: [true, 'Please select a subcategory']
  },
  type: {
    type: String,
    required: [true, 'Please specify the issue type'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    trim: true
  },
  neighborhood: {
    type: String,
    required: [true, 'Please select a neighborhood']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  photos: [String],
  statusUpdates: {
    type: Map,
    of: {
      date: Date,
      comment: String,
      updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    }
  },
  comments: [
    {
      text: {
        type: String,
        required: true
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create location index
ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
