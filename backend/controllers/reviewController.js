import Review from '../models/Review.js';

// Create a new review
const createReview = async (req, res) => {
  try {
    const { name, comment, rating, gender, customerSince } = req.body;

    // Validate required fields
    if (!name || !comment || !rating) {
      return res.status(400).json({
        message: 'Todos los campos son requeridos (nombre, comentario, calificación)'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Create new review with all fields
    const reviewData = {
      name: name.trim(),
      comment: comment.trim(),
      rating: parseInt(rating)
    };

    // Add optional fields if provided
    if (gender) {
      reviewData.gender = gender;
    }
    if (customerSince) {
      reviewData.customerSince = parseInt(customerSince);
    }

    const newReview = new Review(reviewData);
    const savedReview = await newReview.save();

    // Manually set computed fields for response
    const responseReview = savedReview.toObject();
    responseReview.image = savedReview.gender === 'mujer' ? '/image/default_user2.png' : '/image/default_user1.png';
    
    const currentYear = new Date().getFullYear();
    if (savedReview.customerSince === currentYear) {
      responseReview.role = 'Nuevo cliente';
    } else {
      responseReview.role = `Cliente desde ${savedReview.customerSince}`;
    }

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review: responseReview
    });

  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Get all approved reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to last 20 reviews

    // Process reviews to ensure correct image and role display
    const processedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      reviewObj.image = review.gender === 'mujer' ? '/image/default_user2.png' : '/image/default_user1.png';
      
      const currentYear = new Date().getFullYear();
      if (review.customerSince === currentYear) {
        reviewObj.role = 'Nuevo cliente';
      } else {
        reviewObj.role = `Cliente desde ${review.customerSince}`;
      }
      
      return reviewObj;
    });

    res.status(200).json({
      message: 'Reseñas obtenidas exitosamente',
      reviews: processedReviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Get review statistics
const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ isApproved: true });
    
    const avgRatingResult = await Review.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    res.status(200).json({
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10 // Round to 1 decimal
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Admin: Get all reviews (including unapproved)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Todas las reseñas obtenidas exitosamente',
      reviews: reviews
    });

  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Admin: Approve/disapprove review
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      message: 'Estado de reseña actualizado exitosamente',
      review: review
    });

  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Admin: Delete review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        message: 'Reseña no encontrada'
      });
    }

    res.status(200).json({
      message: 'Reseña eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export {
  createReview,
  getReviews,
  getReviewStats,
  getAllReviews,
  updateReviewStatus,
  deleteReview
};
