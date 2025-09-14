<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Lead Finder

An AI-powered lead generation tool that helps businesses find and reach out to potential clients. The app analyzes your business profile and uses AI to identify qualified leads and generate personalized outreach emails.

## Features

- 🔒 Secure authentication with Google Sign-In
- 💼 Business profile management
- 🎯 AI-powered lead generation
- ✉️ Automated email draft generation
- 📊 Lead history tracking
- 📱 Mobile-responsive design

## Prerequisites

- Node.js (v18 or later)
- A Supabase account
- A Google Cloud account (for Gemini API)

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-lead-finder.git
   cd ai-lead-finder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Enable Google Authentication in your Supabase project
   - Copy your project URL and anon key

4. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Gemini API credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following Supabase tables:

### Users
- Extends Supabase auth with additional user profile information
- Contains: name, email, avatar_url

### Business Profiles
- Stores business information for lead generation
- Contains: description, target industry, location, etc.

### Leads
- Stores generated leads and outreach content
- Contains: business information, contact details, and email drafts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
