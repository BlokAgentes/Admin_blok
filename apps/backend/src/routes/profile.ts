import { Router } from 'express'
import multer from 'multer'
import { profileService } from '../mcp/profile-service'
import { 
  requireMCPAuth, 
  requireMCPAdmin,
  MCPAuthenticatedRequest,
  apiRateLimit,
  requireResourceOwnership,
  logAuthEvent
} from '../middleware/mcp-auth'

const router = Router()

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

/**
 * Get user profile
 * GET /api/profile/:userId?
 */
router.get('/:userId?', 
  requireMCPAuth,
  apiRateLimit,
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId || req.user!.userId

      // Check if user can access this profile
      if (userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only access your own profile'
        })
      }

      const result = await profileService.getProfile(userId)

      if (!result.success) {
        return res.status(404).json({
          error: result.error || 'Profile not found'
        })
      }

      return res.json({
        message: 'Profile retrieved successfully',
        profile: result.data
      })
    } catch (error) {
      console.error('Get profile error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Update user profile
 * PUT /api/profile
 */
router.put('/',
  requireMCPAuth,
  apiRateLimit,
  logAuthEvent('PROFILE_UPDATE'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId
      const profileData = req.body

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete profileData.id
      delete profileData.role
      delete profileData.createdAt
      delete profileData.updatedAt

      const result = await profileService.updateProfile(userId, profileData)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Profile update failed'
        })
      }

      return res.json({
        message: 'Profile updated successfully',
        profile: result.data
      })
    } catch (error) {
      console.error('Update profile error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Upload user avatar
 * POST /api/profile/avatar
 */
router.post('/avatar',
  requireMCPAuth,
  apiRateLimit,
  upload.single('avatar'),
  logAuthEvent('AVATAR_UPLOAD'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide an image file'
        })
      }

      const result = await profileService.uploadAvatar(
        userId,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      )

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Avatar upload failed'
        })
      }

      return res.json({
        message: 'Avatar uploaded successfully',
        avatar_url: result.data?.avatar_url
      })
    } catch (error) {
      console.error('Avatar upload error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Delete user avatar
 * DELETE /api/profile/avatar
 */
router.delete('/avatar',
  requireMCPAuth,
  apiRateLimit,
  logAuthEvent('AVATAR_DELETE'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId

      const result = await profileService.deleteAvatar(userId)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Avatar deletion failed'
        })
      }

      return res.json({
        message: result.data?.message || 'Avatar deleted successfully'
      })
    } catch (error) {
      console.error('Avatar deletion error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Get user activity logs
 * GET /api/profile/activity
 */
router.get('/activity/logs',
  requireMCPAuth,
  apiRateLimit,
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100) // Max 100 per page

      const result = await profileService.getUserActivity(userId, page, limit)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Failed to get activity logs'
        })
      }

      return res.json({
        message: 'Activity logs retrieved successfully',
        ...result.data
      })
    } catch (error) {
      console.error('Get activity logs error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Admin: Get any user's profile
 * GET /api/profile/admin/:userId
 */
router.get('/admin/:userId',
  requireMCPAuth,
  requireMCPAdmin,
  apiRateLimit,
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId

      const result = await profileService.getProfile(userId)

      if (!result.success) {
        return res.status(404).json({
          error: result.error || 'Profile not found'
        })
      }

      return res.json({
        message: 'Profile retrieved successfully',
        profile: result.data
      })
    } catch (error) {
      console.error('Admin get profile error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Admin: Update any user's profile
 * PUT /api/profile/admin/:userId
 */
router.put('/admin/:userId',
  requireMCPAuth,
  requireMCPAdmin,
  apiRateLimit,
  logAuthEvent('ADMIN_PROFILE_UPDATE'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId
      const profileData = req.body

      // Remove sensitive fields
      delete profileData.id
      delete profileData.createdAt
      delete profileData.updatedAt

      const result = await profileService.updateProfile(userId, profileData)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Profile update failed'
        })
      }

      return res.json({
        message: 'Profile updated successfully by admin',
        profile: result.data
      })
    } catch (error) {
      console.error('Admin update profile error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Admin: Get user activity logs
 * GET /api/profile/admin/:userId/activity
 */
router.get('/admin/:userId/activity',
  requireMCPAuth,
  requireMCPAdmin,
  apiRateLimit,
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)

      const result = await profileService.getUserActivity(userId, page, limit)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Failed to get activity logs'
        })
      }

      return res.json({
        message: 'User activity logs retrieved successfully',
        userId: userId,
        ...result.data
      })
    } catch (error) {
      console.error('Admin get activity logs error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Delete user account (DANGEROUS - requires confirmation)
 * DELETE /api/profile/delete-account
 */
router.delete('/delete-account',
  requireMCPAuth,
  logAuthEvent('ACCOUNT_DELETE_REQUEST'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.user!.userId
      const { confirmation } = req.body

      // Require explicit confirmation
      if (confirmation !== 'DELETE_MY_ACCOUNT') {
        return res.status(400).json({
          error: 'Invalid confirmation',
          message: 'You must provide confirmation: "DELETE_MY_ACCOUNT"'
        })
      }

      // Additional safety check - require email confirmation in production
      if (process.env.NODE_ENV === 'production' && !req.body.email_confirmed) {
        return res.status(400).json({
          error: 'Email confirmation required',
          message: 'Account deletion requires email confirmation in production'
        })
      }

      const result = await profileService.deleteAccount(userId)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Account deletion failed'
        })
      }

      return res.json({
        message: 'Account deleted successfully'
      })
    } catch (error) {
      console.error('Account deletion error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

/**
 * Admin: Delete any user account (DANGEROUS)
 * DELETE /api/profile/admin/:userId/delete
 */
router.delete('/admin/:userId/delete',
  requireMCPAuth,
  requireMCPAdmin,
  logAuthEvent('ADMIN_ACCOUNT_DELETE'),
  async (req: MCPAuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId
      const { confirmation } = req.body

      // Require explicit confirmation
      if (confirmation !== 'DELETE_USER_ACCOUNT') {
        return res.status(400).json({
          error: 'Invalid confirmation',
          message: 'You must provide confirmation: "DELETE_USER_ACCOUNT"'
        })
      }

      // Prevent admin from deleting their own account via this endpoint
      if (userId === req.user!.userId) {
        return res.status(400).json({
          error: 'Cannot delete own account',
          message: 'Use the regular delete-account endpoint to delete your own account'
        })
      }

      const result = await profileService.deleteAccount(userId)

      if (!result.success) {
        return res.status(400).json({
          error: result.error || 'Account deletion failed'
        })
      }

      return res.json({
        message: 'User account deleted successfully by admin',
        deletedUserId: userId
      })
    } catch (error) {
      console.error('Admin account deletion error:', error)
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
)

export default router