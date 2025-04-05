import React from "react";

export default function HomeLayout({ children }) {
  // CSS Styles with improved responsive design
  const styles = `
    .box {
      box-shadow: 2px 10px 2px 0px black;
    }
    .box-red {
      box-shadow: 2px 10px 2px 0px red;
    }
    .triangle-basic {
      width: 0;
      height: 0;
      border-left: 25px solid transparent;
      border-right: 25px solid transparent;
      border-bottom: 50px solid white;
    }
    .boxcustom {
      box-shadow: 1px 0px 50px 1px rgba(255, 255, 255, 0.411);
    }
    .card {
      display: flex;
      background-color: #18325B;
      box-shadow: 2px 10px 0px 0px black;
      border-radius: 4px;
      align-items: center;
      transition: transform 0.2s ease;
      padding: 1rem;
    }
    .card:hover {
      transform: translateY(-2px);
    }
    .card img {
      width: 24px;
      height: 24px;
      margin-right: 8px;
    }
    .card span {
      padding: 8px 4px;
      font-weight: 600;
    }
  
    /* Responsive adjustments */
    @media (max-width: 640px) {
      .card {
        padding: 0.5rem;
        font-size: 0.875rem;
      }
      .card img {
        width: 20px;
        height: 20px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      {children}
    </>
  );
}
