# Exercise Images Guide

## How to Add Exercise Images

### Option 1: Use Supabase Storage (Recommended)

1. **Create Storage Bucket in Supabase:**
   - Go to your Supabase dashboard
   - Click "Storage" in the sidebar
   - Create a new bucket called `exercise-images`
   - Make it **public**

2. **Upload Images:**
   - Upload exercise images/GIFs to the bucket
   - Recommended format: JPG or PNG (or GIF for animated demos)
   - Recommended size: 800x600px or 16:9 aspect ratio

3. **Get Image URLs:**
   - Click on an uploaded image
   - Copy the public URL
   - Format: `https://ttkdbdfezvyigdegfiwm.supabase.co/storage/v1/object/public/exercise-images/cat-cow.jpg`

4. **Update Exercise Records:**
   ```sql
   UPDATE exercises 
   SET thumbnail_url = 'https://ttkdbdfezvyigdegfiwm.supabase.co/storage/v1/object/public/exercise-images/cat-cow.jpg'
   WHERE name = 'Cat-Cow Stretch';
   ```

### Option 2: Use Free Exercise Image APIs

**Wger Workout Manager (Free & Open Source):**
- API: https://wger.de/api/v2/
- Example: https://wger.de/api/v2/exercise/345/images/
- Images are CC-licensed

**Exercise.com:**
- Has free tier with exercise images
- Requires API key

### Option 3: Use External Image URLs

You can use any public image URL:

```sql
UPDATE exercises 
SET thumbnail_url = 'https://example.com/exercise-images/bird-dog.jpg'
WHERE name = 'Bird Dog';
```

### Batch Update All Exercises

```sql
-- Example: Update multiple exercises at once
UPDATE exercises SET thumbnail_url = 'https://your-cdn.com/cat-cow.jpg' WHERE name = 'Cat-Cow Stretch';
UPDATE exercises SET thumbnail_url = 'https://your-cdn.com/childs-pose.jpg' WHERE name = 'Child''s Pose';
UPDATE exercises SET thumbnail_url = 'https://your-cdn.com/knee-to-chest.jpg' WHERE name = 'Knee to Chest Stretch';
-- ... repeat for all exercises
```

## Current Exercise List

Here are all the exercises in your database that need images:

1. Cat-Cow Stretch (stretching)
2. Child's Pose (stretching)
3. Knee to Chest Stretch (stretching)
4. Piriformis Stretch (stretching)
5. Pelvic Tilt (core)
6. Dead Bug (core)
7. Bird Dog (core)
8. Glute Bridge (strengthening)
9. Clamshell (strengthening)
10. Spinal Rotation (mobility)
11. Hip Circles (mobility)
12. Single Leg Stand (balance)

## Placeholder Behavior

**Current Implementation:**
- If `thumbnail_url` is null/empty: Shows large emoji based on category
- If `thumbnail_url` exists: Shows actual image

**Category Emojis:**
- stretching: 🧘
- core: 💪
- balance: 🤸
- strengthening: 🏋️
- mobility: 🔄

## Recommended Free Image Sources

1. **Unsplash** (Free, high quality)
   - Search: "yoga stretch", "core exercise", etc.
   - License: Free to use

2. **Pexels** (Free, high quality)
   - Good exercise photos
   - License: Free to use

3. **Wger Exercise Database** (Open source)
   - Actual exercise demonstrations
   - License: CC-BY-SA

4. **Create Your Own**
   - Use AI tools like DALL-E, Midjourney
   - Or take photos/videos yourself

## Example SQL Update Script

```sql
-- Update with Supabase Storage URLs
UPDATE exercises SET thumbnail_url = 'https://ttkdbdfezvyigdegfiwm.supabase.co/storage/v1/object/public/exercise-images/cat-cow.jpg' WHERE id = 'edcd5e05-14c3-4530-9a8e-886cf6eb110d';
UPDATE exercises SET thumbnail_url = 'https://ttkdbdfezvyigdegfiwm.supabase.co/storage/v1/object/public/exercise-images/childs-pose.jpg' WHERE id = '8324b632-17c9-4d34-a628-4f93551e3a82';
-- ... add more
```

## Testing

After adding images, test:
1. Visit `/exercises` - Should see image cards
2. Click an exercise - Should see larger image at top
3. Mobile view - Images should be responsive