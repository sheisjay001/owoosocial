const cron = require('node-cron');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Newsletter = require('../models/Newsletter');
const Podcast = require('../models/Podcast');
const Broadcast = require('../models/Broadcast');
const User = require('../models/User');
const socialService = require('./social.service');
const emailService = require('./email.service');
const podcastService = require('./podcast.service');

// Import controllers for offline mode access
const newsletterController = require('../controllers/newsletter.controller');
const subscriberController = require('../controllers/subscriber.controller');

const initScheduler = () => {
  // Check every minute for posts and newsletters
  cron.schedule('* * * * *', async () => {
    const isOffline = mongoose.connection.readyState !== 1;

    if (isOffline) {
        console.log('[Scheduler] Running in OFFLINE MODE (Using in-memory data)');
    }

    console.log('Running Scheduler: Checking for due tasks...');
    
    const now = new Date();

    // --- Process Podcasts ---
    try {
      const duePodcasts = await Podcast.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      });

      if (duePodcasts.length > 0) {
        console.log(`Found ${duePodcasts.length} podcasts to publish.`);
        
        for (const podcast of duePodcasts) {
          try {
            // Upload first
            const audioUrl = await podcastService.uploadEpisode(podcast);
            podcast.audioUrl = audioUrl;

            // Distribute to platforms
            for (const platform of podcast.platforms) {
               if (platform === 'spotify') await podcastService.publishToSpotify(podcast);
               if (platform === 'apple') await podcastService.publishToApplePodcasts(podcast);
               if (platform === 'youtube') await podcastService.publishToYouTube(podcast);
            }
            
            podcast.status = 'published';
            podcast.publishedAt = new Date();
            await podcast.save();
            console.log(`[Scheduler] Successfully published podcast ${podcast._id}`);
          } catch (err) {
            console.error(`[Scheduler] Failed to publish podcast ${podcast._id}:`, err);
            podcast.status = 'failed';
            await podcast.save();
          }
        }
      }
    } catch (error) {
      console.error('Scheduler Error (Podcasts):', error);
    }

    // --- Process Broadcasts ---
    try {
        const broadcasts = await Broadcast.find({
            $or: [
                { status: 'processing' },
                { status: 'scheduled', scheduledTime: { $lte: now } }
            ]
        }).populate('user').populate('recipients.contact');

        if (broadcasts.length > 0) {
            console.log(`Found ${broadcasts.length} broadcasts to process.`);

            for (const broadcast of broadcasts) {
                try {
                    // Initialize if just starting
                    if (broadcast.status === 'scheduled') {
                        broadcast.status = 'processing';
                        // nextBatchTime defaults to scheduledTime or now, so we can proceed
                        if (!broadcast.nextBatchTime) broadcast.nextBatchTime = now;
                    }

                    // Check if it's time for the next batch
                    if (broadcast.nextBatchTime > now) {
                        continue; // Wait for the window
                    }

                    // Get WhatsApp Credentials
                    const waConnection = broadcast.user.connections.find(c => c.platform === 'WhatsApp');
                    
                    // Fallback to apiKey/identifier if accessToken/platformId are missing
                    const accessToken = waConnection?.accessToken || waConnection?.apiKey;
                    const phoneNumberId = waConnection?.platformId || waConnection?.identifier;

                    if (!waConnection || !accessToken || !phoneNumberId) {
                        console.error(`[Broadcast] Missing WhatsApp credentials for user ${broadcast.user._id}`);
                        broadcast.status = 'failed'; // Or paused?
                        await broadcast.save();
                        continue;
                    }

                    // Get Pending Recipients
                    // We filter in memory because 'recipients' is an array of subdocuments
                    const pendingRecipients = broadcast.recipients.filter(r => r.status === 'pending');

                    if (pendingRecipients.length === 0) {
                        broadcast.status = 'completed';
                        await broadcast.save();
                        continue;
                    }

                    // Take the batch
                    const batch = pendingRecipients.slice(0, broadcast.batchSize);
                    console.log(`[Broadcast ${broadcast._id}] Processing batch of ${batch.length} recipients.`);

                    let batchSuccess = 0;
                    let batchFail = 0;

                    for (const recipient of batch) {
                        if (!recipient.contact || !recipient.contact.phoneNumber) {
                             recipient.status = 'failed';
                             recipient.error = 'Invalid contact';
                             batchFail++;
                             continue;
                        }

                        try {
                            await socialService.postToWhatsApp(
                                broadcast.message,
                                accessToken,
                                phoneNumberId,
                                recipient.contact.phoneNumber
                            );
                            recipient.status = 'sent';
                            recipient.sentAt = new Date();
                            batchSuccess++;
                        } catch (err) {
                            console.error(`[Broadcast] Failed to send to ${recipient.contact.phoneNumber}:`, err.message);
                            recipient.status = 'failed';
                            recipient.error = err.message;
                            batchFail++;
                        }
                    }

                    // Update Broadcast Stats
                    broadcast.processedCount += batch.length;
                    broadcast.successCount += batchSuccess;
                    broadcast.failCount += batchFail;

                    // Schedule next batch
                    const nextTime = new Date();
                    nextTime.setMinutes(nextTime.getMinutes() + broadcast.batchIntervalMinutes);
                    broadcast.nextBatchTime = nextTime;

                    // Check if complete
                    const remaining = broadcast.recipients.filter(r => r.status === 'pending').length;
                    if (remaining === 0) {
                        broadcast.status = 'completed';
                    }

                    await broadcast.save();
                    console.log(`[Broadcast ${broadcast._id}] Batch processed. Success: ${batchSuccess}, Failed: ${batchFail}. Next batch at ${nextTime}`);

                } catch (err) {
                    console.error(`[Broadcast] Error processing broadcast ${broadcast._id}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('Scheduler Error (Broadcasts):', error);
    }

    // --- Process Posts ---
    try {
      const duePosts = await Post.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      });

      if (duePosts.length > 0) {
        console.log(`Found ${duePosts.length} posts to publish.`);

        for (const post of duePosts) {
          try {
            let result;
            switch (post.platform.toLowerCase()) {
              case 'instagram':
                result = await socialService.publishToInstagram(post);
                break;
              case 'twitter':
              case 'x':
                result = await socialService.publishToTwitter(post);
                break;
              case 'linkedin':
                result = await socialService.publishToLinkedIn(post);
                break;
              case 'facebook':
                result = await socialService.publishToFacebook(post);
                break;
              case 'tiktok':
                result = await socialService.publishToTikTok(post);
                break;
              case 'snapchat':
                result = await socialService.publishToSnapchat(post);
                break;
              case 'whatsapp':
                result = await socialService.publishToWhatsApp(post);
                break;
              case 'telegram':
                result = await socialService.publishToTelegram(post);
                break;
              default:
                console.log(`[Scheduler] Unknown platform: ${post.platform}`);
                continue;
            }

            post.status = 'published';
            post.publishedAt = new Date();
            // You could save the external ID here if you added a field for it
            await post.save();
            console.log(`[Scheduler] Successfully published post ${post._id}`);
          } catch (err) {
            console.error(`[Scheduler] Failed to publish post ${post._id}:`, err);
            post.status = 'failed';
            await post.save();
          }
        }
      }
    } catch (error) {
      console.error('Scheduler Error (Posts):', error);
    }

    // --- Process Newsletters ---
    try {
      const dueNewsletters = await Newsletter.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      }).populate('user'); // Populate user to get sender info

      if (dueNewsletters.length > 0) {
        console.log(`Found ${dueNewsletters.length} newsletters to send.`);
        
        const Subscriber = require('../models/Subscriber');

        for (const newsletter of dueNewsletters) {
          try {
            // Fetch real subscribers for this newsletter's owner
            let subscribers = [];
            
            if (newsletter.user) {
                const subDocs = await Subscriber.find({ 
                    user: newsletter.user._id, 
                    status: 'subscribed' 
                }).select('email');
                subscribers = subDocs.map(s => s.email);
            }

            if (subscribers.length === 0) {
                console.log(`[Scheduler] No subscribers found for Newsletter ${newsletter._id} (User: ${newsletter.user?._id})`);
                // Fallback to mock only if explicitly desired, otherwise skip
                // subscribers = ['mock@example.com']; 
                newsletter.status = 'failed';
                newsletter.analytics = { ...newsletter.analytics, failureReason: 'No subscribers' };
                if (newsletter.save) await newsletter.save();
                continue;
            }

            // Send using email service (passing user as sender)
            await emailService.sendNewsletter(newsletter, subscribers, newsletter.user);
            
            newsletter.status = 'sent';
            newsletter.sentAt = new Date();
            newsletter.recipientCount = subscribers.length;
            if (newsletter.save) await newsletter.save();
            console.log(`[Scheduler] Successfully sent newsletter ${newsletter._id} to ${subscribers.length} recipients.`);
          } catch (err) {
            console.error(`[Scheduler] Failed to send newsletter ${newsletter._id}:`, err);
            newsletter.status = 'failed';
            if (newsletter.save) await newsletter.save();
          }
        }
      }
    } catch (error) {
      console.error('Scheduler Error (Newsletters):', error);
    }
  });
};

module.exports = initScheduler;
