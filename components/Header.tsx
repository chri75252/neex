
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-secondary shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1.5a.75.75 0 01.75.75v3.53a3.47 3.47 0 011.666.918l2.9-1.391a.75.75 0 01.968.411l1.5 3.25a.75.75 0 01-.52.962l-2.628.97a3.483 3.483 0 010 1.698l2.628.97a.75.75 0 01.52.962l-1.5 3.25a.75.75 0 01-.968.41l-2.9-1.39a3.472 3.472 0 01-1.666.919V21a.75.75 0 01-1.5 0v-3.53a3.472 3.472 0 01-1.666-.919l-2.9 1.39a.75.75 0 01-.968-.41l-1.5-3.25a.75.75 0 01.52-.962l2.628-.97a3.483 3.483 0 010-1.698L3.3 10.42a.75.75 0 01-.52-.962l1.5-3.25a.75.75 0 01.968-.411l2.9 1.391A3.47 3.47 0 0111.25 5.78V2.25A.75.75 0 0112 1.5zM12 9a3 3 0 100 6 3 3 0 000-6z" />
         </svg>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
          NEEX Legal Contract Review
        </h1>
      </div>
    </header>
  );
};

export default Header;
