import React from 'react';

function NavLink({ onClick, text }) {
    return (
        <p onClick={onClick} className="navlink">{text}</p>
    );
}
export default NavLink;