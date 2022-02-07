import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VirtualShelfList from './VirtualShelfList';
import BooksList from './BooksList';


import App from './App';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<VirtualShelfList />} />
      <Route path="/:id/books" element={<BooksList />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);

