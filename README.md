# EarlyVue - ASD Screening Application

A comprehensive web application for ASD (Autism Spectrum Disorder) screening with patient management, built with React and Supabase.

## 🚀 Quick Start

### Option 1: Demo Mode (No Setup Required)

The application runs in demo mode by default, allowing you to explore all features without any configuration:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd earlyvue-parent-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Login with demo credentials**
   - Email: `demo@earlyvue.com`
   - Password: `password`
   - Or click "Use Demo Credentials" button

### Option 2: Full Supabase Setup

For production use with real data persistence:

1. **Set up Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Create database tables**
   - Copy SQL commands from `SUPABASE_SETUP.md`
   - Run them in your Supabase SQL Editor

4. **Start the application**
   ```bash
   npm start
   ```

## 🎯 Features

### Authentication & User Management
- ✅ **Secure Login/Registration** - Supabase Auth integration
- ✅ **Demo Mode** - Works without external dependencies
- ✅ **Session Management** - Automatic token handling
- ✅ **Password Validation** - Strength indicators and requirements

### Patient Management
- ✅ **Add Patients** - Complete patient information forms
- ✅ **Patient Profiles** - View and manage patient data
- ✅ **Medical History** - Track screening history
- ✅ **Data Persistence** - All data stored securely

### ASD Screening
- ✅ **Multiple Screening Types** - ASD, Developmental, Language assessments
- ✅ **Real-time Results** - Immediate feedback and recommendations
- ✅ **Progress Tracking** - Monitor developmental progress
- ✅ **Report Generation** - Download detailed reports

### Professional Features
- ✅ **Resource Library** - Educational materials and guides
- ✅ **Specialist Finder** - Connect with healthcare professionals
- ✅ **Help & Support** - Comprehensive user assistance
- ✅ **Responsive Design** - Works on all devices

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### Database Schema

The application uses four main tables:

- **users** - User accounts and profiles
- **patients** - Patient information linked to users
- **screenings** - Screening sessions and metadata
- **screening_results** - Detailed screening results and recommendations

## 🎮 Demo Mode vs Supabase Mode

### Demo Mode
- ✅ **No Setup Required** - Works immediately
- ✅ **All Features Available** - Full functionality
- ✅ **Local Storage** - Data persists in browser
- ✅ **Perfect for Testing** - Explore without commitment

### Supabase Mode
- ✅ **Real Database** - Data persists across devices
- ✅ **User Authentication** - Secure login system
- ✅ **Multi-user Support** - Multiple users can have accounts
- ✅ **Production Ready** - Suitable for real-world use

## 🏗️ Architecture

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **CSS Modules** - Scoped styling
- **Responsive Design** - Mobile-first approach

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Automatic data isolation
- **Authentication** - Built-in user management
- **API** - RESTful endpoints for data operations

### Security
- **Row Level Security (RLS)** - Users only see their own data
- **Secure Authentication** - JWT tokens with automatic refresh
- **Input Validation** - Client and server-side validation
- **HTTPS Only** - Secure data transmission

## 📱 Usage Guide

### For New Users
1. **Register** - Create an account with email and password
2. **Add Patient** - Enter your child's information
3. **Start Screening** - Choose appropriate screening type
4. **View Results** - Review detailed assessment reports
5. **Track Progress** - Monitor developmental milestones

### For Healthcare Providers
1. **Access Dashboard** - View all patient screenings
2. **Review Results** - Detailed assessment analysis
3. **Generate Reports** - Download comprehensive reports
4. **Resource Access** - Educational materials and guidelines

## 🔍 Troubleshooting

### Common Issues

#### Login/Register Not Working
- **Demo Mode**: Check if you're using the correct demo credentials
- **Supabase Mode**: Verify your environment variables are set correctly

#### Data Not Saving
- **Demo Mode**: Data is stored in localStorage (cleared when browser data is cleared)
- **Supabase Mode**: Check your database connection and RLS policies

#### Application Not Loading
- Ensure all dependencies are installed: `npm install`
- Check for any console errors in browser developer tools
- Verify Node.js version (recommended: 16+)

### Debug Mode

Enable debug logging by opening browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `SUPABASE_SETUP.md` for detailed setup instructions
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join community discussions for support

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile App (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] Integration with EHR systems
- [ ] Multi-language support
- [ ] Offline mode capabilities
- [ ] Advanced reporting features

---

**EarlyVue** - Making ASD screening accessible, accurate, and actionable for families and healthcare providers worldwide.