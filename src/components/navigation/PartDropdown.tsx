import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Arrow } from "@/components/assets/svg/Arrow";
import { useRouter } from 'next/router';
import Revenue from "../assets/icons/revenue.svg";
import { useAppContext } from '../context/AppContext';

export const PartDropdown = () => {
  // const { getNavSidebarOpen, toggleNavSidebar, setNavSidebarOpen } = useAppContext();
  // const dropDownOpen = getNavSidebarOpen();
  const { toggleNavSidebar, isNavSidebarOpen } = useAppContext();
  const dropDownOpen = isNavSidebarOpen("partDropdown");
  const router = useRouter();

  const pathnames = [
    "/dashboard/partnerships/deals",
    "/dashboard/partnerships/campaigns",
    "/dashboard/partnerships/projects",
  ];

    // useEffect(() => {
  //   if (!pathnames.includes(router.pathname)) {
  //     setNavSidebarOpen(false)
  //   }
  // }, [router.pathname])

  useEffect(() => {
    const shouldKeepOpen = pathnames.some(path => router.pathname.startsWith(path));
    if (shouldKeepOpen !== dropDownOpen) {
      toggleNavSidebar("partDropdown");
    }
  }, [router.pathname]);

  return (
    <div className={`dropdown ${dropDownOpen ? 'open' : ''}`}>

      <button
        onClick={() => toggleNavSidebar("partDropdown")}
        className={
          `navlink-wrap drop-navlink 
          ${dropDownOpen && pathnames.includes(router.pathname) ? 'active-link' : ''}`
        }
      >
        <div className='row-wrap' style={{ color: "white" }}>
          <Image src={Revenue} alt="Icon" width={20} height={20} />
          Partnerships
        </div>
        <Arrow className={`white-fill ${dropDownOpen ? '' : 'arrow-down'}`} />
      </button>

      {dropDownOpen &&
        <div className={`dropdown-menu ${dropDownOpen ? 'open' : ''}`}>
          <div className='drop-line'></div>
          <div className="drop-links">
            <Link
              href={pathnames[0]}
              className={`droplink-wrap ${router.pathname == pathnames[0] ? "drop-active-link" : ""}`}
            >
              <div>Deals</div>
            </Link>

            <Link
              href={pathnames[1]}
              className={`droplink-wrap ${router.pathname == pathnames[1] ? "drop-active-link" : ""}`}
            >
              <div>Campaigns</div>
            </Link>

            <Link
              href={pathnames[2]}
              className={`droplink-wrap ${router.pathname == pathnames[2] ? "drop-active-link" : ""}`}
            >
              <div>Projects</div>
            </Link>

          </div>

        </div>
      }
    </div>
  );
};

export default PartDropdown;

