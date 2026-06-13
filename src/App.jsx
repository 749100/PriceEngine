import React from 'react';
import Parse from 'parse/dist/parse.min.js';
import PricingDashboard from './dashboard';

// Replace these strings with your actual keys from the Back4App dashboard
const PARSE_APPLICATION_ID = "YOUR_APP_ID_HERE";
const PARSE_HOST_URL = "https://parseapi.back4app.com/";
const PARSE_JAVASCRIPT_KEY = "YOUR_JS_KEY_HERE";

Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default function App() {
  return (
    <PricingDashboard />
  );
}