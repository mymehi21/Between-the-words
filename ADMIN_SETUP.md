# Shadow of Words - Admin Setup Guide

## Accessing the Admin Portal

**Admin Portal URL:** `https://your-domain.com/admin`

Simply navigate to `/admin` to access the admin login page.

## How the Admin System Works

The admin system uses **email pre-approval**. Here's how it works:

1. **Your email (testnetwork61@gmail.com) is already approved** ✓
2. You can create your account with any password you choose
3. Once logged in, you can approve additional admin emails
4. Users with approved emails can then create their own accounts

## First-Time Setup - Create Your Account

### Step 1: Go to the Admin Page
Visit `https://your-domain.com/admin`

### Step 2: Create Your Account
1. Enter your email: **testnetwork61@gmail.com**
2. Choose a secure password (remember this!)
3. Click "Sign In"

Since your email is pre-approved, your account will be created automatically and you'll have full admin access!

## Managing Additional Admins

Once you're logged in, managing admins is simple:

### To Add a New Admin:
1. Log in to the admin portal
2. Click on the **"Manage Admins"** tab
3. Enter their email address in the input field
4. Click the **+** button

That's it! The email is now approved.

### What Happens Next:
1. The new person visits `your-domain.com/admin`
2. They enter their approved email and choose a password
3. They click "Sign In"
4. Their account is created automatically with admin access
5. They can now log in and manage the website!

### To Remove Admin Access:
1. Go to the **"Manage Admins"** tab
2. Find the admin email you want to remove
3. Click **"Remove"** next to their email
4. Confirm the action

Once removed, they can no longer create an admin account or access the admin panel.

## Admin Features

### 📚 Managing Books
- **Add New Book**: Create book listings with all details
  - Titles in English and Arabic
  - Descriptions in both languages
  - Author names (English/Arabic)
  - Cover image URL
  - PDF URL for digital downloads
  - Pricing for both PDF and physical copies
  - ISBN, page count, publication date
  - Mark books as available or featured

- **Edit Book**: Modify any book details
- **Delete Book**: Remove books from the site

### 📦 Managing Orders
- View all customer orders
- See customer information
- Update order status:
  - Pending
  - Completed
  - Shipped
  - Cancelled
- Track order history

### 👥 Managing Admins
- View all approved admin emails
- Add new admin emails (pre-approve them)
- Remove admin access instantly
- See when each email was approved

## Current Website Content

### Book - Shadow of Words (ظلّ الكلمات)
- **Author**: Fatme Mroue (فاطمة مروة)
- **Cover**: Already set to /Book.jpg
- **Status**: Ready in database
- **Next Steps**: Upload the PDF and set the prices

## Security Notes

### How It Works:
1. **Email Pre-Approval**: Only emails you approve can create admin accounts
2. **Password Protection**: Each admin sets their own secure password
3. **Account Creation**: Users create accounts on first login
4. **No Manual Database Work**: Everything is managed through the admin panel

### Best Practices:
- ✅ Only approve emails you trust completely
- ✅ Use strong, unique passwords
- ✅ Remove admin access immediately when needed
- ✅ Keep PDF files on secure hosting
- ✅ Check the admin dashboard regularly

## Troubleshooting

### "Access Pending" Message
This means your email hasn't been approved yet. Contact the main admin to approve your email.

### Can't Create Account
Make sure:
1. You're using an approved email address
2. Your password meets requirements (minimum 6 characters)
3. You're at the correct URL: `/admin`

### Forgot Password
Currently, you'll need to use Supabase's password reset:
1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Find your user and reset the password
4. Or implement the "Forgot Password" feature in the login page

## Coming Soon

The admin panel will be enhanced with:
- **Image Upload**: Upload book covers, photos, and images directly
- **Site Content Management**: Edit hero text, about section, quotes
- **Blog/Journal Management**: Create and manage blog posts
- **Events Management**: Add book signings, readings, events
- **Reviews Management**: Manage featured reviews
- **Site Settings**: Customize colors, social links, SEO

## Technical Notes

- Admin portal is at `/admin` (easy to remember!)
- Page-based navigation (no scrolling between sections)
- Full RTL support for Arabic language
- Email-based approval system (no manual database work)
- Automatic account creation on first login

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your email is in the approved emails list
3. Make sure you're using the correct URL: `/admin`
4. Contact support if problems persist
