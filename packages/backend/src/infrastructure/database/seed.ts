import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import { users, posts, comments } from './schema';
import * as bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

const queryClient = postgres(env.DATABASE_URL);
const db = drizzle(queryClient, { schema: { users, posts, comments } });

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Helper function to get initials
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Realistic user data - expanded to 30 users
const userData = [
  { username: 'sarah_wilson', fullName: 'Sarah Wilson', role: 'admin' as const },
  { username: 'mike_chen', fullName: 'Mike Chen', role: 'user' as const },
  { username: 'emma_rodriguez', fullName: 'Emma Rodriguez', role: 'user' as const },
  { username: 'james_kumar', fullName: 'James Kumar', role: 'user' as const },
  { username: 'olivia_thompson', fullName: 'Olivia Thompson', role: 'user' as const },
  { username: 'daniel_martinez', fullName: 'Daniel Martinez', role: 'user' as const },
  { username: 'sophia_park', fullName: 'Sophia Park', role: 'user' as const },
  { username: 'alex_johnson', fullName: 'Alex Johnson', role: 'user' as const },
  { username: 'maria_santos', fullName: 'Maria Santos', role: 'user' as const },
  { username: 'ryan_patel', fullName: 'Ryan Patel', role: 'user' as const },
  { username: 'lisa_anderson', fullName: 'Lisa Anderson', role: 'user' as const },
  { username: 'david_nguyen', fullName: 'David Nguyen', role: 'user' as const },
  { username: 'jennifer_lee', fullName: 'Jennifer Lee', role: 'user' as const },
  { username: 'robert_garcia', fullName: 'Robert Garcia', role: 'user' as const },
  { username: 'michelle_taylor', fullName: 'Michelle Taylor', role: 'user' as const },
  { username: 'kevin_brown', fullName: 'Kevin Brown', role: 'user' as const },
  { username: 'amanda_white', fullName: 'Amanda White', role: 'user' as const },
  { username: 'christopher_davis', fullName: 'Christopher Davis', role: 'user' as const },
  { username: 'jessica_miller', fullName: 'Jessica Miller', role: 'user' as const },
  { username: 'matthew_wilson', fullName: 'Matthew Wilson', role: 'user' as const },
  { username: 'ashley_moore', fullName: 'Ashley Moore', role: 'user' as const },
  { username: 'joshua_jackson', fullName: 'Joshua Jackson', role: 'user' as const },
  { username: 'samantha_martin', fullName: 'Samantha Martin', role: 'user' as const },
  { username: 'andrew_lopez', fullName: 'Andrew Lopez', role: 'user' as const },
  { username: 'nicole_gonzalez', fullName: 'Nicole Gonzalez', role: 'user' as const },
  { username: 'brandon_perez', fullName: 'Brandon Perez', role: 'user' as const },
  { username: 'stephanie_roberts', fullName: 'Stephanie Roberts', role: 'user' as const },
  { username: 'tyler_campbell', fullName: 'Tyler Campbell', role: 'user' as const },
  { username: 'rachel_turner', fullName: 'Rachel Turner', role: 'user' as const },
  { username: 'jonathan_hill', fullName: 'Jonathan Hill', role: 'user' as const },
];

