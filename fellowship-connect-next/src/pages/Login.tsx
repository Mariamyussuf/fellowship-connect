import SharedLogin from '../components/common/SharedLogin';
import buccfLogo from '../assets/BUCCF-LOGO.jpg';
import Image from 'next/image';

const Login = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="text-center mb-4">
          <Image 
            src={typeof buccfLogo === 'string' ? buccfLogo : buccfLogo.src} 
            alt="BUCCF Logo" 
            width={80}
            height={80}
            className="mb-3 rounded-full"
            style={{ objectFit: 'cover' }}
          />
          <h1>Fellowship Connect</h1>
        </div>
        <SharedLogin 
          showRegisterLink={false}
          showForgotPasswordLink={false}
          showHomeLink={false}
          title="Login"
        />
      </div>
    </div>
  );
};

export default Login;