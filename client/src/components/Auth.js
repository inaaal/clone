import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../api';

// ========== ВСЕ СТРАНЫ ==========
const COUNTRIES = [
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+420', name: 'Czech', flag: '🇨🇿' },
  { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+40', name: 'Romania', flag: '🇷🇴' },
  { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: '+966', name: 'Saudi', flag: '🇸🇦' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+98', name: 'Iran', flag: '🇮🇷' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+82', name: 'Korea', flag: '🇰🇷' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+375', name: 'Belarus', flag: '🇧🇾' },
  { code: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+995', name: 'Georgia', flag: '🇬🇪' },
  { code: '+374', name: 'Armenia', flag: '🇦🇲' },
  { code: '+373', name: 'Moldova', flag: '🇲🇩' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+888', name: 'Global', flag: '🌍' },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+670', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: '+691', name: 'Micronesia', flag: '🇫🇲' },
  { code: '+692', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+674', name: 'Nauru', flag: '🇳🇷' },
  { code: '+676', name: 'Tonga', flag: '🇹🇴' },
  { code: '+677', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+679', name: 'Fiji', flag: '🇫🇯' },
  { code: '+680', name: 'Palau', flag: '🇵🇼' },
  { code: '+681', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: '+682', name: 'Cook Islands', flag: '🇨🇰' },
  { code: '+683', name: 'Niue', flag: '🇳🇺' },
  { code: '+685', name: 'Samoa', flag: '🇼🇸' },
  { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+687', name: 'New Caledonia', flag: '🇳🇨' },
  { code: '+688', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+689', name: 'French Polynesia', flag: '🇵🇫' },
  { code: '+690', name: 'Tokelau', flag: '🇹🇰' },
];

function Auth({ onLogin }) {
  const [step, setStep] = useState('phone');
  const [countryCode, setCountryCode] = useState('+7');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const codeInputRef = useRef(null);
  const countryCodeInputRef = useRef(null);

  useEffect(() => {
    if (step === 'phone' && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
    if (step === 'code' && codeInputRef.current) {
      setTimeout(() => codeInputRef.current.focus(), 100);
    }
  }, [step]);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.includes(searchTerm)
  );

  const selectCountry = (code) => {
    setCountryCode(code);
    setSearchTerm('');
    setShowCountryDropdown(false);
    setIsCodeFocused(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const getFlag = (code) => {
    const country = COUNTRIES.find(c => c.code === code);
    return country ? country.flag : '🌍';
  };

  const sendCode = async () => {
    const fullPhone = countryCode + phone.replace(/\D/g, '');
    if (fullPhone.length < 10) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await auth.sendCode(fullPhone);
      if (res.data.success) {
        setStep('code');
        alert(`Code: ${res.data.code}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    const fullPhone = countryCode + phone.replace(/\D/g, '');
    if (code.length < 4) {
      setError('Enter 4-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await auth.verifyCode(fullPhone, code);
      if (res.data.success) {
        setStep('name');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    }
    setLoading(false);
  };

  const register = async () => {
    const fullPhone = countryCode + phone.replace(/\D/g, '');
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await auth.register({
        phone: fullPhone,
        name: name.trim(),
        user_type: 'client',
      });
      if (res.data.success) {
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration error');
    }
    setLoading(false);
  };

  const login = async () => {
    const fullPhone = countryCode + phone.replace(/\D/g, '');
    if (fullPhone.length < 10) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await auth.login(fullPhone);
      if (res.data.success) {
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'User not found');
    }
    setLoading(false);
  };

  // Обработка ввода кода страны вручную
  const handleCountryCodeInput = (e) => {
    let value = e.target.value;
    if (value === '') {
      setCountryCode('+');
      return;
    }
    if (!value.startsWith('+')) {
      value = '+' + value.replace(/[^0-9]/g, '');
    }
    setCountryCode(value);
    setIsCodeFocused(true);
    setShowCountryDropdown(false);
  };

  const handleCountryCodeBlur = () => {
    setIsCodeFocused(false);
    if (countryCode === '+' || countryCode === '') {
      setCountryCode('+7');
    }
  };

  // Фокус на поле кода страны при клике
  const focusCountryCode = () => {
    setIsCodeFocused(true);
    setTimeout(() => {
      if (countryCodeInputRef.current) {
        countryCodeInputRef.current.focus();
        countryCodeInputRef.current.select();
      }
    }, 50);
  };

  // Открыть дропдаун при клике на стрелку или флаг
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowCountryDropdown(!showCountryDropdown);
    if (!showCountryDropdown) {
      setSearchTerm('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🔐</div>
        <h1>Clone</h1>
        <p className="subtitle">End-to-End Encrypted</p>

        {step === 'phone' ? (
          <>
            <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
            <p className="subtitle">Enter your phone number</p>

            <div className="phone-input-container">
              <div className="country-selector" ref={dropdownRef}>
                <div className="country-selector-trigger">
                  {!isCodeFocused ? (
                    <div className="country-display">
                      <span className="country-flag" onClick={toggleDropdown}>
                        {getFlag(countryCode)}
                      </span>
                      <span className="country-code-display" onClick={focusCountryCode}>
                        {countryCode}
                      </span>
                      <span className="country-dropdown-arrow" onClick={toggleDropdown}>
                        ▾
                      </span>
                    </div>
                  ) : (
                    <div className="country-code-edit">
                      <input
                        ref={countryCodeInputRef}
                        type="text"
                        className="country-code-input-edit"
                        value={countryCode}
                        onChange={handleCountryCodeInput}
                        onBlur={handleCountryCodeBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCountryCodeBlur();
                            if (inputRef.current) inputRef.current.focus();
                          }
                        }}
                        placeholder="+"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {showCountryDropdown && (
                  <div className="country-dropdown">
                    <div className="country-dropdown-search">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="country-dropdown-list">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c, i) => (
                          <div
                            key={i}
                            className={`country-dropdown-item ${c.code === countryCode ? 'active' : ''}`}
                            onClick={() => selectCountry(c.code)}
                          >
                            <span className="country-flag">{c.flag}</span>
                            <span className="country-name">{c.name}</span>
                            <span className="country-code">{c.code}</span>
                          </div>
                        ))
                      ) : (
                        <div className="country-dropdown-empty">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={inputRef}
                type="tel"
                className="phone-input-field"
                placeholder="999 123-45-67"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && (isLogin ? login : sendCode)}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button onClick={isLogin ? login : sendCode} disabled={loading}>
              {loading ? '...' : isLogin ? 'Sign In' : 'Next'}
            </button>

            <p className="toggle-mode" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'No account? Sign Up' : 'Already have an account? Sign In'}
            </p>
          </>
        ) : step === 'code' ? (
          <>
            <h2>Verification Code</h2>
            <p className="subtitle">Sent to {countryCode + phone}</p>
            <input
              ref={codeInputRef}
              type="text"
              placeholder="_ _ _ _"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              maxLength="4"
              className="code-input"
              onKeyDown={e => e.key === 'Enter' && verifyCode}
            />
            {error && <div className="error">{error}</div>}
            <button onClick={verifyCode} disabled={loading || code.length < 4}>
              {loading ? '...' : 'Confirm'}
            </button>
            <button className="back-btn" onClick={() => setStep('phone')}>Back</button>
          </>
        ) : (
          <>
            <h2>Your Name</h2>
            <p className="subtitle">What should we call you?</p>
            <input
              type="text"
              placeholder="Alex"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && register}
            />
            {error && <div className="error">{error}</div>}
            <button onClick={register} disabled={loading || !name.trim()}>
              {loading ? '...' : 'Continue'}
            </button>
            <button className="back-btn" onClick={() => setStep('phone')}>Back</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;