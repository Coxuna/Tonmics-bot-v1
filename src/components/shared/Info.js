import React from 'react';

const InfoComponent = () => {
  return (
    <div className="flex flex-row justify-between w-full mt-6">
      {/* User Info Section */}
      <div className="rounded-xl text-white w-[40%] h-10 blur-1 flex items-center justify-center">
        <div className="bg w-fit h-fit bg-black mr-4 p-2 px-4">
          <span className="text-black uppercase font-semibold">A</span>
        </div>
        <span className="text-black uppercase font-semibold">Username</span>
      </div>
      
      {/* Token Section */}
      <div className="rounded-xl text-white w-[45%] flex items-center justify-center h-10">
        <img className="relative -right-6" src="/assets/token.png" alt="Token" />
        <span className="w-fit h-6 bg-black rounded-[-4px] rounded-r-full text-white text-center px-6">
          100.00
        </span>
      </div>
    </div>
  );
};

export default InfoComponent;
