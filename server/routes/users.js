const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = user.followers.includes(req.user._id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user is following another user
router.get('/:userId/is-following', auth, async (req, res) => {
  try {
    const userToCheck = await User.findById(req.params.userId);
    
    if (!userToCheck) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isFollowing = userToCheck.followers.includes(req.user._id);
    
    res.json({
      isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = userToFollow.followers.includes(currentUser._id);

    if (isFollowing) {
      // Unfollow
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followersCount -= 1;
      currentUser.followingCount -= 1;
    } else {
      // Follow
      userToFollow.followers.push(currentUser._id);
      currentUser.following.push(userToFollow._id);
      userToFollow.followersCount += 1;
      currentUser.followingCount += 1;
      
      // Create notification for new follow
      const notification = new Notification({
        recipient: userToFollow._id,
        sender: currentUser._id,
        type: 'follow'
      });
      await notification.save();
    }

    await userToFollow.save();
    await currentUser.save();

    res.json({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;