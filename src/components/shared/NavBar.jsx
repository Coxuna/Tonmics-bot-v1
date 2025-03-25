import { NavLink, useLocation, Navigate, useNavigate } from "react-router";
import { useEffect } from "react";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/Home" },
    { name: "Farm", path: "/Farm" },
    { name: "Game", path: "/Game/" },
    { name: "Books", path: "/Book" },
  ];
  
  // Example of a programmatic redirect based on a condition
  useEffect(() => {
    // Example condition - redirect if user is on the root path
    if (location.pathname === "/") {
      navigate("/Home");
    }
    
    // You could also check for other conditions like:
    // - User authentication status
    // - Access permissions
    // - Deprecated routes
  }, [location.pathname, navigate]);

  // An alternative approach is to use the Navigate component
  // You can place this inside your return to handle declarative redirects
  if (location.pathname === "/old-route") {
    return <Navigate to="/Home" replace />;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex w-full max-w-screen-xl mx-auto">
        <div className="w-full flex border-t-4 border-black bg-[#FAA31E] shadow-lg">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex-1 h-14 flex justify-center items-center 
                 border-r-4 border-black last:border-r-0 
                 text-sm sm:text-base md:text-lg 
                 uppercase font-bold 
                 transition-all duration-300 
                 ${isActive ? "bg-[#50C42F]" : "bg-transparent"}`
              }
              style={{ fontFamily: "Adventure" }}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}