// Base post content templates - will be combined to create variations
const postTopics = [
  "Just finished reading 'Atomic Habits' by James Clear. Highly recommend it for anyone looking to build better habits and break bad ones. The concept of making small changes that compound over time really resonates with me. 📚",
  "Coffee enthusiasts! ☕ What's your favorite brewing method? I've been experimenting with pour-over lately and the difference in flavor is amazing. Currently using a Hario V60 and loving the control it gives me.",
  "Spent the weekend hiking in the mountains. The views were absolutely breathtaking! There's something therapeutic about disconnecting from technology and reconnecting with nature. 🏔️",
  "Quick tip for developers: Take regular breaks! I've been using the Pomodoro Technique for the past month and my productivity has improved significantly. 25 minutes of focused work, then a 5-minute break. Game changer!",
  "Does anyone else feel like time flies faster as you get older? I swear it was just New Year's and now we're already halfway through the year! 😅",
  "Finally tried that new restaurant downtown everyone's been talking about. The food did NOT disappoint! The truffle pasta was incredible. If you're in the area, definitely check it out.",
  "Working on a personal project to learn TypeScript. It's challenging but rewarding. The type safety really does make a difference in catching bugs early. Any tips for someone still learning?",
  "Early morning runs hit different. There's something peaceful about the city before everyone wakes up. Plus, it feels great to get exercise done before the day even starts! 🏃‍♀️",
  "Been reflecting on the importance of work-life balance lately. It's so easy to get caught up in hustle culture, but taking time for yourself and your loved ones is equally important. Remember to rest!",
  "Just discovered this amazing indie band and I can't stop listening to their album. Music has a way of finding you exactly when you need it. What's everyone listening to these days? 🎵",
  "Meal prep Sunday! Spent a few hours preparing healthy meals for the week. It's a bit of work upfront but saves so much time and money during busy weekdays. Plus, I eat healthier! 🥗",
  "Can we normalize asking for help when we need it? There's no shame in admitting you don't know something or that you're struggling. We're all learning and growing together.",
  "Anyone else love the smell of rain? Just finished a walk in the light drizzle and it was so refreshing. Sometimes the simplest things bring the most joy. 🌧️",
  "Finished my first online course on web development! Feeling proud of myself for sticking with it. The journey was challenging but the sense of accomplishment makes it all worth it. 💻",
  "Pro tip: Keep a journal. I started writing down three things I'm grateful for each day and it's genuinely improved my mindset. Such a simple practice with profound effects.",
  "Game night with friends was exactly what I needed. We played board games until 2 AM and laughed until our faces hurt. Quality time with good people is priceless! 🎲",
  "Learning to say no has been one of the most important skills I've developed. You can't pour from an empty cup. It's okay to prioritize your own well-being.",
  "The sunset today was absolutely stunning. Had to stop what I was doing just to appreciate it. Sometimes nature puts on the best show. 🌅",
  "Started a small garden on my balcony. There's something rewarding about growing your own herbs and vegetables. Even if it's just a few pots, it feels like an accomplishment! 🌱",
  "Throwback to pre-pandemic times when we could travel freely. Can't wait to explore new places again. Where's the first place you want to visit? ✈️",
  "Made homemade pizza from scratch today. The dough turned out perfect! There's something satisfying about creating food with your own hands. 🍕",
  "Started learning guitar and my fingers hurt so much! But I can already play three chords. Progress is progress, no matter how small. 🎸",
  "Sunday morning vibes: coffee, good book, and no alarm clock. This is what weekends are for!",
  "Went to the farmer's market today and got the freshest vegetables. Supporting local farmers feels great and the quality difference is noticeable!",
  "Trying to reduce my screen time. It's harder than I thought but I'm already feeling less anxious. Small steps towards digital wellness.",
  "Finally organized my workspace and it's amazing how much more productive I feel. A clean space really does equal a clear mind! 🖥️",
  "Started a new job today! Excited and nervous at the same time. Here's to new beginnings and opportunities! 💼",
  "Attended an amazing tech conference this weekend. The networking opportunities and insights were invaluable. Already implementing some ideas!",
  "Binge-watched an entire series this weekend and I regret nothing. Sometimes you just need to veg out and that's okay! 📺",
  "The gym was packed today! Love seeing so many people committed to their fitness goals. We're all gonna make it! 💪",
];

// Expanded comment templates for more variety
const commentTemplates = [
  "This is so true! Thanks for sharing.",
  "I completely agree with this perspective.",
  "Great point! I never thought about it that way.",
  "Thanks for the recommendation! I'll definitely check it out.",
  "This resonates with me so much. Been going through something similar.",
  "Love this! We need more positivity like this.",
  "Interesting take. I have a slightly different view though.",
  "This made me smile! Thanks for brightening my day.",
  "So relatable! 😄",
  "Couldn't have said it better myself!",
  "I've been thinking the same thing lately.",
  "This is the content I signed up for! 👏",
  "Bookmarking this for later. Great insights!",
  "100% agree with everything you said here.",
  "This is such an important message. Thank you!",
  "You just put into words what I've been feeling!",
  "Thanks for posting this. Really needed to hear it today.",
  "This is gold! Sharing with my friends.",
  "Can't wait to try this out myself!",
  "Absolutely beautiful! 😍",
  "Very insightful post!",
  "This hits different today.",
  "Needed this reminder, thank you!",
  "Amazing content as always!",
  "I appreciate you sharing this.",
  "Facts! No cap! 💯",
  "This deserves more attention!",
  "Saving this for future reference.",
  "Well said!",
  "You're speaking my language!",
  "This is exactly what I needed today.",
  "Couldn't agree more!",
  "Preach! 🙌",
  "So much wisdom in this post.",
  "Thanks for putting this out there.",
  "This really makes you think.",
  "Love your perspective on this!",
  "This is important. More people need to see this.",
  "Quality content right here!",
  "You always know what to say!",
];

