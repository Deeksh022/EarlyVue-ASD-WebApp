import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';

const FindSpecialist = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    specialty: '',
    location: '',
    insurance: '',
    availability: ''
  });

  const specialties = [
    'Developmental Pediatrician',
    'Child Psychologist',
    'Speech-Language Pathologist',
    'Occupational Therapist',
    'Behavioral Therapist',
    'Neurologist'
  ];

  const mockSpecialists = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Developmental Pediatrician',
      location: 'Downtown Medical Center',
      distance: '2.3 miles',
      rating: 4.9,
      reviews: 127,
      availability: 'Next available: Tomorrow',
      insurance: ['Blue Cross', 'United Healthcare', 'Aetna']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Child Psychologist',
      location: 'Children\'s Development Clinic',
      distance: '3.1 miles',
      rating: 4.8,
      reviews: 89,
      availability: 'Next available: Friday',
      insurance: ['Cigna', 'Humana', 'Medicare']
    },
    {
      id: 3,
      name: 'Lisa Rodriguez, SLP',
      specialty: 'Speech-Language Pathologist',
      location: 'Speech & Language Center',
      distance: '1.8 miles',
      rating: 4.9,
      reviews: 156,
      availability: 'Next available: Today',
      insurance: ['Blue Cross', 'United Healthcare', 'Aetna', 'Cigna']
    }
  ];

  const handleFilterChange = (e) => {
    setSearchFilters({
      ...searchFilters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a search API call
    console.log('Searching with filters:', searchFilters);
  };

  return (
    <div className="find-specialist-page">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <button
              className="btn btn-outline back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
            <h1>Find a Specialist</h1>
            <p>Connect with healthcare professionals who can support your child's development</p>
          </div>

          <div className="search-section">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="specialty">Specialty</label>
                  <select
                    id="specialty"
                    name="specialty"
                    value={searchFilters.specialty}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty, index) => (
                      <option key={index} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={searchFilters.location}
                    onChange={handleFilterChange}
                    placeholder="City, State or ZIP"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="insurance">Insurance</label>
                  <select
                    id="insurance"
                    name="insurance"
                    value={searchFilters.insurance}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Insurance</option>
                    <option value="blue-cross">Blue Cross Blue Shield</option>
                    <option value="united">United Healthcare</option>
                    <option value="aetna">Aetna</option>
                    <option value="cigna">Cigna</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary search-btn">
                Search Specialists
              </button>
            </form>
          </div>

          <div className="results-section">
            <h2>Available Specialists</h2>
            <div className="specialists-list">
              {mockSpecialists.map((specialist) => (
                <div key={specialist.id} className="specialist-card">
                  <div className="specialist-info">
                    <div className="specialist-header">
                      <h3>{specialist.name}</h3>
                      <div className="rating">
                        <span className="stars">⭐⭐⭐⭐⭐</span>
                        <span className="rating-text">{specialist.rating} ({specialist.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="specialist-details">
                      <p className="specialty">{specialist.specialty}</p>
                      <p className="location">📍 {specialist.location} ({specialist.distance})</p>
                      <p className="availability">🗓️ {specialist.availability}</p>
                      <div className="insurance">
                        <span>Insurance: </span>
                        {specialist.insurance.map((ins, index) => (
                          <span key={index} className="insurance-tag">{ins}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="specialist-actions">
                    <button className="btn btn-primary">Book Appointment</button>
                    <button className="btn btn-outline">View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindSpecialist;