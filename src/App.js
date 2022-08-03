import logo from './logo.svg';
import './App.css';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import convexConfig from "../convex.json";

const convex = new ConvexReactClient(convexConfig.origin);

function App() {
  return (
    <ConvexProvider client={convex}>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
    </ConvexProvider>
  );
}

export default App;
