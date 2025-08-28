import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  gender: {
    type: String,
    enum: ['hombre', 'mujer'],
  
  },
  customerSince: {
    type: Number,
    default: function() {
      return new Date().getFullYear();
    }
  },
  image: {
    type: String,
    default: function() {
      return this.gender === 'mujer' ? '/image/default_user2.png' : '/image/default_user1.png';
    }
  },
  role: {
    type: String,
    default: function() {
      const currentYear = new Date().getFullYear();
      if (this.customerSince === currentYear) {
        return 'Nuevo cliente';
      }
      return `Cliente desde ${this.customerSince}`;
    }
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, can be changed to false for manual approval
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Review', reviewSchema);