// Additional reply comments with more variety
const replyTemplates = [
  "Couldn't agree more with both of you!",
  "Adding to this - I found that...",
  "Great addition to the conversation!",
  "Thanks for the tip! That's really helpful.",
  "Same here! Glad I'm not the only one.",
  "Interesting perspective! I appreciate the insight.",
  "You're absolutely right about that.",
  "This thread is so wholesome! ❤️",
  "Learning so much from this discussion!",
  "Count me in! Love this idea.",
  "Exactly! I was thinking the same thing.",
  "Great minds think alike!",
  "This conversation is everything!",
  "Y'all are making such good points!",
  "Adding this to my notes!",
  "This thread delivers!",
  "So glad I read through all these comments!",
  "The community here is amazing!",
  "This is why I love this platform.",
  "Such valuable insights from everyone!",
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await db.execute(sql`TRUNCATE TABLE ${comments} RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE ${posts} RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE ${users} RESTART IDENTITY CASCADE`);
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const user of userData) {
      const hashedPassword = await hashPassword('password123'); // Default password for all users
      const [newUser] = await db.insert(users).values({
        username: user.username,
        password: hashedPassword,
        fullName: user.fullName,
        initials: getInitials(user.fullName),
        role: user.role,
      }).returning();
      createdUsers.push(newUser);
      console.log(`  ✓ Created user: ${user.username}`);
    }

    // Create 100 posts
    console.log('📝 Creating 100 posts...');
    const postsToInsert = [];

    for (let i = 0; i < 100; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      // Cycle through post topics, adding variety with numbers
      const baseContent = postTopics[i % postTopics.length];
      const postNumber = Math.floor(i / postTopics.length) + 1;
      const content = postNumber > 1 ? `${baseContent} [Update ${postNumber}]` : baseContent;

      // Create posts at different times (simulate realistic posting over past 90 days)
      const daysAgo = Math.floor(Math.random() * 90);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(createdAt.getHours() - hoursAgo);
      createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

      postsToInsert.push({
        content,
        authorId: randomUser.id,
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Insert posts in batches of 50 for better performance
    const createdPosts = [];
    for (let i = 0; i < postsToInsert.length; i += 50) {
      const batch = postsToInsert.slice(i, i + 50);
      const insertedPosts = await db.insert(posts).values(batch).returning();
      createdPosts.push(...insertedPosts);
      console.log(`  ✓ Created posts ${i + 1}-${Math.min(i + 50, postsToInsert.length)}`);
    }

    // Create 100 comments per post (10,000 total comments)
    console.log('💬 Creating 100 comments per post (this may take a minute)...');
    let commentCount = 0;
    let postIndex = 0;

    for (const post of createdPosts) {
      postIndex++;
      const commentsToInsert = [];

      // Create 85 regular comments for this post
      for (let i = 0; i < 85; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const commentContent = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];

        // Comments should be created after the post
        const postCreatedAt = new Date(post.createdAt);
        const minutesAfterPost = Math.floor(Math.random() * 60 * 24 * 14); // Within 2 weeks of post
        const commentCreatedAt = new Date(postCreatedAt.getTime() + minutesAfterPost * 60000);

        commentsToInsert.push({
          content: commentContent,
          postId: post.id,
          authorId: randomUser.id,
          createdAt: commentCreatedAt,
          updatedAt: commentCreatedAt,
        });
      }

      // Insert regular comments in batch
      const insertedComments = await db.insert(comments).values(commentsToInsert).returning();
      commentCount += insertedComments.length;

      // Create 15 reply comments (nested comments) for variety
      const replyCommentsToInsert = [];
      for (let i = 0; i < 15; i++) {
        const parentComment = insertedComments[Math.floor(Math.random() * insertedComments.length)];
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const replyContent = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

        const parentCreatedAt = new Date(parentComment.createdAt);
        const minutesAfterParent = Math.floor(Math.random() * 60 * 24 * 5); // Within 5 days of parent
        const replyCreatedAt = new Date(parentCreatedAt.getTime() + minutesAfterParent * 60000);

        replyCommentsToInsert.push({
          content: replyContent,
          postId: post.id,
          authorId: randomUser.id,
          parentCommentId: parentComment.id,
          createdAt: replyCreatedAt,
          updatedAt: replyCreatedAt,
        });
      }

      // Insert reply comments in batch
      await db.insert(comments).values(replyCommentsToInsert);
      commentCount += replyCommentsToInsert.length;

      // Progress indicator every 10 posts
      if (postIndex % 10 === 0) {
        console.log(`  ✓ Progress: ${postIndex}/100 posts processed (${commentCount} comments created)`);
      }
    }

    console.log(`  ✓ Created ${commentCount} comments total (including ${createdPosts.length * 15} nested replies)`);

    // Add some edited posts
    console.log('✏️  Adding some edited posts...');
    const postsToEdit = createdPosts.slice(0, 10);
    for (const post of postsToEdit) {
      const editor = createdUsers.find(u => u.id === post.authorId);
      const editedAt = new Date(post.createdAt);
      editedAt.setHours(editedAt.getHours() + Math.floor(Math.random() * 24) + 1); // Edit 1-24 hours after creation

      await db.update(posts)
        .set({
          isEdited: true,
          editedAt,
          editedBy: editor?.id,
          content: post.content + '\n\nEdit: Fixed a typo!',
        })
        .where(sql`${posts.id} = ${post.id}`);
    }
    console.log(`  ✓ Marked ${postsToEdit.length} posts as edited`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Posts: ${createdPosts.length}`);
    console.log(`   - Comments: ${commentCount}`);
    console.log(`\n💡 Default password for all users: password123`);
    console.log(`\n👤 Admin user: sarah_wilson`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await queryClient.end();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('\n✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });
