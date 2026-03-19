# 🚍 Amana Transportation

Amana Transportation is a Next.js application for monitoring bus operations and system status. It provides a centralized dashboard that gives a clear overview of what is happening across all buses.

## Features

- Dashboard overview of all buses
- Key metrics such as active buses, maintenance status, and utilization
- Incident tracking to monitor current problems
- Centralized view instead of tracking one bus at a time

## Data and Architecture

The application uses a centralized data file (`lib/data.ts`) to simulate system data, including:

- Overall system status
- Bus activity and utilization
- Active incidents

This data is displayed on the main page (`app/page.tsx`) through a dashboard interface. The structure separates data from UI components, making the app easier to manage and extend.

## Implementation

- Built using **Next.js (App Router)**
- Component-based structure with **React**
- Server-side rendering
- Designed for easy integration with real APIs

## Purpose

This project was built to improve usability by moving from tracking a single bus to providing a complete view of the system.

## Tech Stack

- Next.js
- React
- TypeScript / JavaScript

## Live Demo

[View the deployed app](https://amana-transportation-blond.vercel.app/)
