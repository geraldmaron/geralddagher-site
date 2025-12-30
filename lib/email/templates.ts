interface ConfirmationEmailParams {
  firstName?: string;
  confirmationUrl: string;
  senderName: string;
}

interface PostPublishedEmailParams {
  postTitle: string;
  postExcerpt?: string;
  postUrl: string;
  publishDate: string | Date;
  coverImage?: string;
  senderName: string;
}

interface TMPSubmissionEmailParams {
  data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    title?: string;
    company?: string;
    about_you: string;
    phonetic_spelling?: string;
    pronouns?: string;
    website?: string;
    youtube_link?: string;
    session_date?: string | null;
    social_links?: Record<string, string>;
    contact_preferences: {
      selected_contact_methods: string[];
      selected_days?: string[];
      selected_times: string[];
      selected_dates: string[];
    };
    status: string;
  };
  senderName: string;
}

interface ContactFormEmailParams {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
    company?: string;
    aboutYou: string;
    phoneticSpelling?: string;
    pronouns?: string;
    website?: string;
    socialLinks?: Record<string, string>;
    contactPreferences: {
      methods: string[];
      days: string[];
      times: string[];
    };
  };
  senderName: string;
}

export function generateConfirmationEmailTemplate(params: ConfirmationEmailParams): { subject: string; html: string; text: string } {
  const { firstName, confirmationUrl, senderName } = params;
  const name = firstName || 'Subscriber';

  const subject = 'Please confirm your blog subscription';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Subscription</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
        }
        .hero-section {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%), url('https://geralddagher.com/hero-bg.jpg') center/cover;
            padding: 60px 30px;
            text-align: center; 
            color: white;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 30px; 
        }
        .hero-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 16px 0;
            letter-spacing: -0.025em;
        }
        .hero-subtitle {
            font-size: 18px;
            font-weight: 400;
            margin: 0; 
            opacity: 0.9;
        }
        .content { 
            padding: 50px 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 24px 0;
            text-align: center;
        }
        .intro-text {
            color: #475569;
            font-size: 16px;
            margin: 0 0 40px 0;
            line-height: 1.7;
            text-align: center;
        }
        .confirmation-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bae6fd;
            border-radius: 20px;
            padding: 40px;
            margin: 40px 0;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
        }
        .confirmation-title {
            color: #0c4a6e;
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 24px 0;
        }
        .confirmation-text {
            color: #0c4a6e;
            font-size: 16px;
            margin: 0 0 32px 0;
            line-height: 1.6;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white !important; 
            padding: 20px 40px;
            text-decoration: none; 
            border-radius: 14px;
            font-weight: 600;
            font-size: 18px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px -5px rgba(16, 185, 129, 0.4);
        }
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px -5px rgba(16, 185, 129, 0.5);
        }
        .fallback-section {
            margin: 40px 0;
            text-align: center;
        }
        .fallback-title {
            color: #374151;
            font-size: 16px;
            font-weight: 600; 
            margin: 0 0 16px 0;
        }
        .link-fallback {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0; 
            word-break: break-all;
        }
        .link-fallback a {
            color: #10b981;
            text-decoration: none;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        .info-section {
            background-color: #f9fafb;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            text-align: center; 
        }
        .info-text {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
            line-height: 1.6;
        }
        .footer { 
            background-color: #f8fafc;
            padding: 50px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .signature {
            margin: 24px 0;
            font-weight: 600;
            color: #1f2937;
            font-size: 16px;
        }
        .social-links {
            margin: 32px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #64748b;
            text-decoration: none;
            font-size: 14px; 
            font-weight: 500;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 32px 0;
        }
        .disclaimer {
            font-size: 12px;
            color: #9ca3af;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="hero-section">
            <img src="https://geralddagher.com/Dagher_Logo_2024_WH.png" alt="Gerald Dagher" class="logo">
            <h1 class="hero-title">Welcome to the Community</h1>
            <p class="hero-subtitle">Join me on this journey of thoughts, stories, and insights</p>
    </div>
    
    <div class="content">
            <h2 class="greeting">Hey${name !== 'Subscriber' ? ` ${name}` : ''}! 👋</h2>
            
            <p class="intro-text">
                Thanks for wanting to stay in the loop with my blog. I'm excited to have you here and can't wait to share what's on my mind with you.
            </p>
            
            <div class="confirmation-card">
                <h3 class="confirmation-title">One Quick Thing Left to Do!</h3>
                <p class="confirmation-text">
                    Just click the button below to confirm your subscription and start receiving updates:
                </p>
                
                <a href="${confirmationUrl}" class="button">Confirm My Subscription</a>
            </div>
            
            <div class="fallback-section">
                <p class="fallback-title">Button not working?</p>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px 0;">
                    Copy and paste this link into your browser:
                </p>
                <div class="link-fallback">
                    <a href="${confirmationUrl}">${confirmationUrl}</a>
                </div>
            </div>
            
            <div class="info-section">
                <p class="info-text">
                    <strong>Security Note:</strong> This confirmation link will expire in 24 hours for your protection.
                </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    If you didn't sign up for this, no worries—just ignore this email and you won't hear from me again.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                Looking forward to connecting,<br>${senderName}
            </div>
            
            <div class="social-links">
                <a href="https://geralddagher.com">Website</a> •
                <a href="https://linkedin.com/in/geralddagher">LinkedIn</a> •
                <a href="https://twitter.com/geralddagher">Twitter</a>
    </div>
    
            <div class="divider"></div>
            
            <p class="disclaimer">This is an automated email, so please don't reply to this address.</p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Hey${name !== 'Subscriber' ? ` ${name}` : ''}! 👋

Thanks for wanting to stay in the loop with my blog. I'm excited to have you here and can't wait to share what's on my mind with you.

One Quick Thing Left to Do!
Just click this link to confirm your subscription and start receiving updates:
${confirmationUrl}

This link will expire in 24 hours for security reasons.

If you didn't sign up for this, no worries—just ignore this email and you won't hear from me again.

Looking forward to connecting,
${senderName}

---
This is an automated email, so please don't reply to this address.
`;

  return { subject, html, text };
}

export function generatePostPublishedEmailTemplate(params: PostPublishedEmailParams): { subject: string; html: string; text: string } {
  const { postTitle, postExcerpt, postUrl, publishDate, coverImage, senderName } = params;
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `New Post: ${postTitle}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Blog Post</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
        }
        .header { 
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 40px 30px;
            text-align: center; 
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 { 
            color: white;
            margin: 0; 
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.025em;
        }
        .header .subtitle {
            color: rgba(255, 255, 255, 0.8);
            margin: 8px 0 0 0;
            font-size: 16px;
            font-weight: 400;
        }
        .content { 
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 24px 0;
        }
        .intro-text {
            color: #475569;
            font-size: 16px;
            margin: 0 0 32px 0;
            line-height: 1.7;
        }
        .post-card { 
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            margin: 32px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .post-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: 500;
        }
        .post-content {
            padding: 32px;
        }
        .post-title { 
            color: #1e293b;
            font-size: 24px; 
            font-weight: 700; 
            margin: 0 0 16px 0;
            line-height: 1.3; 
            letter-spacing: -0.025em;
        }
        .post-meta { 
            color: #64748b;
            font-size: 14px; 
            margin-bottom: 20px; 
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .post-meta .date-icon {
            width: 16px;
            height: 16px;
            background-color: #3b82f6;
            border-radius: 50%;
            display: inline-block;
        }
        .post-excerpt { 
            color: #475569;
            margin-bottom: 28px;
            line-height: 1.7; 
            font-size: 16px;
        }
        .cta-section {
            text-align: center;
            margin: 32px 0;
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white !important; 
            padding: 18px 36px;
            text-decoration: none; 
            border-radius: 12px;
            font-weight: 600; 
            font-size: 16px;
            text-align: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }
        .button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px -3px rgba(59, 130, 246, 0.4);
        }
        .footer { 
            background-color: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .signature {
            margin: 24px 0;
            font-weight: 500;
            color: #1f2937;
        }
        .unsubscribe { 
            margin-top: 24px;
            font-size: 13px;
            color: #94a3b8;
        }
        .unsubscribe a { 
            color: #94a3b8;
            text-decoration: underline;
        }
        .social-links {
            margin: 24px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #64748b;
            text-decoration: none;
            font-size: 14px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 24px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
    <div class="header">
            <img src="https://geralddagher.com/Dagher_Logo_2024_WH.png" alt="Gerald Dagher" class="logo">
        <h1>${senderName}</h1>
            <div class="subtitle">New Blog Post</div>
    </div>
    
    <div class="content">
            <h2 class="greeting">Hey there! 👋🏾</h2>
        
            <p class="intro-text">
                I just published something new that I think you'll find interesting. Here's what it's about:
            </p>
        
        <div class="post-card">
                <div class="post-image">
                    ${coverImage ? `<img src="${coverImage}" alt="${postTitle}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                </div>
                <div class="post-content">
            <h3 class="post-title">${postTitle}</h3>
                    <div class="post-meta">
                        <span class="date-icon"></span>
                        Published on ${formattedDate}
                    </div>
            ${postExcerpt ? `<div class="post-excerpt">${postExcerpt}</div>` : ''}
                </div>
            </div>
            
            <div class="cta-section">
                <a href="${postUrl}" class="button">Read the Full Post →</a>
            </div>
            
            <p style="margin: 32px 0; color: #475569; font-size: 16px; text-align: center;">
                Thanks for being here and reading my stuff. It means a lot that you're part of this journey with me.
            </p>
        </div>
        
        <div class="footer">
            <div class="signature">
                Take care,<br>${senderName}
            </div>
            
            <div class="social-links">
                <a href="https://geralddagher.com">Website</a> •
                <a href="https://linkedin.com/in/geralddagher">LinkedIn</a> •
                <a href="https://twitter.com/geralddagher">Twitter</a>
    </div>
    
            <div class="divider"></div>
        
        <div class="unsubscribe">
                <p>You're getting this because you signed up for blog updates. 
                <a href="${process.env.APP_BASE_URL || 'https://geralddagher.com'}/unsubscribe">Unsubscribe</a> if you're not feeling it anymore.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  const text = `
Hey there! 👋🏾

I just published something new that I think you'll find interesting. Here's what it's about:

${postTitle}
Published on ${formattedDate}

${postExcerpt || ''}

Read the full post here: ${postUrl}

Thanks for being here and reading my stuff. It means a lot that you're part of this journey with me.

Take care,
${senderName}

---
You're getting this because you signed up for blog updates. 
If you're not feeling it anymore, visit: ${process.env.APP_BASE_URL || 'https://geralddagher.com'}/unsubscribe
`;

  return { subject, html, text };
}

export function generateTMPSubmissionEmailTemplate(params: TMPSubmissionEmailParams): { subject: string; html: string; text: string } {
  const { data, senderName } = params;
  
  const subject = 'New TMP Submission - The Maron Project';
  
  const socialLinksHtml = data.social_links && Object.keys(data.social_links).length > 0 ? 
    Object.entries(data.social_links)
      .map(([platform, url]) => `<li><strong>${platform}:</strong> <a href="${url}" style="color: #3b82f6; text-decoration: none;">${url}</a></li>`)
      .join('') : '';
      
  const contactMethodsHtml = data.contact_preferences.selected_contact_methods
    .map((method: string) => `<li style="background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 4px 0; display: inline-block;">${method}</li>`)
    .join('');
    
  const availableDaysHtml = data.contact_preferences.selected_days && data.contact_preferences.selected_days.length > 0 ?
    data.contact_preferences.selected_days
      .map((day: string) => `<li style="background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 4px 0; display: inline-block;">${day}</li>`)
      .join('') : '';
      
  const availableTimesHtml = data.contact_preferences.selected_times
    .map((time: string) => `<li style="background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 4px 0; display: inline-block;">${time}</li>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New TMP Submission</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 32px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
        }
        .info-item {
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
        }
        .about-section {
            background: #f8fafc;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
        }
        .about-text {
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
            margin: 0;
        }
        .preferences-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        .preference-section {
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .preference-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 12px 0;
        }
        .preference-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .social-links-section {
            background: #f8fafc;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
        }
        .social-links-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .social-links-list li {
            margin-bottom: 8px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .signature {
            margin: 24px 0;
            font-weight: 600;
            color: #1e293b;
            font-size: 16px;
        }
        .social-links {
            margin: 32px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #64748b;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 32px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://geralddagher.com/Dagher_Logo_2024_WH.png" alt="Gerald Dagher" class="logo">
            <h1>New TMP Submission</h1>
            <div class="subtitle">The Maron Project - Story Submission</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">Personal Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${data.first_name} ${data.last_name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${data.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${data.phone || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Job Title</div>
                        <div class="info-value">${data.title || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Company</div>
                        <div class="info-value">${data.company || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Website</div>
                        <div class="info-value">${data.website || 'Not provided'}</div>
                    </div>
                </div>
                
                ${data.phonetic_spelling ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Pronunciation</div>
                    <div class="info-value">${data.phonetic_spelling}</div>
                </div>
                ` : ''}
                
                ${data.pronouns ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Pronouns</div>
                    <div class="info-value">${data.pronouns}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="section">
                <h2 class="section-title">About You</h2>
                <div class="about-section">
                    <p class="about-text">${data.about_you}</p>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Contact Preferences</h2>
                <div class="preferences-grid">
                    <div class="preference-section">
                        <div class="preference-title">Preferred Contact Methods</div>
                        <ul class="preference-list">${contactMethodsHtml}</ul>
                    </div>
                    
                    ${availableDaysHtml ? `
                    <div class="preference-section">
                        <div class="preference-title">Available Days</div>
                        <ul class="preference-list">${availableDaysHtml}</ul>
                    </div>
                    ` : ''}
                    
                    <div class="preference-section">
                        <div class="preference-title">Available Times</div>
                        <ul class="preference-list">${availableTimesHtml}</ul>
                    </div>
                </div>
            </div>
            
            ${socialLinksHtml ? `
            <div class="section">
                <h2 class="section-title">Social Media Links</h2>
                <div class="social-links-section">
                    <ul class="social-links-list">${socialLinksHtml}</ul>
                </div>
            </div>
            ` : ''}
            
            ${data.youtube_link ? `
            <div class="section">
                <h2 class="section-title">YouTube Link</h2>
                <div class="about-section">
                    <p class="about-text"><a href="${data.youtube_link}" style="color: #3b82f6; text-decoration: none;">${data.youtube_link}</a></p>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="signature">
                New submission received,<br>${senderName}
            </div>
            
            <div class="social-links">
                <a href="https://geralddagher.com">Website</a> •
                <a href="https://linkedin.com/in/geralddagher">LinkedIn</a> •
                <a href="https://twitter.com/geralddagher">Twitter</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 13px; margin: 0;">
                This is an automated notification from your website contact form.
            </p>
        </div>
    </div>
</body>
</html>`;

  const text = `
New TMP Submission - The Maron Project

Personal Information:
Name: ${data.first_name} ${data.last_name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Job Title: ${data.title || 'Not provided'}
Company: ${data.company || 'Not provided'}
Website: ${data.website || 'Not provided'}
${data.phonetic_spelling ? `Pronunciation: ${data.phonetic_spelling}` : ''}
${data.pronouns ? `Pronouns: ${data.pronouns}` : ''}

About You:
${data.about_you}

Contact Preferences:
Preferred Contact Methods: ${data.contact_preferences.selected_contact_methods.join(', ')}
${data.contact_preferences.selected_days && data.contact_preferences.selected_days.length > 0 ? `Available Days: ${data.contact_preferences.selected_days.join(', ')}` : ''}
Available Times: ${data.contact_preferences.selected_times.join(', ')}

${data.social_links && Object.keys(data.social_links).length > 0 ? `
Social Media Links:
${Object.entries(data.social_links).map(([platform, url]) => `${platform}: ${url}`).join('\n')}
` : ''}

${data.youtube_link ? `
YouTube Link: ${data.youtube_link}
` : ''}

New submission received,
${senderName}

Website: https://geralddagher.com
LinkedIn: https://linkedin.com/in/geralddagher
Twitter: https://twitter.com/geralddagher

This is an automated notification from your website contact form.
`;

  return { subject, html, text };
}

export function generateContactFormEmailTemplate(params: ContactFormEmailParams): { subject: string; html: string; text: string } {
  const { data, senderName } = params;
  
  const subject = 'New Contact Form Submission';
  
  const socialLinksHtml = data.socialLinks && Object.keys(data.socialLinks).length > 0 ? 
    Object.entries(data.socialLinks)
      .map(([platform, url]) => `<li><strong>${platform}:</strong> <a href="${url}" style="color: #3b82f6; text-decoration: none;">${url}</a></li>`)
      .join('') : '';
      
  const contactMethodsHtml = data.contactPreferences.methods
    .map((method: string) => `<li style="background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 4px 0; display: inline-block;">${method}</li>`)
    .join('');
    
  const availableDaysHtml = data.contactPreferences.days
    .map((day: string) => `<li style="background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 4px 0; display: inline-block;">${day}</li>`)
    .join('');
    
  const availableTimesHtml = data.contactPreferences.times
    .map((time: string) => `<li style="background: #f1f5f9; padding: 8px 16px; border-radius: 8px; margin: 4px 0; display: inline-block;">${time}</li>`)
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1f2937; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 32px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
        }
        .info-item {
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
        }
        .about-section {
            background: #f8fafc;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
        }
        .about-text {
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
            margin: 0;
        }
        .preferences-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        .preference-section {
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .preference-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 12px 0;
        }
        .preference-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .social-links-section {
            background: #f8fafc;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
        }
        .social-links-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .social-links-list li {
            margin-bottom: 8px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .signature {
            margin: 24px 0;
            font-weight: 600;
            color: #1e293b;
            font-size: 16px;
        }
        .social-links {
            margin: 32px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #64748b;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 32px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://geralddagher.com/Dagher_Logo_2024_WH.png" alt="Gerald Dagher" class="logo">
            <h1>New Contact Form Submission</h1>
            <div class="subtitle">Website Contact Request</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">Personal Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${data.firstName} ${data.lastName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${data.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${data.phone || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Job Title</div>
                        <div class="info-value">${data.title || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Company</div>
                        <div class="info-value">${data.company || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Website</div>
                        <div class="info-value">${data.website || 'Not provided'}</div>
                    </div>
                </div>
                
                ${data.phoneticSpelling ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Pronunciation</div>
                    <div class="info-value">${data.phoneticSpelling}</div>
                </div>
                ` : ''}
                
                ${data.pronouns ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Pronouns</div>
                    <div class="info-value">${data.pronouns}</div>
                </div>
                ` : ''}
            </div>
            
            <div class="section">
                <h2 class="section-title">About You</h2>
                <div class="about-section">
                    <p class="about-text">${data.aboutYou}</p>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Contact Preferences</h2>
                <div class="preferences-grid">
                    <div class="preference-section">
                        <div class="preference-title">Preferred Contact Methods</div>
                        <ul class="preference-list">${contactMethodsHtml}</ul>
                    </div>
                    
                    <div class="preference-section">
                        <div class="preference-title">Available Days</div>
                        <ul class="preference-list">${availableDaysHtml}</ul>
                    </div>
                    
                    <div class="preference-section">
                        <div class="preference-title">Available Times</div>
                        <ul class="preference-list">${availableTimesHtml}</ul>
                    </div>
                </div>
            </div>
            
            ${socialLinksHtml ? `
            <div class="section">
                <h2 class="section-title">Social Media Links</h2>
                <div class="social-links-section">
                    <ul class="social-links-list">${socialLinksHtml}</ul>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <div class="signature">
                New contact form submission received,<br>${senderName}
            </div>
            
            <div class="social-links">
                <a href="https://geralddagher.com">Website</a> •
                <a href="https://linkedin.com/in/geralddagher">LinkedIn</a> •
                <a href="https://twitter.com/geralddagher">Twitter</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #64748b; font-size: 13px; margin: 0;">
                This is an automated notification from your website contact form.
            </p>
        </div>
    </div>
</body>
</html>`;

  const text = `
New Contact Form Submission

Personal Information:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Job Title: ${data.title || 'Not provided'}
Company: ${data.company || 'Not provided'}
Website: ${data.website || 'Not provided'}
${data.phoneticSpelling ? `Pronunciation: ${data.phoneticSpelling}` : ''}
${data.pronouns ? `Pronouns: ${data.pronouns}` : ''}

About You:
${data.aboutYou}

Contact Preferences:
Preferred Contact Methods: ${data.contactPreferences.methods.join(', ')}
Available Days: ${data.contactPreferences.days.join(', ')}
Available Times: ${data.contactPreferences.times.join(', ')}

${data.socialLinks && Object.keys(data.socialLinks).length > 0 ? `
Social Media Links:
${Object.entries(data.socialLinks).map(([platform, url]) => `${platform}: ${url}`).join('\n')}
` : ''}

New contact form submission received,
${senderName}

Website: https://geralddagher.com
LinkedIn: https://linkedin.com/in/geralddagher
Twitter: https://twitter.com/geralddagher

This is an automated notification from your website contact form.
`;

  return { subject, html, text };
}

interface BugReportEmailParams {
  name?: string;
  email?: string;
  pageUrl: string;
  description: string;
  browserInfo: string;
  timestamp: string;
}

export function generateBugReportEmailTemplate(params: BugReportEmailParams): { subject: string; html: string; text: string } {
  const { name, email, pageUrl, description, browserInfo, timestamp } = params;

  const subject = 'Bug Report from Website';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bug Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.025em;
        }
        .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 32px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
        }
        .info-item {
            background: #f8fafc;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #1e293b;
            font-weight: 500;
            word-break: break-word;
        }
        .description-section {
            background: #fef2f2;
            padding: 24px;
            border-radius: 16px;
            border: 1px solid #fecaca;
        }
        .description-text {
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
            margin: 0;
            white-space: pre-wrap;
        }
        .footer {
            background-color: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 32px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://geralddagher.com/Dagher_Logo_2024_WH.png" alt="Gerald Dagher" class="logo">
            <h1>Bug Report</h1>
            <div class="subtitle">Website Issue Report</div>
        </div>

        <div class="content">
            <div class="section">
                <h2 class="section-title">Reporter Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Name</div>
                        <div class="info-value">${name || 'Anonymous'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">${email || 'Not provided'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Page URL</div>
                        <div class="info-value">${pageUrl}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Timestamp</div>
                        <div class="info-value">${timestamp}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Bug Description</h2>
                <div class="description-section">
                    <p class="description-text">${description}</p>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Technical Details</h2>
                <div class="info-item">
                    <div class="info-label">Browser & Device Info</div>
                    <div class="info-value">${browserInfo}</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="divider"></div>
            <p style="color: #64748b; font-size: 13px; margin: 0;">
                This is an automated bug report from geralddagher.com
            </p>
        </div>
    </div>
</body>
</html>`;

  const text = `
Bug Report from Website

Reporter Information:
Name: ${name || 'Anonymous'}
Email: ${email || 'Not provided'}
Page URL: ${pageUrl}
Timestamp: ${timestamp}

Bug Description:
${description}

Technical Details:
Browser & Device Info: ${browserInfo}

This is an automated bug report from geralddagher.com
`;

  return { subject, html, text };
}

export function generateCampaignEmailTemplate(params: { subject: string; htmlContent: string; senderName: string }): { subject: string; html: string; text: string } {
  const { subject, htmlContent, senderName } = params;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f8fafc; }
        .email-container { max-width: 640px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 36px 28px; text-align: center; }
        .logo { width: 120px; height: auto; margin-bottom: 12px; }
        .title { color: #fff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; }
        .content { padding: 36px 28px; color: #1f2937; }
        .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05); }
        .card-body { padding: 28px; }
        .footer { background-color: #f8fafc; padding: 36px 28px; text-align: center; border-top: 1px solid #e2e8f0; }
        .signature { margin: 16px 0; font-weight: 500; color: #1f2937; }
        .social { margin: 20px 0; }
        .social a { display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 14px; }
        .unsubscribe { margin-top: 16px; font-size: 12px; color: #94a3b8; }
        .unsubscribe a { color: #94a3b8; text-decoration: underline; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 24px 0; }
    </style>
    </head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://geralddagher.com/Dagher_Logo_2024_WH.png" alt="Gerald Dagher" class="logo">
      <h1 class="title">${subject}</h1>
    </div>
    <div class="content">
      <div class="card">
        <div class="card-body">
          ${htmlContent}
        </div>
      </div>
      <div class="divider"></div>
      <div class="signature">
        Best,
        <br>${senderName}
      </div>
    </div>
    <div class="footer">
      <div class="social">
        <a href="https://geralddagher.com">Website</a> •
        <a href="https://linkedin.com/in/geralddagher">LinkedIn</a> •
        <a href="https://twitter.com/geralddagher">Twitter</a>
      </div>
      <div class="unsubscribe">
        You're receiving this because you subscribed to blog updates. <a href="${process.env.APP_BASE_URL || 'https://geralddagher.com'}/unsubscribe">Unsubscribe</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${subject}\n\n${htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n\nBest,\n${senderName}\n\nWebsite: https://geralddagher.com\nLinkedIn: https://linkedin.com/in/geralddagher\nTwitter: https://twitter.com/geralddagher\n\nUnsubscribe: ${(process.env.APP_BASE_URL || 'https://geralddagher.com') + '/unsubscribe'}`;

  return { subject, html, text };
}
