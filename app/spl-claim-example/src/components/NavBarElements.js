import { NavLink as Link } from 'react-router-dom';
import styled from 'styled-components';

export const Nav = styled.nav`
  background: #9999cc;
  height: 30px;
  display: flex;
  justify-content: space-between;
  z-index: 12;
  padding: 1rem;
  /* Third Nav */
  /* justify-content: flex-start; */
`;

export const NavLink = styled(Link)`
  color: #ffffff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  &.active {
    /* color: #000000; */
    text-decoration: underline;
  }
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  margin-right: -5rem;
  width:  87%;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const NavBtn = styled.nav`
  display: flex;
  align-items: center;
  margin-right: 24px;
  /* Third Nav */
  /* justify-content: flex-end;
  width: 100vw; */
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const NavBtnLink = styled(Link)`
  border-radius: 4px;
  background: #808080;
  padding: 10px 22px;
  color: #ffffff;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  /* Second Nav */
  margin-left: 24px;
  &:hover {
    transition: all 0.2s ease-in-out;
    background: #fff;
    color: #808080;
  }
`;
