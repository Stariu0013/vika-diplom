import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// This is a simple test component
const TestComponent = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is a test component</p>
    </div>
  );
};

describe('TestComponent', () => {
  it('renders the component correctly', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );
    
    // Check if the heading is in the document
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    
    // Check if the paragraph is in the document
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });
});