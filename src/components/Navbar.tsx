import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full border-b-2 py-3 bg-gray-900 text-white">
      <div className="max-w-screen-2xl mx-auto items-center px-4 lg:flex lg:px-8">
        <div className="flex w-full items-center justify-between">
          <Link to="/">
            <h1 className="ml-8 text-3xl font-bold text-primary cursor-pointer">
              Coldop Dashboard
            </h1>
          </Link>

          <div className="flex justify-center items-center gap-4">
            <div className="relative dropdown">
              {/* Dropdown Trigger */}
              <p className="text-xl cursor-pointer">Welcome, Admin</p>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
