import { useState } from "react";
import { FaFacebook, FaGithub, FaGoogle, FaLinkedin } from "react-icons/fa";

const LoginSignup = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleForm = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-r from-gray-200 to-indigo-200">
      <div
        className={`bg-white rounded-3xl shadow-lg relative overflow-hidden w-full max-w-[1080px] min-h-[720px] ${
          isActive ? "active" : ""
        }`}
      >
        {/* Sign Up Form */}
        <div
          className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 ${
            isActive ? "translate-x-full opacity-100 z-50" : "opacity-0 z-10"
          }`}
        >
          <form className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <h1 className="text-2xl font-bold mb-4">Create Account</h1>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="icon">
                <FaGoogle className="text-gray-600 hover:text-blue-600" />
              </a>
              <a href="#" className="icon">
                <FaFacebook className="text-gray-600 hover:text-blue-600" />
              </a>
              <a href="#" className="icon">
                <FaGithub className="text-gray-600 hover:text-blue-600" />
              </a>
              <a href="#" className="icon">
                <FaLinkedin className="text-gray-600 hover:text-blue-600" />
              </a>
            </div>
            <span className="text-sm mb-4">
              or use your email for registration
            </span>
            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 mb-4 bg-gray-100 rounded-lg outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 mb-4 bg-gray-100 rounded-lg outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 bg-gray-100 rounded-lg outline-none"
            />
            <button className="w-full bg-indigo-700 text-white py-2 rounded-lg font-semibold">
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div
          className={`absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-20 ${
            isActive ? "translate-x-full" : ""
          }`}
        >
          <form className="bg-white flex items-center justify-center flex-col px-10 h-full">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="icon">
                <FaGoogle className="text-gray-600 hover:text-blue-600" />
              </a>
              <a href="#" className="icon">
                <FaFacebook className="text-gray-600 hover:text-blue-600" />
              </a>
              <a href="#" className="icon">
                <FaGithub className="text-gray-600 hover:text-blue-600" />
              </a>
              <a href="#" className="icon">
                <FaLinkedin className="text-gray-600 hover:text-blue-600" />
              </a>
            </div>
            <span className="text-sm mb-4">or use your email password</span>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 mb-4 bg-gray-100 rounded-lg outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 mb-4 bg-gray-100 rounded-lg outline-none"
            />
            <a href="#" className="text-sm text-gray-600 mb-4">
              Forgot Your Password?
            </a>
            <button className="w-full bg-indigo-700 text-white py-2 rounded-lg font-semibold">
              Sign In
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out ${
            isActive
              ? "-translate-x-full rounded-r-[150px]"
              : "rounded-l-[150px]"
          }`}
        >
          <div
            className={`bg-gradient-to-r from-indigo-600 to-blue-600 h-full text-white relative -left-full w-[200%] transform transition-all duration-600 ease-in-out ${
              isActive ? "translate-x-1/2" : ""
            }`}
          >
            {/* Toggle Left Panel */}
            <div
              className={`absolute w-1/2 h-full flex items-center justify-center flex-col px-8 text-center transform transition-all duration-600 ease-in-out ${
                isActive ? "translate-x-0" : "-translate-x-[200%]"
              }`}
            >
              <h1 className="text-2xl font-bold">Welcome Back!</h1>
              <p className="text-sm mt-2">
                Enter your personal details to use all of site features
              </p>
              <button
                onClick={toggleForm}
                className="mt-4 bg-transparent border border-white text-white py-2 px-6 rounded-lg font-semibold"
              >
                Sign In
              </button>
            </div>

            {/* Toggle Right Panel */}
            <div
              className={`absolute right-0 w-1/2 h-full flex items-center justify-center flex-col px-8 text-center transform transition-all duration-600 ease-in-out ${
                isActive ? "translate-x-[200%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-2xl font-bold">Hello, Friend!</h1>
              <p className="text-sm mt-2">
                Register with your personal details to use all of site features
              </p>
              <button
                onClick={toggleForm}
                className="mt-4 bg-transparent border border-white text-white py-2 px-6 rounded-lg font-semibold"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
